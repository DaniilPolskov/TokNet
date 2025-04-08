import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Homepage from './components/Homepage';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import './global.css';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (credentials) => {
    console.log('Login with:', credentials);
    setIsAuthenticated(true);
    setUser({ username: credentials.email.split('@')[0] });
    return <Navigate to="/" />;
  };

  const handleRegister = (userData) => {
    console.log('Register with:', userData);
    setIsAuthenticated(true);
    setUser({ username: userData.username });
    return <Navigate to="/" />;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
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
              element={
                <Login 
                  onLogin={handleLogin} 
                />
              } 
            />
            <Route 
              path="/register" 
              element={
                <Register 
                  onRegister={handleRegister} 
                />
              } 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;