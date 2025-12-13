import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './Person.module.css';
import { getBarbers } from '../Data';

const SERVICES_KEY = 'simple_services';
const SCHEDULES_KEY = 'simple_schedules';

function readJSON(key) {
  const raw = localStorage.getItem(key);
  try {
    const val = raw ? JSON.parse(raw) : [];
    return val ?? [];
  } catch {
    return [];
  }
}
function readServices() {
  const arr = readJSON(SERVICES_KEY);
  return Array.isArray(arr) ? arr : [];
}
function readSchedulesMap() {
  const arr = readJSON(SCHEDULES_KEY);
  const obj = {};
  (Array.isArray(arr) ? arr : []).forEach(x => {
    if (x?.barberId != null) obj[x.barberId] = x;
  });
  return obj;
}

export default function Person() {
  const { id } = useParams();
  const navigate = useNavigate();
  const barbers = getBarbers();

  const barber = useMemo(
    () => barbers.find(b => String(b.id) === String(id)),
    [barbers, id]
  );

  const [services, setServices] = useState([]);
  const [schedulesMap, setSchedulesMap] = useState({});
  useEffect(() => {
    setServices(readServices());
    setSchedulesMap(readSchedulesMap());
    const onStorage = (e) => {
      if (e.key === SERVICES_KEY) setServices(readServices());
      if (e.key === SCHEDULES_KEY) setSchedulesMap(readSchedulesMap());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // расписание мастера
  const schedule = useMemo(() => {
    if (!barber) return { workDays: [], startTime: '09:00', endTime: '18:00' };
    return schedulesMap[barber.id] || { workDays: [], startTime: '09:00', endTime: '18:00' };
  }, [barber, schedulesMap]);

  // даты
  const dateOptions = useMemo(() => makeNextDays(14), []);
  const [dateStr, setDateStr] = useState(dateOptions[0]?.value || '');

  // выбранная услуга
  const [serviceId, setServiceId] = useState(null);
  useEffect(() => {
    if (services.length > 0 && serviceId == null) {
      setServiceId(services[0].id);
    }
  }, [services, serviceId]);

  const selectedService = useMemo(
    () => services.find(s => String(s.id) === String(serviceId)) || null,
    [services, serviceId]
  );

  // доступность даты по расписанию
  const isDateAllowed = useMemo(() => {
    if (!dateStr) return false;
    const wdKey = weekdayKey(dateStr); // 'Mon'..'Sun'
    return schedule.workDays?.includes(wdKey);
  }, [dateStr, schedule]);

  // список времени в пределах рабочего интервала
  const timeOptions = useMemo(() => {
    const { startTime, endTime } = schedule;
    return generateTimes(startTime, endTime, 30); // шаг 30 мин
  }, [schedule]);

  const [timeStr, setTimeStr] = useState('');
  useEffect(() => {
    // при смене даты/расписания сбрасываем время на первое доступное
    setTimeStr(timeOptions[0] || '');
  }, [timeOptions, dateStr]);

  if (!barber) {
    return (
      <main className={styles.container}>
        <p>Парикмахер не найден</p>
      </main>
    );
  }

  const basePrice = barber.price || 0;
  const addPrice = selectedService ? Number(selectedService.price || 0) : 0;
  const totalPrice = basePrice + addPrice;

  const canProceed = selectedService && isDateAllowed && timeStr && timeOptions.includes(timeStr);

  const goBooking = () => {
    if (!canProceed) return;
    navigate('/booking', {
      state: {
        barberId: barber.id,
        barberName: barber.name,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        servicePrice: Number(selectedService.price || 0),
        serviceDuration: Number(selectedService.duration || 0),
        basePrice,
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
        <p className={styles.muted}>Выберите услугу, дату и время</p>
        <div className={styles.banner} />
      </section>

      <section className={styles.panel}>
        {services.length === 0 ? (
          <div className={styles.empty}>
            <p>Нет услуг. Добавьте их в админке (Услуги), затем вернитесь сюда.</p>
          </div>
        ) : (
          <>
            <label className={styles.label} htmlFor="service">Услуга</label>
            <select
              id="service"
              className={styles.select}
              value={serviceId ?? ''}
              onChange={(e) => setServiceId(e.target.value)}
            >
              {services.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({Number(s.price)} ₽, {Number(s.duration)} мин)
                </option>
              ))}
            </select>

            <label className={styles.label} htmlFor="date">Дата</label>
            <select
              id="date"
              className={styles.select}
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
            >
              {dateOptions.map(d => {
                const wd = weekdayKey(d.value);
                const allowed = schedule.workDays?.includes(wd);
                return (
                  <option key={d.value} value={d.value} disabled={!allowed}>
                    {d.label}{allowed ? '' : ' (нерабочий день)'}
                  </option>
                );
              })}
            </select>

            <label className={styles.label} htmlFor="time">Время</label>
            <select
              id="time"
              className={styles.select}
              value={timeStr}
              onChange={(e) => setTimeStr(e.target.value)}
              disabled={!isDateAllowed}
            >
              {timeOptions.length === 0 ? (
                <option value="">Нет времени в этот день</option>
              ) : (
                timeOptions.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))
              )}
            </select>

            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Итого:</span>
              <span className={styles.totalPrice}>{totalPrice} ₽</span>
            </div>

            <button
              className={styles.btn}
              type="button"
              onClick={goBooking}
              disabled={!canProceed}
              title={canProceed ? '' : 'Выберите доступные дату и время по расписанию мастера'}
            >
              Перейти к записи
            </button>
          </>
        )}
      </section>
    </main>
  );
}

/* ближайшие дни */
function makeNextDays(count) {
  const days = [];
  const locale = 'ru-RU';
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const value = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString(locale, { day: '2-digit', month: 'long', weekday: 'short' });
    days.push({ value, label });
  }
  return days;
}

// 'Mon'..'Sun' ключ для расписания
function weekdayKey(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const map = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  return map[d.getDay()];
}

// генерирует времена между start-end с шагом minutesStep
function generateTimes(start = '09:00', end = '18:00', minutesStep = 30) {
  const toMin = (t) => {
    const m = String(t).match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    const hh = Number(m[1]); const mm = Number(m[2]);
    return hh * 60 + mm;
  };
  const fromMin = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

  const s = toMin(start);
  const e = toMin(end);
  if (s == null || e == null || e <= s) return [];

  const out = [];
  for (let cur = s; cur <= e; cur += minutesStep) {
    out.push(fromMin(cur));
  }
  return out;
}