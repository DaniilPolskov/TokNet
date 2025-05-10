import React, { useEffect, useState, useRef } from 'react';
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
  const [transactionData, setTransactionData] = useState(null);
  const hasCreatedOrder = useRef(false);
  
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const amount = parseFloat(searchParams.get('amount'));
  const rate = parseFloat(searchParams.get('rate'));
  const fee = parseFloat(searchParams.get('fee'));

  const depositAddress = 'bc1qwwglf41xfj97f56pe9zehxy4rn97d7a08x18uv';
  const receiveAddress = 'LMRZhk7eE1ub8FT8vzFGX9KCRykhoZBMye';
  const receiveAmount = (amount * rate * (1 - fee)).toFixed(8);

  const [showWithAmount, setShowWithAmount] = useState(false);
  const qrValue = showWithAmount
    ? `bitcoin:${depositAddress}?amount=${parseFloat(amount).toFixed(8)}`
    : depositAddress;

    useEffect(() => {
      const storageKey = `order_created_${from}_${to}_${amount}`;
    
      if (sessionStorage.getItem(storageKey)) return;
    
      sessionStorage.setItem(storageKey, 'true');
    
      const createOrder = async () => {
        try {
          const token = localStorage.getItem('access_token');
          if (!token) throw new Error('Нет токена доступа');
    
          const response = await fetch(`${process.env.REACT_APP_API_URL}/exchange/create/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              from_currency: from,
              to_currency: to,
              amount,
              rate,
              fee,
              receive_address: receiveAddress,
              deposit_address: depositAddress
            })
          });
    
          if (!response.ok) {
            const text = await response.text();
            console.error("Ошибка от сервера:", text);
            throw new Error(`Ошибка от сервера: ${text}`);
          }
    
          const data = await response.json();
          console.log('Ответ от сервера:', data);
          setTransactionData(data);
          setOrderId(data.order_id || Math.random().toString(36).substring(2, 18));
          setIsLoading(false);
    
        } catch (error) {
          console.error("Ошибка при создании ордера:", error);
        }
      };
    
      createOrder();
    }, [from, to, amount, rate, fee, receiveAddress]);

  useEffect(() => {
    if (!isLoading && timeLeft > 0 && stepPhase !== 'completed') {
      const interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timeLeft === 0) {
      navigate('/order-cancelled');
    }
  }, [timeLeft, isLoading, navigate, stepPhase]);

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
      }, 5000);
      return () => clearTimeout(timer);
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

  if (isLoading) {
    return (
      <div className="exchange-loader">
        <div className="loader-box">
          <p className="loader-text">Создание сделки...</p>
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
          <div className="success-message">Средства успешно получены!</div>
        </div>
      )}

      {stepPhase === 'confirmation' ? (
        <div className="confirmation-box">
          <div className="confirmation-phase">
            <div className="spinner"></div>
            <div className="confirmation-text">
              Ожидаем поступление средств...<br />
              Как только транзакция появится в сети, вы автоматически перейдёте к следующему шагу.
            </div>
          </div>
        </div>
      ) : showStep3 ? (
        <div className="completed-box">
          <div className="completed-phase">
            <h2 className="completed-title">Средства получены</h2>
            <p className="completed-text">
              Ваш перевод успешно получен. Ожидайте завершения обработки транзакции.
            </p>
            <div className="order-info">
              <div className="info-row">
                <span>Ордер:</span>
                <span className="info-value">#{orderId}</span>
              </div>
              <div className="info-row">
                <span>Сумма:</span>
                <span className="info-value">{amount} {from}</span>
              </div>
              <div className="info-row">
                <span>Получено:</span>
                <span className="info-value">{receiveAmount} {to}</span>
              </div>
            </div>
            <button className="support-btn">Перейти в профиль</button>
          </div>
        </div>
      ) : (
        <div className="exchange-2-box">
          <div className="exchange-2-left">
            <div className="step-indicator">
              <span className={`step ${stepPhase === 'deposit' ? 'active' : ''}`}>Ожидание депозита</span>
              <span className={`step ${stepPhase === 'confirmation' ? 'active' : ''}`}>Ожидание получение средств</span>
              <span className="step">Отправка средств на ваш адрес</span>
            </div>

            <label>Отправьте сумму по этому адресу (ERC20):</label>
            <div className="copy-box">
              <span>{depositAddress}</span>
              <button onClick={() => copyToClipboard(depositAddress)}>
                <img src={CopyIcon} alt="Скопировать" className="copy-icon" />
              </button>
            </div>

            <div className="row">
              <div className="copy-box">
                <span>{receiveAmount} {to}</span>
                <button onClick={() => copyToClipboard(receiveAmount)}>
                  <img src={CopyIcon} alt="Скопировать" className="copy-icon" />
                </button>
              </div>
              <div className="currency">Валюта: {to}</div>
            </div>

            <div className="instruction">
              Отправьте указанную сумму на кошелёк одним платежом. После появления транзакции в сети, ордер автоматически перейдёт к следующему шагу. Вы можете отправить сумму, отличающуюся от указанной.
            </div>

            <div className="support-note">
              В случае каких-либо вопросов, обращайтесь в поддержку.
            </div>

            <label>Ваши реквизиты (LTC):</label>
            <div className="info-box">{receiveAddress}</div>

            <div className="rate-info">
              Учитывайте комиссию за перевод + комиссию вашего аккаунта. Комиссия вашего аккаунта: 2%
            </div>
          </div>

          <div className="exchange-2-right">
            <QRCodeCanvas value={qrValue} className="qr-code" />
            {showWithAmount ? (
              <button className="qr-button" onClick={() => setShowWithAmount(false)}>
                Показать QR без суммы
              </button>
            ) : (
              <button className="qr-button" onClick={() => setShowWithAmount(true)}>
                Показать QR с суммой
              </button>
            )}
            <div className="order-id">Ордер #{orderId}</div>
            <div className="timer">На оплату: {formatTime(timeLeft)}</div>

            {showConfirmButton && (
              <div className="confirm-section">
                <div className="warning-text">
                  <strong>Внимание!</strong> После нажатия на кнопку вернуться на эту страницу будет невозможно.
                  Нажимая на кнопку, вы подтверждаете, что уже отправили необходимое количество средств на указанный адрес.
                  <br />
                </div>
                <button className="confirm-btn" onClick={() => setStepPhase('confirmation')}>
                  Подтвердить отправку
                </button>
              </div>
            )}
            
            <button className="support-btn">🔔 Обратиться в поддержку</button>
            <button className="cancel-btn" onClick={() => navigate('/order-cancelled')}>
              Отменить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}