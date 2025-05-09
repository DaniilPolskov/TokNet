import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import btcIcon from '../icons/btc.svg';
import ethIcon from '../icons/eth.svg';
import usdtIcon from '../icons/usdt.svg';
import "./styles/CryptoExchange.css";


export default function CryptoExchange() {
  const navigate = useNavigate();
  const [fromCrypto, setFromCrypto] = useState("BTC");
  const [toCrypto, setToCrypto] = useState("USDT");
  const [amount, setAmount] = useState(1);
  const [exchangeRate, setExchangeRate] = useState(101.5);
  const [feeRate, setFeeRate] = useState(0.002);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const availableCryptos = [
    { symbol: "BTC", name: "Bitcoin", icon: btcIcon },
    { symbol: "ETH", name: "Ethereum", icon: ethIcon },
    { symbol: "USDT", name: "Tether", icon: usdtIcon },
  ];

  const getIcon = (symbol) => {
    const crypto = availableCryptos.find((c) => c.symbol === symbol);
    return crypto ? crypto.icon : '';
  };

  const handleExchange = () => {
    navigate(
      `/exchange/step2?from=${fromCrypto}&to=${toCrypto}&amount=${amount}&rate=${exchangeRate}&fee=${feeRate}`
    );
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    const sanitized = value.replace(/[^0-9.]/g, "");
    setAmount(sanitized);
  };

  const swapped = () => {
    setFromCrypto(toCrypto);
    setToCrypto(fromCrypto);
  };

  const outputAmount = (amount * exchangeRate * (1 - feeRate)).toFixed(2);

  return (
    <div className="exchange-wrapper">
      <div className="exchange-container">
        <h1 className="exchange-title">CURRENCY EXCHANGE</h1>

        <p className="label">You pay</p>
        <div className="input-group">
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            className="input-field"
            placeholder="0.00"
          />
          <div className="dropdown-wrapper">
            <div onClick={() => setShowFromDropdown(!showFromDropdown)} className="dropdown-toggle">
              <img src={getIcon(fromCrypto)} alt={fromCrypto} className="currency-icon" />
              <span>{fromCrypto}</span> ▾
            </div>
            {showFromDropdown && (
              <div className="dropdown-list">
                {availableCryptos.map((crypto) => (
                  <div
                    key={crypto.symbol}
                    className="dropdown-item"
                    onClick={() => {
                      setFromCrypto(crypto.symbol);
                      setShowFromDropdown(false);
                    }}
                  >
                    <img src={crypto.icon} alt={crypto.symbol} className="currency-icon" />
                    <span>{crypto.symbol}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="swap-icon" onClick={swapped}>
          <div className="swap-arrows">⇄</div>
        </div>

        <p className="label">You receive</p>
        <div className="input-group">
          <input
            type="text"
            value={outputAmount}
            readOnly
            className="input-field"
          />
          <div className="dropdown-wrapper">
            <div onClick={() => setShowToDropdown(!showToDropdown)} className="dropdown-toggle">
              <img src={getIcon(toCrypto)} alt={toCrypto} className="currency-icon" />
              <span>{toCrypto}</span> ▾
            </div>
            {showToDropdown && (
              <div className="dropdown-list">
                {availableCryptos.map((crypto) => (
                  <div
                    key={crypto.symbol}
                    className="dropdown-item"
                    onClick={() => {
                      setToCrypto(crypto.symbol);
                      setShowToDropdown(false);
                    }}
                  >
                    <img src={crypto.icon} alt={crypto.symbol} className="currency-icon" />
                    <span>{crypto.symbol}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button className="exchange-button" onClick={handleExchange}>
          Exchange
        </button>

        <div className="rate-row">
          <span>Exchange rate</span>
          <span>1 {fromCrypto} = {exchangeRate.toFixed(3)} {toCrypto}</span>
        </div>
        <div className="rate-row">
          <span>Fee</span>
          <span>{(feeRate * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
