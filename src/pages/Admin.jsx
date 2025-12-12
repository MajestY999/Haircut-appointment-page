import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Admin.module.css';

const STORAGE_KEY = 'simple_appointments';

function readAppointments() {
  const raw = localStorage.getItem(STORAGE_KEY);
  try { return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function writeAppointments(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export default function Admin() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');

  // простая авторизация
  const [passInput, setPassInput] = useState('');
  const expectedPass = process.env.REACT_APP_ADMIN_PASS || 'admin123';
  const [authorized, setAuthorized] = useState(sessionStorage.getItem('admin_ok') === '1');
  const [error, setError] = useState('');

  const submitPass = (e) => {
    e.preventDefault();
    if (passInput === expectedPass) {
      sessionStorage.setItem('admin_ok', '1');
      setAuthorized(true);
      setError('');
      setPassInput('');
    } else {
      setError('Неверный пароль');
    }
  };

  // выход из админки
  const logout = () => {
    sessionStorage.removeItem('admin_ok');
    setAuthorized(false);
    setItems([]);
    setQuery('');
    setPassInput('');
    setError('');
  };

  useEffect(() => {
    if (!authorized) return;
    setItems(readAppointments());
  }, [authorized]);

  // поиск по имени клиента, парикмахеру, услуге, дате, времени
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(x =>
      (x.name || '').toLowerCase().includes(q) ||
      (x.barberName || '').toLowerCase().includes(q) ||
      (x.serviceName || '').toLowerCase().includes(q) ||
      (x.dateStr || '').toLowerCase().includes(q) ||
      (x.timeStr || '').toLowerCase().includes(q)
    );
  }, [items, query]);

  const removeItem = (id) => {
    const list = items.filter(x => x.id !== id);
    setItems(list);
    writeAppointments(list);
  };

  const updateNote = (id, note) => {
    const list = items.map(x => x.id === id ? { ...x, note } : x);
    setItems(list);
    writeAppointments(list);
  };

  const clearAll = () => {
    if (!window.confirm('Удалить все записи?')) return;
    localStorage.removeItem(STORAGE_KEY);
    setItems([]);
  };

  // экран логина (без подсказки)
  if (!authorized) {
    return (
      <main className={styles.container}>
        <section className={styles.loginBox}>
          <h1 className={styles.title}>Вход в админ-панель</h1>
          <form className={styles.loginForm} onSubmit={submitPass}>
            <label className={styles.label}>Пароль администратора</label>
            <input
              type="password"
              className={`${styles.input} ${error ? styles.inputError : ''}`}
              value={passInput}
              onChange={(e) => setPassInput(e.target.value)}
              placeholder="Введите пароль"
              autoFocus
            />
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.actions}>
              <button className={styles.btn} type="submit">Войти</button>
              <button className={styles.btn} type="button" onClick={() => navigate('/')}>На главную</button>
            </div>
          </form>
        </section>
      </main>
    );
  }

  // основной экран админки
  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Админка — записи</h1>
        <div className={styles.headerActions}>
          <input
            className={styles.search}
            placeholder="Поиск: клиент, парикмахер, услуга, дата…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className={styles.btn} onClick={() => navigate('/')}>На главную</button>
          <button className={styles.btn} onClick={logout}>Выйти</button>
          <button className={styles.btnDanger} onClick={clearAll}>Очистить всё</button>
        </div>
      </header>

      <section className={styles.list}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <p>Нет записей. Подтвердите запись на странице Booking, чтобы она тут появилась.</p>
          </div>
        ) : (
          filtered.map(item => (
            <article key={item.id} className={styles.card}>
              <div className={styles.rowTop}>
                <div className={styles.kv}>
                  {item.dateStr && <div className={styles.tag}>{item.dateStr}</div>}
                  {item.timeStr && <div className={styles.tag}>{item.timeStr}</div>}
                </div>
                <div className={styles.mainInfo}>
                  <div className={styles.line}>
                    <span className={styles.label}>Клиент:</span>
                    <span className={styles.value}>{item.name || '-'}</span>
                  </div>
                  <div className={styles.line}>
                    <span className={styles.label}>Телефон:</span>
                    <span className={styles.value}>{item.phone || '-'}</span>
                  </div>
                  <div className={styles.line}>
                    <span className={styles.label}>Парикмахер:</span>
                    <span className={styles.value}>{item.barberName || '-'}</span>
                  </div>
                  <div className={styles.line}>
                    <span className={styles.label}>Услуга:</span>
                    <span className={styles.value}>{item.serviceName || '-'}</span>
                  </div>
                </div>
                <div className={styles.priceBox}>
                  <div className={styles.price}>{item.totalPrice ? `${item.totalPrice} ₽` : '-'}</div>
                </div>
              </div>

              <div className={styles.noteRow}>
                <label className={styles.noteLabel}>Заметка</label>
                <textarea
                  className={styles.note}
                  rows={2}
                  placeholder="Например: оплата наличными, постоянный клиент, просьба не опаздывать…"
                  value={item.note || ''}
                  onChange={(e) => updateNote(item.id, e.target.value)}
                />
              </div>

              <div className={styles.actions}>
                <button className={styles.btnDanger} onClick={() => removeItem(item.id)}>Отменить</button>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}