import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import { getBarbers } from '../Data';

export default function Home() {
  const barbers = getBarbers();
  const navigate = useNavigate();

  const openProfile = (id) => navigate(`/person/${encodeURIComponent(id)}`);

  return (
    <main className={styles.container}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Страница записи на стрижку</h1>
        <p className={styles.subtitle}></p>
      </section>

      <section className={styles.products}>
        <h2 className={styles.sectionTitle}>Записаться на стрижку к парикмахеру:</h2>

        <div className={styles.grid}>
          {barbers.map((p) => (
            <article key={p.id} className={styles.card}>
              {/* верх карточки: клик откроет профиль */}
              <button
                type="button"
                onClick={() => openProfile(p.id)}
                aria-label={`Открыть профиль ${p.name}`}
                style={{ all: 'unset', display: 'block', cursor: 'pointer' }}
              >
                <div className={styles.image} aria-hidden />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 8 }}>
                  <h3 className={styles.cardTitle} style={{ margin: 0 }}>{p.name}</h3>
                  <span className={styles.price}>{p.price} ₽</span>
                </div>
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}