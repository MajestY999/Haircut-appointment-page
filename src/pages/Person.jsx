import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './Person.module.css';
import { getBarbers } from '../Data';

export default function Person() {
  const { id } = useParams();
  const navigate = useNavigate();
  const barbers = getBarbers();

  const barber = useMemo(
    () => barbers.find(b => String(b.id) === String(id)),
    [barbers, id]
  );

  const services = [
    { key: 'haircut', name: 'Стрижка', priceAdd: 0 },
    { key: 'styling', name: 'Укладка', priceAdd: 150 },
    { key: 'combo', name: 'Стрижка + укладка', priceAdd: 400 },
  ];

  // простые варианты даты (ближайшие дни) и времени (слоты)
  const dateOptions = makeNextDays(7); // 7 ближайших дней
  const timeOptions = ['10:00', '11:00', '12:00', '14:00', '15:00', '17:00', '18:00'];

  const [serviceKey, setServiceKey] = useState(services[0].key);
  const [dateStr, setDateStr] = useState(dateOptions[0].value);
  const [timeStr, setTimeStr] = useState(timeOptions[0]);

  if (!barber) {
    return (
      <main className={styles.container}>
        <p>Парикмахер не найден</p>
      </main>
    );
  }

  const selectedService = services.find(s => s.key === serviceKey) || services[0];
  const totalPrice = (barber.price || 0) + (selectedService.priceAdd || 0);

  const goBooking = () => {
    navigate('/booking', {
      state: {
        barberId: barber.id,
        barberName: barber.name,
        serviceKey,
        serviceName: selectedService.name,
        serviceAddPrice: selectedService.priceAdd,
        basePrice: barber.price,
        totalPrice,
        dateStr,
        timeStr
      }
    });
  };

  return (
    <main className={styles.container}>
      <section className={styles.header}>
        <h1 className={styles.title}>{barber.name}</h1>
        <p className={styles.muted}>Стрижка • Укладка • Борода</p>
        <div className={styles.banner} />
      </section>

      <section className={styles.panel}>
        <label className={styles.label} htmlFor="service">Услуга</label>
        <select
          id="service"
          className={styles.select}
          value={serviceKey}
          onChange={(e) => setServiceKey(e.target.value)}
        >
          {services.map(s => (
            <option key={s.key} value={s.key}>
              {s.name}{s.priceAdd ? ` (+${s.priceAdd} ₽)` : ''}
            </option>
          ))}
        </select>

        {/* Дата — выпадающий список ближайших дней */}
        <label className={styles.label} htmlFor="date">Дата</label>
        <select
          id="date"
          className={styles.select}
          value={dateStr}
          onChange={(e) => setDateStr(e.target.value)}
        >
          {dateOptions.map(d => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>

        {/* Время — слоты */}
        <label className={styles.label} htmlFor="time">Время</label>
        <select
          id="time"
          className={styles.select}
          value={timeStr}
          onChange={(e) => setTimeStr(e.target.value)}
        >
          {timeOptions.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Итого:</span>
          <span className={styles.totalPrice}>{totalPrice} ₽</span>
        </div>

        <button className={styles.btn} type="button" onClick={goBooking}>
          Перейти к записи
        </button>
      </section>
    </main>
  );
}

/*  ближайшие дни для записи на стрижку  */
function makeNextDays(count) {
  const days = [];
  const locale = 'ru-RU';
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const value = d.toISOString().slice(0, 10); // год-месяц-день
    const label = d.toLocaleDateString(locale, { day: '2-digit', month: 'long', weekday: 'short' });
    days.push({ value, label });
  }
  return days;
}