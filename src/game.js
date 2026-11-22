export const DEFAULT_WIDTH = 18;
export const DEFAULT_HEIGHT = 14;
export const DEFAULT_MINES = 40;

function validateDimensions(width, height, mines) {
  if (!Number.isInteger(width) || width < 1) {
    throw new RangeError("A largura deve ser um inteiro positivo.");
  }
  if (!Number.isInteger(height) || height < 1) {
    throw new RangeError("A altura deve ser um inteiro positivo.");
  }
  if (!Number.isInteger(mines) || mines < 0 || mines >= width * height) {
    throw new RangeError("O número de bombas deve ser inteiro e menor que o total de casas.");
  }
}

function randomIndex(rng, length) {
  const value = Number(rng());
  const normalized = Number.isFinite(value) ? Math.min(Math.max(value, 0), 0.999999999) : 0;
  return Math.floor(normalized * length);
}

export function createBoard({ width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, mines = DEFAULT_MINES, rng = Math.random } = {}) {
  validateDimensions(width, height, mines);
  if (typeof rng !== "function") {
    throw new TypeError("rng deve ser uma função.");
  }

  const board = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => ({
      x,
      y,
      isMine: false,
      adjacent: 0,
      revealed: false,
      flagged: false,
    })),
  );

  const positions = board.flat();
  for (let index = 0; index < mines; index += 1) {
    const swapIndex = index + randomIndex(rng, positions.length - index);
    [positions[index], positions[swapIndex]] = [positions[swapIndex], positions[index]];
    positions[index].isMine = true;
  }

  calculateAdjacents(board);
  return board;
}

export function getNeighbors(board, x, y) {
  if (!Array.isArray(board) || !Number.isInteger(x) || !Number.isInteger(y)) return [];
  const height = board.length;
  const width = board[0]?.length ?? 0;
  if (x < 0 || y < 0 || x >= width || y >= height) return [];

  const neighbors = [];
  for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
    for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
      if (offsetX === 0 && offsetY === 0) continue;
      const neighborX = x + offsetX;
      const neighborY = y + offsetY;
      if (neighborX >= 0 && neighborY >= 0 && neighborX < width && neighborY < height) {
        neighbors.push({ x: neighborX, y: neighborY, cell: board[neighborY][neighborX] });
      }
    }
  }
  return neighbors;
}

export function calculateAdjacents(board) {
  if (!Array.isArray(board)) throw new TypeError("O tabuleiro deve ser uma matriz.");
  for (let y = 0; y < board.length; y += 1) {
    for (let x = 0; x < (board[y]?.length ?? 0); x += 1) {
      const cell = board[y][x];
      cell.adjacent = cell.isMine
        ? 0
        : getNeighbors(board, x, y).filter(({ cell: neighbor }) => neighbor.isMine).length;
    }
  }
  return board;
}

export function countMines(board) {
  return board.flat().filter((cell) => cell.isMine).length;
}

export function createGame(options = {}) {
  const width = options.width ?? DEFAULT_WIDTH;
  const height = options.height ?? DEFAULT_HEIGHT;
  const mines = options.mines ?? DEFAULT_MINES;
  const rng = options.rng ?? Math.random;
  validateDimensions(width, height, mines);
  return {
    width,
    height,
    mineCount: mines,
    board: createBoard({ width, height, mines, rng }),
    rng,
    started: false,
    status: "playing",
    flagsCount: 0,
    revealedCount: 0,
  };
}

function relocateFirstClickMine(game, selectedCell) {
  const safeCells = game.board.flat().filter((cell) => !cell.isMine && cell !== selectedCell);
  if (safeCells.length === 0) return;
  selectedCell.isMine = false;
  safeCells[randomIndex(game.rng, safeCells.length)].isMine = true;
  calculateAdjacents(game.board);
}

export function revealCell(game, x, y) {
  if (game.status !== "playing") return false;
  const cell = game.board[y]?.[x];
  if (!cell || cell.revealed || cell.flagged) return false;

  if (!game.started && cell.isMine) relocateFirstClickMine(game, cell);
  game.started = true;

  if (cell.isMine) {
    cell.revealed = true;
    game.status = "lost";
    for (const mine of game.board.flat().filter((candidate) => candidate.isMine)) {
      mine.revealed = true;
    }
    return true;
  }

  const pending = [{ x, y }];
  while (pending.length > 0) {
    const next = pending.pop();
    const current = game.board[next.y]?.[next.x];
    if (!current || current.revealed || current.flagged || current.isMine) continue;

    current.revealed = true;
    game.revealedCount += 1;
    if (current.adjacent === 0) {
      for (const neighbor of getNeighbors(game.board, next.x, next.y)) {
        if (!neighbor.cell.revealed && !neighbor.cell.flagged && !neighbor.cell.isMine) {
          pending.push({ x: neighbor.x, y: neighbor.y });
        }
      }
    }
  }

  if (game.revealedCount >= game.width * game.height - game.mineCount) {
    game.status = "won";
  }
  return true;
}

export function toggleFlag(game, x, y) {
  if (game.status !== "playing") return false;
  const cell = game.board[y]?.[x];
  if (!cell || cell.revealed) return false;
  if (!cell.flagged && game.flagsCount >= game.mineCount) return false;

  cell.flagged = !cell.flagged;
  game.flagsCount += cell.flagged ? 1 : -1;
  return true;
}
