from django.urls import path
from . import views

urlpatterns = [
    path('crypto-data/', views.get_crypto_data, name='crypto-data'),
]