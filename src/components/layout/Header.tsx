import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Finance Dashboard</h1>
      <p className={styles.subtitle}>
        Euro Stoxx 50 · DAX · Nikkei 225 · Dow Jones · MSCI World
      </p>
    </header>
  );
}
