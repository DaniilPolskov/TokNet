from base64 import b64encode
import io
import pyotp
import qrcode
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import RegisterSerializer, CustomTokenObtainPairSerializer, UserSerializer
from .models import CryptoCurrency, CustomUser
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
import requests
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser

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
    cryptos = CryptoCurrency.objects.all()
    ids = ','.join([crypto.coingecko_id for crypto in cryptos])

    url = "https://api.coingecko.com/api/v3/simple/price"
    params = {
        'ids': ids,
        'vs_currencies': 'usd',
        'include_24hr_change': 'true',
    }

    response = requests.get(url, params=params)
    data = response.json()

    result = []

    for crypto in cryptos:
        price_info = data.get(crypto.coingecko_id)
        if price_info:
            crypto.price = price_info.get('usd', 0)
            crypto.price_change_24h = price_info.get('usd_24h_change', 0)
            crypto.save()

            result.append({
                'name': crypto.name,
                'symbol': crypto.symbol,
                'price': crypto.price,
                'price_change_24h': crypto.price_change_24h,
            })

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