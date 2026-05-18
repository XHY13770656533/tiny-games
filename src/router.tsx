import { createBrowserRouter } from 'react-router-dom';
import AppShell from './components/AppShell/AppShell';
import HomePage from './pages/HomePage/HomePage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import ElectronicPetGame from './games/electronic-pet';
import PonyRiverGame from './games/pony-river';
import TictactoeGame from './games/tictactoe';
import MemoryGame from './games/memory';
import SnakeGame from './games/snake';
import Game2048 from './games/game-2048';
import MinesweeperGame from './games/minesweeper';
import BreakoutGame from './games/breakout';
import LuckyWheelGame from './games/lucky-wheel';
import SummonMonstersGame from './games/summon-monsters';
import StoneSkippingGame from './games/stone-skipping';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'games/stone-skipping', element: <StoneSkippingGame /> },
      { path: 'games/summon-monsters', element: <SummonMonstersGame /> },
      { path: 'games/pony-river', element: <PonyRiverGame /> },
      { path: 'games/electronic-pet', element: <ElectronicPetGame /> },
      { path: 'games/lucky-wheel', element: <LuckyWheelGame /> },
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
