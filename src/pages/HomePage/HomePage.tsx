import GameCard from '../../components/GameCard/GameCard';
import { games } from '../../data/games';
import { categoryLabels } from '../../types/game';
import styles from './HomePage.module.css';

const categories = Array.from(new Set(games.map((game) => game.category)));

export default function HomePage() {
  const availableCount = games.filter((game) => game.status === 'available').length;

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Tiny Games</p>
        <h1>纯前端小游戏集锦</h1>
        <p>
          一个面向持续扩展的小游戏集合：统一导航、统一游戏布局、统一元数据注册，
          方便后续通过 vibe coding 快速加入更多小游戏。
        </p>
        <div className={styles.stats}>
          <span>{games.length} 个游戏条目</span>
          <span>{availableCount} 个已可玩</span>
          <span>{categories.map((category) => categoryLabels[category]).join(' / ')}</span>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="games-title">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Collection</p>
            <h2 id="games-title">游戏导航</h2>
          </div>
          <p>新增游戏时只需补充游戏目录、路由和 games.ts 注册信息。</p>
        </div>
        <div className={styles.grid}>
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>
    </main>
  );
}
