import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Admin from './pages/Admin';
import Home from './pages/Home';
import Header from './components/Header';
import Booking from './pages/booking';
import Person from './pages/Person';
import "./style.css"

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        {/* профиль парикмахера */}
        <Route path="/person/:id" element={<Person />} />
        {/* окно записи */}
        <Route path="/booking" element={<Booking />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </>
  );
}

export default App;