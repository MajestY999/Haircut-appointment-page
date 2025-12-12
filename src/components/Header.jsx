import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';
import barber from '../barber.png';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logoLink}>
          <img src={barber} alt="barber" className={styles.logoImg} />
          <span className={styles.logoText}>Парикмахерская</span>
        </Link>

        <nav className={styles.nav}>
          <Link to="/home" className={styles.link}>Главная</Link>
          <Link to="/admin" className={styles.link}>Админ</Link>
          
        </nav>
      </div>
    </header>
  );
}
