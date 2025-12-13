import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Person from './pages/Person';
import Booking from './pages/booking';
import Admin from './pages/Admin';
import './style.css';

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        {/* Главная */}
        <Route path="/" element={<Home />} />
        {/* Профиль парикмахера */}
        <Route path="/person/:id" element={<Person />} />
        {/* Окно записи */}
        <Route path="/booking" element={<Booking />} />
        {/* Админка */}
        <Route path="/admin" element={<Admin />} />
        {/* Любые другие пути -> на главную */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}