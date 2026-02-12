import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Invest vs Payoff</h1>
      <p className={styles.subtitle}>
        Compare three strategies: save it, pay down loan faster, or invest it
      </p>
    </header>
  );
}
