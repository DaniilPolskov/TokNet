import React from 'react';
import Header from './components/Header';
import Homepage from './components/Homepage';
import Footer from './components/Footer';
import './global.css';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <Homepage />
      </main>
      <Footer />
    </div>
  );
}

export default App;