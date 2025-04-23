from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import RegisterSerializer, CustomTokenObtainPairSerializer, UserSerializer
from .models import CryptoCurrency
from django.http import JsonResponse
import requests

class ProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
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


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    
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