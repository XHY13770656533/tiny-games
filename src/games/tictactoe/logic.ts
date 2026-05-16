export type Player = 'X' | 'O';
export type CellValue = Player | null;
export type Board = CellValue[];

export const emptyBoard: Board = Array<CellValue>(9).fill(null);

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

export function getWinner(board: Board): Player | null {
  for (const [a, b, c] of winningLines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}

export function isBoardFull(board: Board) {
  return board.every(Boolean);
}

export function getNextPlayer(board: Board): Player {
  const xMoves = board.filter((cell) => cell === 'X').length;
  const oMoves = board.filter((cell) => cell === 'O').length;
  return xMoves <= oMoves ? 'X' : 'O';
}

export function placeMark(board: Board, index: number): Board {
  if (board[index] || getWinner(board)) {
    return board;
  }

  const nextBoard = [...board];
  nextBoard[index] = getNextPlayer(board);
  return nextBoard;
}
