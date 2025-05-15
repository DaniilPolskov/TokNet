import pyotp
from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from crypto.models import ExchangeOrder


User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    code = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'code')

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
        )
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        user = User.objects.filter(email=attrs['email']).first()

        if user and user.is_2fa_enabled:
            code = self.context['request'].data.get('code')
            if not code:
                raise serializers.ValidationError("2FA код обязателен.")

            totp = pyotp.TOTP(user.totp_secret)
            if not totp.verify(code):
                raise serializers.ValidationError("Неверный 2FA код.")

        data = super().validate(attrs)
        data['email'] = self.user.email
        return data
        

class KYCSubmissionSerializer(serializers.Serializer):
    email = serializers.EmailField()
    id_document_front_url = serializers.URLField()
    id_document_back_url = serializers.URLField(required=False, allow_blank=True, allow_null=True)
    selfie_url = serializers.URLField()
    
class UserSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(use_url=True, required=False, allow_null=True)

    class Meta:
        model = User
        fields = (
            'email', 'username', 'profile_picture',
            'kyc_submitted', 'transaction_count', 'lot_quantity',
            'is_2fa_enabled'
        )
        read_only_fields = ('email', 'is_2fa_enabled')

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
        return order        
    
    def validate(self, data):
        if data['from_currency'] == data['to_currency']:
            raise serializers.ValidationError("From and To currencies must be different.")
        if data['amount'] <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return data   