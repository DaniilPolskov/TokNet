from django.urls import path
from . import views
from .views import RegisterView, LoginView, ProfileUpdateView

urlpatterns = [
    path('crypto-data/', views.get_crypto_data, name='crypto-data'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileUpdateView.as_view(), name='profile-update'),
    path('profile/update/', ProfileUpdateView.as_view(), name='profile-update'),
    path('user/<uuid:user_id>/', views.user_detail, name='user_detail'),
]