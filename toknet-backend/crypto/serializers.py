from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    code = serializers.CharField(required=False)

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
    
class UserSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(use_url=True)

    class Meta:
        model = User
        fields = (
            'username', 'first_name', 'last_name', 'date_of_birth',
            'address', 'profile_picture',
            'show_location', 'show_day_month_birthdate', 'show_year_birthdate',
            'kyc_completed'
        )

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance