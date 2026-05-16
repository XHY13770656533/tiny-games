import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './GameLayout.module.css';

type GameLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
};

export default function GameLayout({
  title,
  description,
  children,
  actions,
  aside,
}: GameLayoutProps) {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.backLink} to="/">
          返回首页
        </Link>
        <div>
          <p className={styles.eyebrow}>Tiny Games</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </header>
      <div className={styles.content}>
        <section className={styles.stage}>{children}</section>
        {aside ? <aside className={styles.aside}>{aside}</aside> : null}
      </div>
    </main>
  );
}
