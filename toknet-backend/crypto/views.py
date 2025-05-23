from base64 import b64encode
import io
import pyotp
import qrcode
from datetime import time, timezone
import threading
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404
from .serializers import ExchangeOrderSerializer, KYCSubmissionSerializer, RegisterSerializer, CustomTokenObtainPairSerializer, UserSerializer
from .models import CryptoCurrency, CustomUser, ExchangeOrder
from django.http import JsonResponse
import requests
import time
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.cache import cache

class ProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        data = request.data.copy()
        profile_picture = request.FILES.get('profile_picture')
        if profile_picture:
            user.profile_picture = profile_picture
        serializer = UserSerializer(user, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
        
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        self.perform_create(serializer)
        return Response({"detail": "User registered successfully."}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def user_detail(request, user_id):
    user = get_object_or_404(CustomUser, id=user_id)
    serializer = UserSerializer(user)
    return Response(serializer.data)

class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        password = request.data.get("password")
        code = request.data.get("code")

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({"error": "Invalid credentials"}, status=401)

        if not user.check_password(password):
            return Response({"error": "Invalid credentials"}, status=401)

        if user.is_2fa_enabled:
            if not code:
                return Response({"requires_2fa": True}, status=200)

            totp = pyotp.TOTP(user.totp_secret)
            if not totp.verify(code):
                return Response({"error": "Invalid 2FA code"}, status=401)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=200)
            
def get_crypto_data(request):
    CryptoCurrency.initialize_defaults()
    
    cached_data = cache.get('crypto_prices')
    if cached_data:
        return JsonResponse(cached_data, safe=False)
    
    cryptos = CryptoCurrency.objects.all()
    if not cryptos.exists():
        return JsonResponse([], safe=False)
    
    ids = ','.join([crypto.coingecko_id for crypto in cryptos if crypto.coingecko_id])

    try:
        url = "https://api.coingecko.com/api/v3/simple/price"
        params = {
            'ids': ids,
            'vs_currencies': 'usd',
            'include_24hr_change': 'true',
        }

        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        result = []
        update_needed = False

        for crypto in cryptos:
            if crypto.coingecko_id in data:
                price_info = data[crypto.coingecko_id]
                new_price = price_info.get('usd', 0)
                new_change = price_info.get('usd_24h_change', 0)
                
                if abs(crypto.price - new_price) > 0.01 or abs(crypto.price_change_24h - new_change) > 0.1:
                    crypto.price = new_price
                    crypto.price_change_24h = new_change
                    crypto.save()
                    update_needed = True
                
                result.append({
                    'name': crypto.name,
                    'symbol': crypto.symbol,
                    'price': crypto.price,
                    'price_change_24h': crypto.price_change_24h,
                })

        if result:
            cache.set('crypto_prices', result, timeout=60)
            return JsonResponse(result, safe=False)
        
        return JsonResponse([], safe=False)
            
    except requests.RequestException as e:
        print(f"Error fetching from CoinGecko: {str(e)}")
        result = [{
            'name': crypto.name,
            'symbol': crypto.symbol,
            'price': crypto.price,
            'price_change_24h': crypto.price_change_24h,
        } for crypto in cryptos]
        return JsonResponse(result, safe=False)
        
@api_view(['GET', 'PUT'])
@parser_classes([MultiPartParser, FormParser])
def profile_view(request):
    user = request.user

    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_qr_code(request):
    user = request.user

    if not user.totp_secret:
        user.totp_secret = pyotp.random_base32()
        user.save()

    totp = pyotp.TOTP(user.totp_secret)
    uri = totp.provisioning_uri(name=user.email, issuer_name="Toknet")

    img = qrcode.make(uri)
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    qr_code_base64 = b64encode(buffer.getvalue()).decode()

    return Response({
        "qr_code_url": f"data:image/png;base64,{qr_code_base64}"
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_2fa(request):
    user = request.user
    code = request.data.get("code")
    if not code:
        return Response({"error": "Code is required"}, status=400)

    if not user.totp_secret:
        return Response({"error": "2FA not initialized"}, status=400)

    totp = pyotp.TOTP(user.totp_secret)
    if totp.verify(code):
        user.is_2fa_enabled = True
        user.save()
        return Response({"message": "2FA successfully enabled"})
    else:
        return Response({"error": "Invalid code"}, status=400)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def disable_2fa(request):
    user = request.user
    user.is_2fa_enabled = False
    user.totp_secret = None
    user.save()
    return Response({"message": "2FA отключена."})

@api_view(['POST'])
@permission_classes([AllowAny])
def check_2fa_enabled(request):
    email = request.data.get('email')
    if not email:
        return Response({"error": "Email is required"}, status=400)

    try:
        user = CustomUser.objects.get(email=email)
        return Response({"is_2fa_enabled": user.is_2fa_enabled})
    except CustomUser.DoesNotExist:
        return Response({"is_2fa_enabled": False})
    
@api_view(['GET', 'PUT'])
@parser_classes([MultiPartParser, FormParser])
def profile_view(request):
    user = request.user

    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_kyc(request):
    serializer = KYCSubmissionSerializer(data=request.data)
    if serializer.is_valid():
        user = request.user

        user.kyc_submitted = True
        user.save()

        print("KYC Submission Received")
        print(serializer.validated_data)

        return Response({"message": "KYC submission received", "kyc_submitted": True})

    return Response(serializer.errors, status=400)

def startStatusPolling(order_id):
    interval = 100
    while True:
        order = ExchangeOrder.objects.get(order_id=order_id)
        if order.status == 'completed':
            print(f"Order {order_id} has been completed.")
            break
        time.sleep(interval)
        
class ExchangeCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ExchangeOrderSerializer(data=request.data)
        if serializer.is_valid():
            order = serializer.save(user=request.user)

            try:
                polling_thread = threading.Thread(target=startStatusPolling, args=(order.order_id,))
                polling_thread.start()
            except Exception as e:
                return Response({'error': f'Polling thread failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({
                'order_id': order.order_id,
                'deposit_address': order.deposit_address,
                'expires_at': order.expires_at
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class OrderStatusView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, order_id):
        order = get_object_or_404(ExchangeOrder, order_id=order_id, user=request.user)
        serializer = ExchangeOrderSerializer(order)
        return Response(serializer.data)

class CompleteOrderView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, order_id):
        order = get_object_or_404(ExchangeOrder, order_id=order_id, user=request.user)
        if order.status != 'pending':
            return Response({'error': 'Order must be in pending status'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        order.status = 'received'
        order.save()
        
        return Response({'status': 'payment received'})
        
class CancelOrderView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, order_id):
        order = get_object_or_404(ExchangeOrder, order_id=order_id, user=request.user)
        if order.status != 'pending':
            return Response({'error': 'Order can only be cancelled in pending status'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        order.status = 'cancelled'
        order.save()
        
        return Response({'status': 'order cancelled'})
    
class ExchangeOrderHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = ExchangeOrder.objects.filter(user=request.user).order_by('-created_at')
        serializer = ExchangeOrderSerializer(orders, many=True)
        return Response(serializer.data)