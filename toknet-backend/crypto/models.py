from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
import uuid
from datetime import timedelta
from django.utils import timezone

class CryptoCurrency(models.Model):
    name = models.CharField(max_length=100)
    symbol = models.CharField(max_length=10)
    coingecko_id = models.CharField(max_length=100, unique=True)
    price = models.FloatField()
    price_change_24h = models.FloatField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.symbol}) - ${self.price}"
    
class CustomUserManager(BaseUserManager):
    def create_user(self, email_or_phone, password=None, **extra_fields):
        if not email_or_phone:
            raise ValueError('The Email or Phone must be set')
        user = self.model(email_or_phone=email_or_phone, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email_or_phone, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email_or_phone, password, **extra_fields)
    
class Wallet(models.Model):
    user = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name='wallets')
    currency = models.CharField(max_length=10)
    currency_name = models.CharField(max_length=100)
    balance = models.DecimalField(max_digits=20, decimal_places=8)
    price_change_24h = models.FloatField(default=0)
    
    def __str__(self):
        return f"{self.user.username}'s {self.currency} wallet"
        
class CustomUser(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email_or_phone = models.CharField(max_length=100, unique=True)
    username = models.CharField(max_length=100, default='NewUser')
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)

    last_seen = models.DateTimeField(null=True, blank=True)

    address = models.TextField(null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)

    show_location = models.BooleanField(default=True)
    show_day_month_birthdate = models.BooleanField(default=True)
    show_year_birthdate = models.BooleanField(default=True)
    kyc_completed = models.BooleanField(default=False)

    transaction_count = models.PositiveIntegerField(default=0)
    lot_quantity = models.PositiveIntegerField(default=0)

    profile_picture = models.ImageField(
        upload_to='profile_pics/',
        null=True,
        blank=True,
        default='profile_pics/default.svg'
    )

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'email_or_phone'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email_or_phone