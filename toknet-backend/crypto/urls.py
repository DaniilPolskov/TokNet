from django.urls import path
from . import views
from .views import ExchangeOrderHistoryView, RegisterView,  LoginView, ProfileUpdateView, get_qr_code, verify_2fa, disable_2fa, check_2fa_enabled, CompleteOrderView, CancelOrderView, ExchangeCreateView, OrderStatusView, RegisterView, LoginView, ProfileUpdateView, profile_view

urlpatterns = [
    path('crypto-data/', views.get_crypto_data, name='crypto-data'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', profile_view, name='profile'),
    path('profile/update/', ProfileUpdateView.as_view(), name='profile-update'),
    path('profile/kyc/submit', views.submit_kyc, name='submit_kyc'),
    path('user/<uuid:user_id>/', views.user_detail, name='user_detail'),
    
    path('2fa/setup/', get_qr_code),
    path('2fa/verify/', verify_2fa),
    path('2fa/disable/', disable_2fa),
    path('2fa/check/', check_2fa_enabled),
    
    path('exchange/create/', ExchangeCreateView.as_view(), name='create-exchange'),
    path('exchange/history/', ExchangeOrderHistoryView.as_view(), name='exchange-history'),
    path('exchange/order/<str:order_id>/', OrderStatusView.as_view(), name='order-status'),
    path('exchange/complete/<str:order_id>/', CompleteOrderView.as_view(), name='complete-order'),
    path('exchange/cancel/<str:order_id>/', CancelOrderView.as_view(), name='cancel-order'),
]