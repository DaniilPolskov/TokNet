from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import RegisterSerializer, CustomTokenObtainPairSerializer
from .models import CryptoCurrency
from django.http import JsonResponse
import requests

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
    url = "https://api.coingecko.com/api/v3/simple/price"
    params = {
        'ids': 'bitcoin,ethereum,tether',
        'vs_currencies': 'usd',
        'include_24hr_change': 'true',
    }
    response = requests.get(url, params=params)
    data = response.json()

    for crypto_id, price_data in data.items():
        if 'usd' in price_data and 'usd_24h_change' in price_data:
            crypto, created = CryptoCurrency.objects.get_or_create(
                name=crypto_id.capitalize(),
                symbol=crypto_id.upper(),
                defaults={
                    'price': price_data['usd'],
                    'price_change_24h': price_data['usd_24h_change'],
                }
            )
            if not created:
                crypto.price = price_data['usd']
                crypto.price_change_24h = price_data['usd_24h_change']
                crypto.save()

    cryptos = CryptoCurrency.objects.all()
    result = [{
        'name': crypto.name,
        'symbol': crypto.symbol,
        'price': crypto.price,
        'price_change_24h': crypto.price_change_24h,
    } for crypto in cryptos]
    return JsonResponse(result, safe=False)