from datetime import time
import threading
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import ExchangeOrderSerializer, RegisterSerializer, CustomTokenObtainPairSerializer, UserSerializer, WalletSerializer
from .models import CryptoCurrency, CustomUser, ExchangeOrder, Wallet
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
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
def wallet_view(request):
    if not request.user.is_authenticated:
        return Response({'detail': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    wallets = Wallet.objects.filter(user=request.user)
    serializer = WalletSerializer(wallets, many=True)
    return Response(serializer.data)

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

            polling_thread = threading.Thread(target=startStatusPolling, args=(order.order_id,))
            polling_thread.start()

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