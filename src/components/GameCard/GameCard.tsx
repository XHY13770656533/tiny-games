import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import {
  categoryLabels,
  difficultyLabels,
  statusLabels,
  type GameMeta,
} from '../../types/game';
import styles from './GameCard.module.css';

type GameCardProps = {
  game: GameMeta;
};

export default function GameCard({ game }: GameCardProps) {
  return (
    <article className={styles.card} style={{ '--accent-color': game.accentColor } as CSSProperties}>
      <div className={styles.cover} aria-hidden="true">
        <span>{game.title.slice(0, 1)}</span>
      </div>
      <div className={styles.content}>
        <div className={styles.headingRow}>
          <h3>{game.title}</h3>
          <span className={styles.status}>{statusLabels[game.status]}</span>
        </div>
        <p>{game.description}</p>
        <div className={styles.meta}>
          <span>{categoryLabels[game.category]}</span>
          <span>{difficultyLabels[game.difficulty]}</span>
        </div>
        <div className={styles.tags}>
          {game.tags.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
      </div>
      <Link className={styles.action} to={game.path}>
        {game.status === 'available' ? '开始游戏' : '查看规划'}
      </Link>
    </article>
  );
}
