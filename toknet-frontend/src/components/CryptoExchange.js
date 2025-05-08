import React, { useState } from "react";
import btcIcon from '../icons/btc.svg';
import ethIcon from '../icons/eth.svg';
import usdtIcon from '../icons/usdt.svg';
import "./styles/CryptoExchange.css";

export default function CurrencyExchange() {
  const [btcAmount, setBtcAmount] = useState(0);
  const exchangeRate = 101.5;
  const feeRate = 0.002;
  const usdcAmount = btcAmount * exchangeRate * (1 - feeRate);

  const availableCryptos = [
    { symbol: 'BTC', name: 'Bitcoin', icon: btcIcon },
    { symbol: 'ETH', name: 'Ethereum', icon: ethIcon },
    { symbol: 'USDT', name: 'Tether', icon: usdtIcon },
  ];

  const getIcon = (symbol) => {
    const crypto = availableCryptos.find(c => c.symbol === symbol);
    return crypto ? crypto.icon : '';
  };

  return (
    <div className="exchange-wrapper">
      <div className="exchange-container">
        <h1 className="exchange-title">CURRENCY EXCHANGE</h1>

        <p className="label">You pay</p>
        <div className="input-group">
          <input
            type="text"
            value={btcAmount}
            onChange={(e) => setBtcAmount(parseFloat(e.target.value) || 0)}
            className="input-field"
          />
          <span className="currency-label">BTC</span>
          <img src={getIcon('BTC')} alt="BTC" className="currency-icon" />
        </div>

        <div className="swap-icon">
          <div className="swap-arrows">⇄</div>
        </div>

        <p className="label">You receive</p>
        <div className="input-group">
          <input
            type="text"
            value={usdcAmount.toFixed(2)}
            readOnly
            className="input-field"
          />
          <span className="currency-label">USDT</span>
          <img src={getIcon('USDT')} alt="USDC" className="currency-icon" />
        </div>

        <div className="exchange-button">Exchange</div>

        <div className="rate-row">
          <span>Exchange rate</span>
          <span>1 BTC = {exchangeRate.toFixed(3)} USD</span>
        </div>
        <div className="rate-row">
          <span>Fee</span>
          <span>{(feeRate * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
