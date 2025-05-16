import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import btcIcon from '../icons/btc.svg';
import ethIcon from '../icons/eth.svg';
import usdtIcon from '../icons/usdt.svg';
import "./styles/CryptoExchange.css";
import axios from 'axios';

export default function CryptoExchange() {
  const navigate = useNavigate();
  const [fromCrypto, setFromCrypto] = useState("BTC");
  const [toCrypto, setToCrypto] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [receiveAddress, setReceiveAddress] = useState("");
  const [exchangeRate, setExchangeRate] = useState(null);
  const [feeRate, setFeeRate] = useState(0.002);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [cryptoData, setCryptoData] = useState({});
  const [network, setNetwork] = useState("");

  const availableCryptos = [
    { symbol: "BTC", name: "Bitcoin", icon: btcIcon, network: "BTC" },
    { symbol: "ETH", name: "Ethereum", icon: ethIcon, network: "ERC20" },
    { symbol: "USDT", name: "Tether", icon: usdtIcon, network: "TRC20" },
  ];

  const getIcon = (symbol) => {
    const crypto = availableCryptos.find((c) => c.symbol === symbol);
    return crypto ? crypto.icon : '';
  };

  const getNetwork = (symbol) => {
    const crypto = availableCryptos.find((c) => c.symbol === symbol);
    return crypto ? crypto.network : '';
  };

  useEffect(() => {
  const storedFee = localStorage.getItem('fee_rate');
  if (storedFee) {
    const parsed = parseFloat(storedFee);
    const corrected = parsed > 1 ? parsed / 100 : parsed;
    setFeeRate(corrected);
    console.log("fee_rate из localStorage:", parsed, "=> применено:", corrected);
}}, []);

  useEffect(() => {
    setNetwork(getNetwork(toCrypto));
  }, [toCrypto]);

  const handleExchange = () => {
    if (exchangeRate && receiveAddress) {
      navigate(
        `/exchange/step2?from=${fromCrypto}&to=${toCrypto}&amount=${amount}&rate=${exchangeRate}&fee=${feeRate}&receiveAddress=${encodeURIComponent(receiveAddress)}&network=${network}`
      );
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleAddressChange = (e) => {
    setReceiveAddress(e.target.value);
  };

  const swapped = () => {
    setFromCrypto(toCrypto);
    setToCrypto(fromCrypto);
  };

  const formatOutputAmount = (value) => {
    if (!value || isNaN(value)) return '0';
    const num = parseFloat(value);
    if (num >= 1) return num.toFixed(2);
    if (num >= 0.1) return num.toFixed(3);
    if (num >= 0.01) return num.toFixed(4);
    return num.toFixed(6);
  };

let rawAmount = 0;
let netAmount = 0;

if (exchangeRate && amount) {
  rawAmount = parseFloat(amount) * exchangeRate;
  netAmount = rawAmount * (1 - feeRate);
}

const outputAmount = exchangeRate && amount
  ? formatOutputAmount(netAmount)
  : '0';
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/crypto-data/');
        if (res.data && res.data.length > 0) {
          const data = res.data.reduce((acc, curr) => {
            acc[curr.symbol] = curr;
            return acc;
          }, {});
          setCryptoData(data);
        }
      } catch (err) {
        console.error('Failed to fetch crypto data:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (cryptoData[fromCrypto] && cryptoData[toCrypto]) {
      const fromPrice = cryptoData[fromCrypto].price;
      const toPrice = cryptoData[toCrypto].price;
      const rate = fromPrice / toPrice;
      setExchangeRate(rate);
    }
  }, [cryptoData, fromCrypto, toCrypto]);

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
            inputMode="decimal"
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

        <p className="label">You receive (inclusive of fees)</p>
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

        <div className="address-input">
          <p className="label">Your {toCrypto} address ({network})</p>
          <input
            type="text"
            value={receiveAddress}
            onChange={handleAddressChange}
            className="input-field"
            placeholder={`Enter your ${toCrypto} address`}
          />
        </div>

        <button 
          className="exchange-button" 
          onClick={handleExchange}
          disabled={!exchangeRate || !amount || !receiveAddress}
        >
          Exchange
        </button>

        <div className="rate-row">
          <span>Exchange rate</span>
          <span>
            {exchangeRate ? `1 ${fromCrypto} = ${exchangeRate.toFixed(2)} ${toCrypto}` : 'Loading...'}
          </span>
        </div>
        <div className="rate-row">
          <span>Fee</span>
          <span>{(feeRate * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}