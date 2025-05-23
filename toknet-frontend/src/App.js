import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Homepage from './components/Homepage';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile.js';
import KYCVerification from './pages/KYCVerification.js';
import TransactionHistory from './pages/TransactionHistory.js';
import UserLevel from './pages/UserLevel.js';
import FAQ from './pages/FAQ.js';
import Enable2FA from './components/Enable2FA';
import TechnicalSupport from './pages/TechnicalSupport.js';
import CryptoExchangePage from './components/CryptoExchange';
import ExchangeStep2 from './components/ExchangeStep2';
import OrderCancelled from './components/OrderCancelled';
import RulesPage from './pages/RulesPage.js';

import './global.css';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const savedUser = JSON.parse(localStorage.getItem('user'));

    if (token && savedUser) {
      setIsAuthenticated(true);
      setUser(savedUser);
    }
  }, []);

  const handleLogin = (credentials) => {
    setIsAuthenticated(true);
    const user = { username: credentials.email.split('@')[0], email: credentials.email };
    setUser(user);
    localStorage.setItem('access_token', credentials.token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleRegister = (userData) => {
    setIsAuthenticated(true);
    const user = { username: userData.username, email: userData.email };
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <Router>
      <div className="App">
        <Header 
          isAuthenticated={isAuthenticated}
          user={user}
          onLogout={handleLogout}
        />
        <main>
          <Routes>
            <Route path="/" element={<Homepage isAuthenticated={isAuthenticated} />} />
            <Route 
              path="/login" 
              element={<Login onLogin={handleLogin} />} 
            />
            <Route 
              path="/register" 
              element={<Register onRegister={handleRegister} />} 
            />
            <Route 
              path="/profile" 
              element={<Profile user={user} onProfileUpdate={handleProfileUpdate} />} 
            />
            <Route 
              path="/profile/edit" 
              element={<EditProfile />}
            /> 
            <Route path="/profile/edit/KYCVerification" 
            element={<KYCVerification />} 
            />
            <Route path="/profile/transactions" 
            element={<TransactionHistory />} 
            />
            <Route path="/profile/faq" 
            element={<FAQ />} 
            />

            <Route path="/profile/Level"
            element={<UserLevel />} />
            
            <Route path="/profile/edit/enable2FA"
            element={<Enable2FA />} />
            
            <Route path="/exchange" 
            element={<CryptoExchangePage />} 
            />
            
            <Route path="/exchange/step2"
            element={<ExchangeStep2 />} 
            />
            
            <Route path="/order-cancelled" 
            element={<OrderCancelled />} 
            />

            <Route path="/technical-support" 
            element={<TechnicalSupport />} 
            />

            <Route path="/rules" 
            element={<RulesPage />} 
            />

          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
