import React from 'react';
import './styles/UserLevel.css';

function AccountInfo() {
  return (
    <div className="account-info">
      <h2>Уровень вашего аккаунта</h2>
      <div className="monthly-volume">
        <span>Ваш месячный объем</span>
        <div className="volume-box">
          <span className="amount">0 USDT</span>
        </div>
      </div>
      <div className="level-progress">
        <span>0.00 USDT (lvl 0)</span>
        <span>(lvl 1) 100 USDT</span>
      </div>
    </div>
  );
}

function LevelTable() {
    const levelsData = [
      { level: '0 LVL', volume: '0', swap: '0.6%', usdt: '2.5%', btc: '2.5%' },
      { level: '1 LVL', volume: '100', swap: '0.5%', usdt: '2.4%', btc: '2.4%' },
      { level: '2 LVL', volume: '1K', swap: '0.45%', usdt: '2.3%', btc: '2.3%' },
      { level: '3 LVL', volume: '3K', swap: '0.4%', usdt: '2.2%', btc: '2.2%' },
      { level: '4 LVL', volume: '50K', swap: '0.35%', usdt: '2%', btc: '2%' },
      { level: '5 LVL', volume: '100K', swap: '0.3%', usdt: '2%', btc: '2%' },
      { level: '6 LVL', volume: '500K', swap: '0.25%', usdt: '2%', btc: '2%' },
    ];
  
    return (
      <div className="level-table">
        <table>
          <thead>
            <tr>
              <th>Уровень</th>
              <th>Оборот</th>
              <th>SWAP</th>
              <th>USDT</th>
              <th>BTC</th>
            </tr>
          </thead>
          <tbody>
            {levelsData.map((levelInfo, index) => (
              <tr key={index}>
                <td>{levelInfo.level}</td>
                <td>{levelInfo.volume}</td>
                <td>{levelInfo.swap}</td>
                <td>{levelInfo.usdt}</td>
                <td>{levelInfo.btc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  
function App() {
  return (
    <div className="app-container">
      <div className="left-section">
        <AccountInfo />
      </div>
      <div className="right-section">
        <LevelTable />
      </div>
    </div>
  );
}

export default App;