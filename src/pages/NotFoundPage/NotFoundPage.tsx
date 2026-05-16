import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p>404</p>
        <h1>页面不存在</h1>
        <Link to="/">回到游戏导航</Link>
      </section>
    </main>
  );
}
