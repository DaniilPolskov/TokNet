from django.urls import path
from . import views
from .views import RegisterView, LoginView, ProfileUpdateView, profile_view, get_qr_code, verify_2fa, disable_2fa, check_2fa_enabled

urlpatterns = [
    path('crypto-data/', views.get_crypto_data, name='crypto-data'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', profile_view, name='profile'),
    path('profile/update/', ProfileUpdateView.as_view(), name='profile-update'),
    path('user/<uuid:user_id>/', views.user_detail, name='user_detail'),
    
    path('2fa/setup/', get_qr_code),
    path('2fa/verify/', verify_2fa),
    path('2fa/disable/', disable_2fa),
    path('2fa/check/', check_2fa_enabled),
]