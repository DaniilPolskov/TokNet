import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles/UserLevel.css';

function UserLevel() {
  const [totalTurnover, setTotalTurnover] = useState(0);
  const [userLevel, setUserLevel] = useState(0);
  const [nextLevel, setNextLevel] = useState(1);
  const [amountToNextLevel, setAmountToNextLevel] = useState(0);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const levelsData = [
    { level: 'LVL 0', volume: 0, swap: '2%' },
    { level: 'LVL 1', volume: 100, swap: '1.5%' },
    { level: 'LVL 2', volume: 1000, swap: '1.45%' },
    { level: 'LVL 3', volume: 3000, swap: '1.4%' },
    { level: 'LVL 4', volume: 50000, swap: '1.35%' },
    { level: 'LVL 5', volume: 100000, swap: '1.3%' },
  ];

  const getFeeRate = (level) => {
    const levelInfo = levelsData[level];
    if (!levelInfo) return 0.02;
    return parseFloat(levelInfo.swap) / 100;
  };

  useEffect(() => {
    localStorage.setItem('fee_rate', getFeeRate(userLevel));

    const token = localStorage.getItem('access_token');
    if (!token) return;

    axios
      .post(
        `${process.env.REACT_APP_API_URL}/user/update_fee/`,
        { fee_rate: getFeeRate(userLevel) },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        console.log('Комиссия успешно обновлена');
      })
      .catch((error) => {
        console.error('Ошибка при обновлении комиссии:', error);
      });
  }, [userLevel]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    axios
      .get(`${process.env.REACT_APP_API_URL}/exchange/history/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const transactions = response.data;

        const receivedTransactions = transactions.filter(
          (tx) => tx.status === 'received'
        );

        let total = 0;

        receivedTransactions.forEach((tx) => {
          const fromCurrency = tx.from_currency?.toUpperCase();
          const toCurrency = tx.to_currency?.toUpperCase();

          if (fromCurrency === 'USDT') {
            total += parseFloat(tx.amount) || 0;
          } else if (toCurrency === 'USDT') {
            total += parseFloat(tx.receive_amount) || 0;
          }
        });
        
        setTotalTurnover(total);

        const level = calculateUserLevel(total);
        setUserLevel(level);
        setNextLevel(level + 1);
        calculateProgress(level, total);
        calculateAmountToNextLevel(level, total);
      })
      .catch((error) => {
        console.error('Ошибка при получении данных:', error);
      });
  }, []);

  const calculateUserLevel = (total) => {
    for (let i = levelsData.length - 1; i >= 0; i--) {
      if (total >= levelsData[i].volume) return i;
    }
    return 0;
  };

  const calculateProgress = (level, total) => {
    const currentLevelVolume = levelsData[level]?.volume ?? 0;
    const nextLevelVolume = levelsData[level + 1]?.volume ?? currentLevelVolume;

    if (nextLevelVolume > currentLevelVolume) {
      let prog = ((total - currentLevelVolume) / (nextLevelVolume - currentLevelVolume)) * 100;

      if (isNaN(prog) || prog < 0) prog = 0;
      if (prog > 100) prog = 100;

      setProgress(prog);
    } else {
      setProgress(100);
    }
  };

  const calculateAmountToNextLevel = (level, total) => {
    const nextLevelVolume = levelsData[level + 1]?.volume || 0;
    setAmountToNextLevel(nextLevelVolume > total ? nextLevelVolume - total : 0);
  };

  const handleProfileClick = () => {
    navigate('/profile', { state: { userLevel } });
  };

  return (
    <div className="account-level-card card">
      <button className="close-button" onClick={handleProfileClick}>
        &lt;
      </button>

      <h2 className="card-title">Уровень аккаунта</h2>

      <div className="monthly-volume">
        <span className="label">Ваш оборот</span>
        <div className="volume-box">
          <span className="amount">{totalTurnover.toFixed(2)} USDT</span>
        </div>
      </div>

      <div className="level-progress">
        <span>Текущий уровень: <strong>(LVL {userLevel})</strong></span>
        <span>Следующий уровень: <strong>(LVL {nextLevel})</strong></span>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar-background">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="amount-to-next-level">
        <span>Осталось до следующего уровня: </span>
        <span>{amountToNextLevel.toFixed(2)} USDT</span>
      </div>

      <h3 className="sub-title">Уровни & Привилегии</h3>
      <div className="level-cards-grid">
        {levelsData.map((item, index) => (
          <div key={index} className="level-card">
            <div className="level-name">{item.level}</div>
            <div className="level-detail">
              <span>Оборот:</span>
              <span>{item.volume} USDT</span>
            </div>
            <div className="level-detail">
              <span>SWAP:</span>
              <span>{item.swap}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserLevel;
