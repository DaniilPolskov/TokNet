from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
import uuid
from datetime import timedelta
from django.utils import timezone

class CryptoCurrency(models.Model):
    name = models.CharField(max_length=100)
    symbol = models.CharField(max_length=10, unique=True)
    coingecko_id = models.CharField(max_length=100, unique=True)
    price = models.FloatField(default=0)
    price_change_24h = models.FloatField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.symbol}) - ${self.price}"

    @classmethod
    def initialize_defaults(cls):
        """Ensure we have the basic cryptocurrencies in the database"""
        defaults = [
            {'name': 'Bitcoin', 'symbol': 'BTC', 'coingecko_id': 'bitcoin'},
            {'name': 'Ethereum', 'symbol': 'ETH', 'coingecko_id': 'ethereum'},
            {'name': 'Tether', 'symbol': 'USDT', 'coingecko_id': 'tether'},
        ]
        
        for crypto in defaults:
            cls.objects.get_or_create(
                symbol=crypto['symbol'],
                defaults={
                    'name': crypto['name'],
                    'coingecko_id': crypto['coingecko_id']
                }
            )
                
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)
    
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
    
    email = models.EmailField(max_length=100, unique=True)
    username = models.CharField(max_length=100, default='New User')
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)

    date_of_birth = models.DateField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)

    profile_picture = models.ImageField(
        upload_to='profile_pics/',
        null=True,
        blank=True,
        default='profile_pics/default.svg'
    )

    kyc_completed = models.BooleanField(default=False)
    transaction_count = models.PositiveIntegerField(default=0)
    lot_quantity = models.PositiveIntegerField(default=0)

    is_2fa_enabled = models.BooleanField(default=False)
    totp_secret = models.CharField(max_length=32, blank=True, null=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.username} ({self.email})"

class Transaction(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="transactions")
    type = models.CharField(max_length=50)
    amount = models.FloatField()
    currency = models.CharField(max_length=10)
    timestamp = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50)
    note = models.TextField()

    def __str__(self):
        return f"{self.type} {self.amount} {self.currency} ({self.timestamp})"
        return self.email

class ExchangeOrder(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Deposit'),
        ('received', 'Deposit Received'),
        ('processing', 'Processing Exchange'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    order_id = models.CharField(max_length=20, unique=True)
    from_currency = models.CharField(max_length=10)
    to_currency = models.CharField(max_length=10)
    amount = models.DecimalField(max_digits=20, decimal_places=8)
    rate = models.DecimalField(max_digits=20, decimal_places=8)
    fee = models.DecimalField(max_digits=6, decimal_places=4)
    deposit_address = models.CharField(max_length=100)
    receive_address = models.CharField(max_length=100)
    receive_amount = models.DecimalField(max_digits=20, decimal_places=8)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    def save(self, *args, **kwargs):
        if not self.order_id:
            self.order_id = self.generate_order_id()
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(hours=2)
        super().save(*args, **kwargs)
    
    def generate_order_id(self):
        return str(uuid.uuid4().hex)[:16].upper()
    
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    def calculate_receive_amount(self):
        return (self.amount * self.rate) * (1 - self.fee / 100)
    
    def complete(self):
        if self.status == 'received':
            self.status = 'completed'
            self.save()
            return True
        return False
    
class Transaction(models.Model):
    order = models.ForeignKey(ExchangeOrder, on_delete=models.CASCADE)
    tx_hash = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=20, decimal_places=8)
    confirmations = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
