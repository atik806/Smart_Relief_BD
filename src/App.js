import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SOSButton from './components/SOSButton';
import { ToastProvider } from './components/Toast';
import { usePageMeta } from './hooks/usePageMeta';
import './App.css';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const FloodMap = lazy(() => import('./pages/FloodMap'));
const Health = lazy(() => import('./pages/Health'));
const Report = lazy(() => import('./pages/Report'));
const NotFound = lazy(() => import('./pages/NotFound'));

function RouteFallback() {
  return (
    <div className="route-fallback" role="status" aria-live="polite" aria-label="Loading page">
      <div className="route-fallback-spinner" />
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();
  usePageMeta();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/flood-map" element={<FloodMap />} />
        <Route path="/health" element={<Health />} />
        <Route path="/report" element={<Report />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Suspense fallback={<RouteFallback />}>
              <AppRoutes />
            </Suspense>
          </main>
          <Footer />
          <SOSButton />
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
