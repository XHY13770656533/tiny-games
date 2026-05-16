import { createBrowserRouter } from 'react-router-dom';
import AppShell from './components/AppShell/AppShell';
import HomePage from './pages/HomePage/HomePage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import TictactoeGame from './games/tictactoe';
import MemoryGame from './games/memory';
import SnakeGame from './games/snake';
import Game2048 from './games/game-2048';
import MinesweeperGame from './games/minesweeper';
import BreakoutGame from './games/breakout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'games/tictactoe', element: <TictactoeGame /> },
      { path: 'games/memory', element: <MemoryGame /> },
      { path: 'games/snake', element: <SnakeGame /> },
      { path: 'games/2048', element: <Game2048 /> },
      { path: 'games/minesweeper', element: <MinesweeperGame /> },
      { path: 'games/breakout', element: <BreakoutGame /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
