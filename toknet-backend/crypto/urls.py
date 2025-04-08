from django.urls import path
from . import views
from .views import RegisterView, LoginView

urlpatterns = [
    path('crypto-data/', views.get_crypto_data, name='crypto-data'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
]