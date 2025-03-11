import requests
from django.http import JsonResponse
from .models import CryptoCurrency

def get_crypto_data(request):
    url = "https://api.coingecko.com/api/v3/simple/price"
    params = {
        'ids': 'bitcoin,ethereum,tether',
        'vs_currencies': 'usd',
        'include_24hr_change': 'true',
    }
    response = requests.get(url, params=params)
    
    print("API Response:", response.json())
    
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
        else:
            print(f"Key 'usd' or 'usd_24h_change' not found for {crypto_id}")

    cryptos = CryptoCurrency.objects.all()
    result = [{
        'name': crypto.name,
        'symbol': crypto.symbol,
        'price': crypto.price,
        'price_change_24h': crypto.price_change_24h,
    } for crypto in cryptos]
    return JsonResponse(result, safe=False)