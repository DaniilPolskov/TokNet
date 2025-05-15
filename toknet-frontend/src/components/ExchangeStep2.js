import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import "./styles/ExchangeStep2.css";
import CopyIcon from '../assets/Copy.svg';

export default function ExchangeStep2() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [orderId, setOrderId] = useState('');
  const [timeLeft, setTimeLeft] = useState(7200);
  const [showConfirmButton, setShowConfirmButton] = useState(false);
  const [stepPhase, setStepPhase] = useState('deposit');
  const [showStep3, setShowStep3] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionError, setTransactionError] = useState(null);
  
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const amount = parseFloat(searchParams.get('amount'));
  const rawRate = parseFloat(searchParams.get('rate') || '0');
  const rate = rawRate.toFixed(8);
  const feeParam = searchParams.get('fee');
  const fee = feeParam !== null
    ? parseFloat(feeParam)
    : parseFloat(localStorage.getItem('fee_rate')) || 0.02;

  const receiveAddress = decodeURIComponent(searchParams.get('receiveAddress') || '');
  const network = searchParams.get('network') || '';

  const getDepositAddress = () => {
    switch(from) {
      case 'BTC': return 'bc1qwwglf41xfj42f56pe9zehxy4rn97d7a08x18uv';
      case 'ETH': return '0x71C7656EC7ab44b098defB751B7401B5f6d8976F';
      case 'USDT': return 'TYDСfVz5YqgZgajXJY8JQx5U7Jv1q1JZ1T';
      default: return 'bc1qwwglf41xfj42f56pe9zehxy4rn97d7a08x18uv';
    }
  };

  const depositAddress = getDepositAddress();
  const receiveAmount = (amount * rawRate * (1 - fee)).toFixed(8);

  const [showWithAmount, setShowWithAmount] = useState(false);
  const qrValue = showWithAmount
    ? `bitcoin:${depositAddress}?amount=${parseFloat(amount).toFixed(8)}`
    : depositAddress;

  const getNetworkName = (currency, net) => {
    if (currency === 'BTC') return 'BTC';
    if (currency === 'ETH') return 'ERC20';
    if (currency === 'USDT') return net === 'TRC20' ? 'TRC20' : 'ERC20';
    return net;
  };
 
  const fromNetwork = getNetworkName(from, network);
  const toNetwork = getNetworkName(to, network);

  const completeOrder = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/exchange/complete/${orderId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to complete order:', errorData);
        throw new Error(errorData.error || 'Failed to complete order');
      }

      const data = await response.json();
      console.log('Order completed:', data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const checkOrderStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/exchange/order/${orderId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'completed' && stepPhase !== 'completed') {
          setStepPhase('completed');
          setShowStep3(true);
        }
      }
    } catch (error) {
      console.error('Ошибка проверки статуса:', error);
    }
  };

  const createOrder = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Нет токена доступа');

      const newOrderId = Math.random().toString(36).substring(2, 10) + 
                        Math.random().toString(36).substring(2, 10);
      console.log('Сгенерирован новый orderId:', newOrderId);
      
      const expiration = new Date(Date.now() + 7200 * 1000);
      const orderData = {
        id: newOrderId,
        phase: 'deposit',
        expiresAt: expiration.toISOString()
      };
      localStorage.setItem('active_order', JSON.stringify(orderData));
      setOrderId(newOrderId);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/exchange/create/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            order_id: newOrderId,
            from_currency: from,
            to_currency: to,
            amount,
            rate,
            fee: parseFloat(fee.toFixed(4)),
            receive_address: receiveAddress,
            deposit_address: depositAddress,
            from_network: fromNetwork,
            to_network: toNetwork
          }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Ошибка сервера: ${text}`);
      }

      const data = await response.json();
      if (data.order_id && data.order_id !== newOrderId) {
        console.log('Сервер вернул новый orderId:', data.order_id);
        orderData.id = data.order_id;
        localStorage.setItem('active_order', JSON.stringify(orderData));
        setOrderId(data.order_id);
      }
      
    } catch (error) {
      console.error("Ошибка при создании ордера:", error);
      setTransactionError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedOrder = localStorage.getItem('active_order');
    if (savedOrder) {
      try {
        const { id, phase, expiresAt } = JSON.parse(savedOrder);
        console.log('Восстановлен orderId из localStorage:', id);
        setOrderId(id);
        setStepPhase(phase || 'deposit');
        const secondsLeft = Math.max(0, Math.floor((new Date(expiresAt) - new Date()) / 1000));
        setTimeLeft(secondsLeft);
        setIsLoading(false);
        return;
      } catch (e) {
        console.error('Ошибка при разборе сохраненного ордера:', e);
      }
    }

    createOrder();
  }, []);

  useEffect(() => {
    if (stepPhase === 'confirmation') {
      const timer = setTimeout(async () => {
        await completeOrder();
        setStepPhase('completed');
        setShowStep3(true);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        localStorage.removeItem('active_order');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [stepPhase]);

  useEffect(() => {
    const interval = setInterval(checkOrderStatus, 10000);
    return () => clearInterval(interval);
  }, [orderId, stepPhase]);

  useEffect(() => {
    if (!isLoading && timeLeft > 0 && stepPhase !== 'completed') {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          const newTimeLeft = prev - 1;
          const order = JSON.parse(localStorage.getItem('currentExchangeOrder') || '{}');
          if (order.orderId) {
            localStorage.setItem('currentExchangeOrder', JSON.stringify({
              ...order,
              timeLeft: newTimeLeft
            }));
          }
          return newTimeLeft;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else if (timeLeft === 0) {
      localStorage.removeItem('currentExchangeOrder');
      navigate('/order-cancelled');
    }
  }, [isLoading, timeLeft, stepPhase]);

  useEffect(() => {
    if (stepPhase === 'deposit') {
      const timer = setTimeout(() => {
        setShowConfirmButton(true);
      }, 10000);
      return () => clearTimeout(timer);
    } else if (stepPhase === 'confirmation') {
      const timer = setTimeout(() => {
        setStepPhase('completed');
        setShowStep3(true);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        localStorage.removeItem('currentExchangeOrder');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [stepPhase]);

  useEffect(() => {
    const saved = localStorage.getItem('active_order');
    if (saved) {
      const parsed = JSON.parse(saved);
      parsed.phase = stepPhase;
      localStorage.setItem('active_order', JSON.stringify(parsed));
    }
  }, [stepPhase]);

  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleCancel = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/exchange/cancel/${orderId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }

      localStorage.removeItem('active_order');
      navigate('/order-cancelled');
    } catch (error) {
      console.error('Ошибка при отмене заказа:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="exchange-loader">
        <div className="loader-box">
          <p className="loader-text">Creating transaction...</p>
        </div>
      </div>
    );
  }

  if (transactionError) {
    return (
      <div className="exchange-loader">
        <div className="error-box">
          <p className="error-text">Transaction creation error: {transactionError}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="exchange-2-wrapper">
      {showSuccess && (
        <div className="success-toast">
          <div className="checkmark-circle">
            <div className="checkmark"></div>
          </div>
          <div className="success-message">Funds received successfully!</div>
        </div>
      )}

      {stepPhase === 'confirmation' ? (
        <div className="confirmation-box">
          <div className="confirmation-phase">
            <div className="spinner"></div>
            <div className="confirmation-text">
              Waiting for funds...<br />
              Once the transaction appears on the network, you will automatically proceed to the next step.
            </div>
          </div>
        </div>
      ) : showStep3 ? (
        <div className="completed-box">
          <div className="completed-phase">
            <h2 className="completed-title">Funds Received</h2>
            <p className="completed-text">
              Your transfer has been received. Please wait while we finalize your transaction.
            </p>
            <div className="order-info">
              <div className="info-row">
                <span>Order:</span>
                <span className="info-value">#{orderId}</span>
              </div>
              <div className="info-row">
                <span>Amount:</span>
                <span className="info-value">{amount} {from}</span>
              </div>
              <div className="info-row">
                <span>Received:</span>
                <span className="info-value">{receiveAmount} {to}</span>
              </div>
            </div>
            <button className="support-btn" onClick={() => navigate('/profile')}>
              Go to Profile
            </button>
          </div>
        </div>
      ) : (
        <div className="exchange-2-box">
          <div className="exchange-2-left">
            <div className="step-indicator">
              <span className={`step ${stepPhase === 'deposit' ? 'active' : ''}`}>Waiting for deposit</span>
              <span className={`step ${stepPhase === 'confirmation' ? 'active' : ''}`}>Waiting for funds</span>
              <span className="step">Sending to your address</span>
            </div>

            <label>Send the amount to this address ({fromNetwork}):</label>
            <div className="copy-box">
              <span>{depositAddress}</span>
              <button onClick={() => copyToClipboard(depositAddress)}>
                <img src={CopyIcon} alt="Copy" className="copy-icon" />
              </button>
            </div>

            <div className="row">
              <div className="copy-box">
                <span>{receiveAmount} {to}</span>
                <button onClick={() => copyToClipboard(receiveAmount)}>
                  <img src={CopyIcon} alt="Copy" className="copy-icon" />
                </button>
              </div>
              <div className="currency">Currency: {to} ({toNetwork})</div>
            </div>

            <div className="instruction">
              Send the specified amount to the wallet in one transaction. Once it appears on the network, you will automatically proceed to the next step. You may send a different amount.
            </div>

            <div className="support-note">
              If you have any questions, please contact support.
            </div>

            <label>Your receiving address ({toNetwork}):</label>
            <div className="info-box">{receiveAddress}</div>

            <div className="rate-info">
              Account and transaction fees are applied. Your account fee: {(fee * 100).toFixed(1)}%
            </div>
          </div>

          <div className="exchange-2-right">
            <QRCodeCanvas value={qrValue} className="qr-code" />
            {showWithAmount ? (
              <button className="qr-button" onClick={() => setShowWithAmount(false)}>
                Show QR without amount
              </button>
            ) : (
              <button className="qr-button" onClick={() => setShowWithAmount(true)}>
                Show QR with amount
              </button>
            )}
            <div className="order-id">Order #{orderId}</div>
            <div className="timer">Time remaining: {formatTime(timeLeft)}</div>

            {showConfirmButton && (
              <div className="confirm-section">
                <div className="warning-text">
                  <strong>Warning!</strong> After confirming, you will not be able to return to this page.
                  By pressing the button, you confirm that you have already sent the required funds to the specified address.
                </div>
                <button className="confirm-btn" onClick={() => setStepPhase('confirmation')}>
                  Confirm Sending
                </button>
              </div>
            )}
            
            <button className="support-btn" onClick={() => navigate('/technical-support')}>
              🔔 Contact Support
            </button>

            <button
              className="cancel-btn"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}