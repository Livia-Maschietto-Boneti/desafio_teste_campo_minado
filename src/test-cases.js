import {
  calculateAdjacents,
  countMines,
  createBoard,
  createGame,
  getNeighbors,
  revealCell,
  toggleFlag,
} from "./game.js";

function equal(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message} Esperado: ${String(expected)}; recebido: ${String(actual)}.`);
  }
}

function prepareCornerMineGame(width = 4, height = 4) {
  const game = createGame({ width, height, mines: 1, rng: () => 0.5 });
  for (const cell of game.board.flat()) cell.isMine = false;
  game.board[0][0].isMine = true;
  calculateAdjacents(game.board);
  game.started = true;
  return game;
}

export const GAME_TESTS = [
  {
    id: "board-dimensions",
    title: "Cria um tabuleiro com 18 × 14 casas",
    run() {
      const board = createBoard({ width: 18, height: 14, mines: 40, rng: () => 0.42 });
      equal(board.length, 14, "O tabuleiro deve ter 14 linhas.");
      equal(board.every((row) => row.length === 18), true, "Cada linha deve ter 18 casas.");
      equal(new Set(board.flat()).size, 252, "Cada casa deve ser uma instância distinta.");
    },
  },
  {
    id: "exact-mines",
    title: "Distribui exatamente 40 bombas",
    run() {
      const board = createBoard({ width: 18, height: 14, mines: 40, rng: () => 0.73 });
      equal(countMines(board), 40, "O total de bombas deve ser exatamente 40.");
    },
  },
  {
    id: "neighbor-count",
    title: "Conta vizinhos corretamente nas bordas",
    run() {
      const board = createBoard({ width: 3, height: 3, mines: 0 });
      board[0][0].isMine = true;
      calculateAdjacents(board);
      equal(board[0][1].adjacent, 1, "A casa ao lado do canto deve indicar uma bomba.");
      equal(board[1][1].adjacent, 1, "A casa diagonal deve indicar uma bomba.");
      equal(board[2][2].adjacent, 0, "A casa distante não deve indicar bombas.");
      equal(getNeighbors(board, 0, 0).length, 3, "Um canto deve ter três vizinhos.");
      equal(getNeighbors(board, 1, 1).length, 8, "Uma casa central deve ter oito vizinhos.");
    },
  },
  {
    id: "empty-expansion",
    title: "Expande uma área vazia conectada",
    run() {
      const game = createGame({ width: 4, height: 4, mines: 2, rng: () => 0.5 });
      for (const cell of game.board.flat()) cell.isMine = false;
      game.board[0][0].isMine = true;
      game.board[0][3].isMine = true;
      calculateAdjacents(game.board);
      game.started = true;
      revealCell(game, 1, 3);
      equal(game.revealedCount > 1, true, "Uma casa vazia deve abrir mais de uma casa.");
      equal(game.revealedCount < 14, true, "A expansão deve parar ao encontrar as áreas numeradas.");
      equal(game.board.flat().filter((cell) => cell.revealed && cell.isMine).length, 0, "A expansão não pode revelar bombas.");
    },
  },
  {
    id: "first-click-safe",
    title: "Mantém segura a primeira casa revelada",
    run() {
      const game = createGame({ width: 3, height: 3, mines: 2, rng: () => 0 });
      equal(game.board[0][0].isMine, true, "O cenário determinístico deve iniciar com uma bomba no canto.");
      revealCell(game, 0, 0);
      equal(game.board[0][0].isMine, false, "A bomba inicial deve ser realocada.");
      equal(game.board[0][0].revealed, true, "A primeira casa deve ser aberta.");
      equal(game.status, "playing", "A primeira jogada não pode causar derrota.");
      equal(countMines(game.board), 2, "Realocar a bomba não pode alterar o total.");
    },
  },
  {
    id: "flag-toggle",
    title: "Marca e desmarca bandeiras",
    run() {
      const game = prepareCornerMineGame();
      equal(toggleFlag(game, 0, 0), true, "A bandeira deve ser adicionada.");
      equal(game.flagsCount, 1, "O contador deve somar uma bandeira.");
      equal(toggleFlag(game, 0, 0), true, "A bandeira deve poder ser removida.");
      equal(game.flagsCount, 0, "O contador deve voltar a zero.");
    },
  },
  {
    id: "flag-limit",
    title: "Respeita o limite de bandeiras",
    run() {
      const game = createGame({ width: 3, height: 2, mines: 2, rng: () => 0.2 });
      equal(toggleFlag(game, 0, 0), true, "A primeira bandeira deve ser aceita.");
      equal(toggleFlag(game, 1, 0), true, "A segunda bandeira deve ser aceita.");
      equal(toggleFlag(game, 2, 0), false, "Bandeiras acima do limite devem ser recusadas.");
      equal(game.flagsCount, 2, "O contador não deve ultrapassar o total de bombas.");
    },
  },
  {
    id: "win-condition",
    title: "Reconhece a vitória ao abrir casas seguras",
    run() {
      const game = createGame({ width: 2, height: 2, mines: 1, rng: () => 0.5 });
      game.started = true;
      const safeCells = game.board.flat().filter((cell) => !cell.isMine);
      for (const cell of safeCells) revealCell(game, cell.x, cell.y);
      equal(game.status, "won", "Todas as casas seguras reveladas devem resultar em vitória.");
      equal(game.revealedCount, 3, "As três casas seguras devem estar reveladas.");
    },
  },
  {
    id: "loss-condition",
    title: "Reconhece a derrota e revela as bombas",
    run() {
      const game = createGame({ width: 3, height: 2, mines: 2, rng: () => 0.3 });
      game.started = true;
      const mine = game.board.flat().find((cell) => cell.isMine);
      revealCell(game, mine.x, mine.y);
      equal(game.status, "lost", "Revelar uma bomba deve resultar em derrota.");
      equal(game.board.flat().filter((cell) => cell.isMine && cell.revealed).length, 2, "Todas as bombas devem ser reveladas.");
      equal(revealCell(game, 0, 0), false, "Ações não devem alterar uma partida encerrada.");
    },
  },
  {
    id: "new-game",
    title: "Inicia uma nova partida sem estado antigo",
    run() {
      const previous = createGame({ width: 3, height: 3, mines: 2, rng: () => 0.4 });
      toggleFlag(previous, 0, 0);
      revealCell(previous, 1, 1);
      const next = createGame({ width: 3, height: 3, mines: 2, rng: () => 0.6 });
      equal(next.status, "playing", "A nova partida deve começar ativa.");
      equal(next.flagsCount, 0, "A nova partida não deve herdar bandeiras.");
      equal(next.revealedCount, 0, "A nova partida não deve herdar casas reveladas.");
      equal(next.board.flat().every((cell) => !cell.revealed && !cell.flagged), true, "Todas as casas devem começar fechadas e sem bandeiras.");
    },
  },
];
