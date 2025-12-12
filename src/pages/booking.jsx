import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './booking.module.css';

const STORAGE_KEY = 'simple_appointments';
function readAppointments() {
  const raw = localStorage.getItem(STORAGE_KEY);
  try { return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function writeAppointments(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export default function Booking() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [barberName, setBarberName] = useState(state?.barberName || '');
  const [serviceName, setServiceName] = useState(state?.serviceName || 'Стрижка');
  const [totalPrice, setTotalPrice] = useState(state?.totalPrice || 0);
  const [dateStr, setDateStr] = useState(state?.dateStr || '');
  const [timeStr, setTimeStr] = useState(state?.timeStr || '');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    setBarberName(state?.barberName || '');
    setServiceName(state?.serviceName || 'Стрижка');
    setTotalPrice(state?.totalPrice || 0);
    setDateStr(state?.dateStr || '');
    setTimeStr(state?.timeStr || '');
    setName('');
    setPhone('');
  }, [state]);

  const isBarberEmpty = !barberName.trim();
  const isNameEmpty = !name.trim();
  const isPhoneEmpty = !phone.trim();
  const canSubmit = !isBarberEmpty && !isNameEmpty && !isPhoneEmpty;

  const onSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    const appt = {
      id: Date.now(),
      name,
      phone,
      barberName,
      serviceName,
      totalPrice,
      dateStr,
      timeStr,
      note: ''
    };

    const list = readAppointments();
    writeAppointments([appt, ...list]);

    alert('Запись подтверждена и сохранена');

    // очистка полей
    setName('');
    setPhone('');
    setBarberName('');
    setServiceName('Стрижка');
    setTotalPrice(0);
    setDateStr('');
    setTimeStr('');

    // по желанию: перейти сразу в админку
    navigate('/admin');
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Подтверждение записи</h1>
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <label className={styles.label}>Парикмахер</label>
        <input className={`${styles.input} ${isBarberEmpty ? styles.inputError : ''}`} value={barberName} readOnly />
        {!isBarberEmpty && (
          <>
            <label className={styles.label}>Услуга</label>
            <input className={styles.input} value={serviceName} readOnly />
            <label className={styles.label}>Дата</label>
            <input className={styles.input} value={dateStr} readOnly />
            <label className={styles.label}>Время</label>
            <input className={styles.input} value={timeStr} readOnly />
            <label className={styles.label}>Итого</label>
            <input className={styles.input} value={totalPrice ? `${totalPrice} ₽` : ''} readOnly />
          </>
        )}
        {isBarberEmpty && <p className={styles.error}>Выберите парикмахера на предыдущей странице</p>}

        <label className={styles.label}>Ваше имя</label>
        <input className={`${styles.input} ${isNameEmpty ? styles.inputError : ''}`} value={name} onChange={e => setName(e.target.value)} required />
        {isNameEmpty && <p className={styles.error}>Введите имя</p>}

        <label className={styles.label}>Телефон</label>
        <input className={`${styles.input} ${isPhoneEmpty ? styles.inputError : ''}`} value={phone} onChange={e => setPhone(e.target.value)} required />
        {isPhoneEmpty && <p className={styles.error}>Введите телефон</p>}

        <div className={styles.actions}>
          <button className={styles.button} type="submit" disabled={!canSubmit}>Подтвердить</button>
        </div>
      </form>
    </main>
  );
}