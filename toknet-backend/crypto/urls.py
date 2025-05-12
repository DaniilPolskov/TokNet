from django.urls import path
from . import views
from .views import CompleteOrderView, CancelOrderView, ExchangeCreateView, OrderStatusView, RegisterView, LoginView, ProfileUpdateView, profile_view, wallet_view

urlpatterns = [
    path('crypto-data/', views.get_crypto_data, name='crypto-data'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', profile_view, name='profile'),
    path('profile/update/', ProfileUpdateView.as_view(), name='profile-update'),
    path('user/<uuid:user_id>/', views.user_detail, name='user_detail'),
    path('wallets/', wallet_view, name='wallets'),
    path('exchange/create/', ExchangeCreateView.as_view(), name='create-exchange'),
    path('exchange/order/<str:order_id>/', OrderStatusView.as_view(), name='order-status'),
    path('exchange/complete/<str:order_id>/', CompleteOrderView.as_view(), name='complete-order'),
    path('exchange/cancel/<str:order_id>/', CancelOrderView.as_view(), name='cancel-order'),
]