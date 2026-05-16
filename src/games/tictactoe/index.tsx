import { useMemo, useState } from 'react';
import GameLayout from '../../components/GameLayout/GameLayout';
import {
  emptyBoard,
  getNextPlayer,
  getWinner,
  isBoardFull,
  placeMark,
  type Board,
} from './logic';
import styles from './styles.module.css';

export default function TictactoeGame() {
  const [board, setBoard] = useState<Board>(emptyBoard);
  const winner = useMemo(() => getWinner(board), [board]);
  const isDraw = !winner && isBoardFull(board);
  const nextPlayer = getNextPlayer(board);

  const status = winner
    ? `玩家 ${winner} 获胜`
    : isDraw
      ? '平局，棋盘已填满'
      : `轮到玩家 ${nextPlayer}`;

  function handleCellClick(index: number) {
    setBoard((currentBoard) => placeMark(currentBoard, index));
  }

  function resetGame() {
    setBoard(emptyBoard);
  }

  return (
    <GameLayout
      title="井字棋"
      description="经典 3x3 双人对战小游戏。这个实现作为后续小游戏的样板：逻辑函数独立、UI 组件轻量、状态局部维护。"
      actions={
        <button className="button" type="button" onClick={resetGame}>
          重新开始
        </button>
      }
      aside={
        <div>
          <h2>玩法说明</h2>
          <p>玩家 X 与玩家 O 轮流落子，率先在横、竖或斜线上连成三个标记的一方获胜。</p>
          <p>建议新增游戏时参考当前目录结构：index.tsx 负责界面，logic.ts 负责纯规则。</p>
        </div>
      }
    >
      <div className={styles.wrapper}>
        <p className={styles.status}>{status}</p>
        <div className={styles.board} aria-label="井字棋棋盘">
          {board.map((cell, index) => (
            <button
              aria-label={`第 ${index + 1} 格${cell ? `，玩家 ${cell}` : ''}`}
              className={styles.cell}
              disabled={Boolean(cell) || Boolean(winner)}
              key={index}
              type="button"
              onClick={() => handleCellClick(index)}
            >
              {cell}
            </button>
          ))}
        </div>
      </div>
    </GameLayout>
  );
}
