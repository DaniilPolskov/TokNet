import io
import json
import base64
from datetime import timedelta
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from crypto.models import CryptoCurrency, ExchangeOrder

User = get_user_model()

class BaseTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        
        self.user_data = {
            'email': 'test@example.com',
            'password': 'testpassword123'
        }
        self.user = User.objects.create_user(
            email=self.user_data['email'],
            password=self.user_data['password']
        )
        
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.profile_url = reverse('profile')
        self.exchange_create_url = reverse('create-exchange')
        self.exchange_history_url = reverse('exchange-history')
        
        self.auth_client = APIClient()
        self.auth_client.force_authenticate(user=self.user)


class AuthTests(BaseTestCase):
    def test_user_registration(self):
        data = {
            'email': 'new@example.com',
            'password': 'newpassword123'
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='new@example.com').exists())
        
    def test_user_login(self):
        response = self.client.post(self.login_url, {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)


class ProfileTests(BaseTestCase):
    def test_get_profile_authenticated(self):
        response = self.auth_client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.user_data['email'])
        
    def test_update_profile(self):
        update_data = {
            'username': 'Updated Name',
        }
        response = self.auth_client.put(self.profile_url, update_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, 'Updated Name')


class KYCTests(BaseTestCase):
    def test_kyc_submission(self):
        kyc_url = reverse('submit_kyc')
        data = {
            'email': self.user.email,
            'id_document_front_url': 'https://document/front.jpg',
            'id_document_back_url': 'https://document.com/back.jpg',
            'selfie_url': 'https://document.com/selfie.jpg'
        }
        response = self.auth_client.post(kyc_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.kyc_submitted)


class ExchangeTests(BaseTestCase):
    def setUp(self):
        super().setUp()
        self.order_data = {
            'from_currency': 'BTC',
            'to_currency': 'USDT',
            'amount': '1.0',
            'rate': '50000.0',
            'fee': '0.5',
            'deposit_address': 'test_deposit_address',
            'receive_address': 'test_receive_address'
        }
        
    def test_create_exchange_order(self):
        response = self.auth_client.post(self.exchange_create_url, self.order_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('order_id', response.data)
        self.assertIn('deposit_address', response.data)
        self.assertIn('expires_at', response.data)
        
    def test_get_order_history(self):
        ExchangeOrder.objects.create(
            user=self.user,
            from_currency='BTC',
            to_currency='USDT',
            amount=1.0,
            rate=50000.0,
            fee=0.5,
            deposit_address='test_deposit',
            receive_address='test_receive',
            receive_amount=49750.0,
            status='pending'
        )
        
        response = self.auth_client.get(self.exchange_history_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['from_currency'], 'BTC')
        
    def test_order_status(self):
        order = ExchangeOrder.objects.create(
            user=self.user,
            from_currency='BTC',
            to_currency='USDT',
            amount=1.0,
            rate=50000.0,
            fee=0.5,
            deposit_address='test_deposit',
            receive_address='test_receive',
            receive_amount=49750.0,
            status='pending'
        )
        
        status_url = reverse('order-status', kwargs={'order_id': order.order_id})
        response = self.auth_client.get(status_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'pending')
        
    def test_complete_order(self):
        order = ExchangeOrder.objects.create(
            user=self.user,
            from_currency='BTC',
            to_currency='USDT',
            amount=1.0,
            rate=50000.0,
            fee=0.5,
            deposit_address='test_deposit',
            receive_address='test_receive',
            receive_amount=49750.0,
            status='pending'
        )
        
        complete_url = reverse('complete-order', kwargs={'order_id': order.order_id})
        response = self.auth_client.post(complete_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        order.refresh_from_db()
        self.assertEqual(order.status, 'received')
        
    def test_cancel_order(self):
        order = ExchangeOrder.objects.create(
            user=self.user,
            from_currency='BTC',
            to_currency='USDT',
            amount=1.0,
            rate=50000.0,
            fee=0.5,
            deposit_address='test_deposit',
            receive_address='test_receive',
            receive_amount=49750.0,
            status='pending'
        )
        
        cancel_url = reverse('cancel-order', kwargs={'order_id': order.order_id})
        response = self.auth_client.post(cancel_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        order.refresh_from_db()
        self.assertEqual(order.status, 'cancelled')