import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SOSButton from './components/SOSButton';
import Dashboard from './pages/Dashboard';
import FloodMap from './pages/FloodMap';
import Health from './pages/Health';
import Report from './pages/Report';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/flood-map" element={<FloodMap />} />
            <Route path="/health" element={<Health />} />
            <Route path="/report" element={<Report />} />
          </Routes>
        </main>
        <Footer />
        <SOSButton />
      </div>
    </Router>
  );
}

export default App;