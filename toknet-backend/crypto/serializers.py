from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from crypto.models import Wallet, Transaction, ExchangeOrder


User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    code = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('email_or_phone', 'password', 'code')

    def create(self, validated_data):
        validated_data.pop('code', None)
        user = User.objects.create_user(
            email_or_phone=validated_data['email_or_phone'],
            password=validated_data['password'],
        )
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email_or_phone'] = user.email_or_phone
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['email_or_phone'] = self.user.email_or_phone
        return data
    
class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ('currency', 'currency_name', 'balance', 'price_change_24h')


class UserSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(use_url=True, required=False, allow_null=True)

    class Meta:
        model = User
        fields = (
            'username', 'first_name', 'last_name', 'date_of_birth',
            'address', 'profile_picture',
            'show_location', 'show_day_month_birthdate', 'show_year_birthdate',
            'kyc_completed', 'transaction_count', 'lot_quantity'
            
        )

    def get_is_online(self, obj):
        return obj.is_online()
    
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
    
class ExchangeOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExchangeOrder
        fields = [
            'id', 'user', 'order_id', 'from_currency', 'to_currency',
            'amount', 'rate', 'fee', 'deposit_address', 'receive_address',
            'receive_amount', 'status', 'created_at', 'expires_at'
        ]
        read_only_fields = ('user', 'order_id', 'status', 'created_at', 'expires_at', 'receive_amount')

    def create(self, validated_data):
        order = ExchangeOrder(**validated_data)
        order.receive_amount = order.calculate_receive_amount()
        order.save()
        return order\
        
    def validate(self, data):
        if data['from_currency'] == data['to_currency']:
            raise serializers.ValidationError("From and To currencies must be different.")
        if data['amount'] <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return data   
                        
class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'