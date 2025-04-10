import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Homepage from './components/Homepage';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import './global.css';
import './App.css';
import { jwtDecode } from 'jwt-decode';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIsAuthenticated(true);
        setUser({ username: decoded.username || decoded.email?.split('@')[0] });
      } catch (err) {
        console.error('Invalid token:', err);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
  }, []);

  const handleLogin = (credentials) => {
    setIsAuthenticated(true);
    setUser({ username: credentials.username || credentials.email?.split('@')[0] });
    return <Navigate to="/" />;
  };

  const handleRegister = (userData) => {
    setIsAuthenticated(true);
    setUser({ username: userData.username });
    return <Navigate to="/" />;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
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
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register onRegister={handleRegister} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
