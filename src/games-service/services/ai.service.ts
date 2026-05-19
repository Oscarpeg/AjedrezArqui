import { Chess, Move } from 'chess.js';

export type Difficulty = 'easy' | 'medium' | 'hard';

export class AIService {
  private static pieceValues: Record<string, number> = {
    p: 10,
    n: 30,
    b: 30,
    r: 50,
    q: 90,
    k: 900
  };

  // Piece-Square Tables (Simple version for center control)
  private static pst: Record<string, number[][]> = {
    p: [
      [0,  0,  0,  0,  0,  0,  0,  0],
      [50, 50, 50, 50, 50, 50, 50, 50],
      [10, 10, 20, 30, 30, 20, 10, 10],
      [5,  5, 10, 25, 25, 10,  5,  5],
      [0,  0,  0, 20, 20,  0,  0,  0],
      [5, -5,-10,  0,  0,-10, -5,  5],
      [5, 10, 10,-20,-20, 10, 10,  5],
      [0,  0,  0,  0,  0,  0,  0,  0]
    ],
    n: [
      [-50,-40,-30,-30,-30,-30,-40,-50],
      [-40,-20,  0,  0,  0,  0,-20,-40],
      [-30,  0, 10, 15, 15, 10,  0,-30],
      [-30,  5, 15, 20, 20, 15,  5,-30],
      [-30,  0, 15, 20, 20, 15,  0,-30],
      [-30,  5, 10, 15, 15, 10,  5,-30],
      [-40,-20,  0,  5,  5,  0,-20,-40],
      [-50,-40,-30,-30,-30,-30,-40,-50]
    ],
    b: [
      [-20,-10,-10,-10,-10,-10,-10,-20],
      [-10,  0,  0,  0,  0,  0,  0,-10],
      [-10,  0,  5, 10, 10,  5,  0,-10],
      [-10,  5,  5, 10, 10,  5,  5,-10],
      [-10,  0, 10, 10, 10, 10,  0,-10],
      [-10, 10, 10, 10, 10, 10, 10,-10],
      [-10,  5,  0,  0,  0,  0,  5,-10],
      [-20,-10,-10,-10,-10,-10,-10,-20]
    ],
    r: [
      [0,  0,  0,  0,  0,  0,  0,  0],
      [5, 10, 10, 10, 10, 10, 10,  5],
      [-5,  0,  0,  0,  0,  0,  0, -5],
      [-5,  0,  0,  0,  0,  0,  0, -5],
      [-5,  0,  0,  0,  0,  0,  0, -5],
      [-5,  0,  0,  0,  0,  0,  0, -5],
      [-5,  0,  0,  0,  0,  0,  0, -5],
      [0,  0,  0,  5,  5,  0,  0,  0]
    ],
    q: [
      [-20,-10,-10, -5, -5,-10,-10,-20],
      [-10,  0,  0,  0,  0,  0,  0,-10],
      [-10,  0,  5,  5,  5,  5,  0,-10],
      [-5,  0,  5,  5,  5,  5,  0, -5],
      [0,  0,  5,  5,  5,  5,  0, -5],
      [-10,  5,  5,  5,  5,  5,  0,-10],
      [-10,  0,  5,  0,  0,  0,  0,-10],
      [-20,-10,-10, -5, -5,-10,-10,-20]
    ],
    k: [
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-20,-30,-30,-40,-40,-30,-30,-20],
      [-10,-20,-20,-20,-20,-20,-20,-10],
      [20, 20,  0,  0,  0,  0, 20, 20],
      [20, 30, 10,  0,  0, 10, 30, 20]
    ]
  };

  public static getBestMove(game: Chess, difficulty: Difficulty): Move {
    const possibleMoves = game.moves({ verbose: true });

    if (difficulty === 'easy') {
      return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    }

    if (difficulty === 'medium') {
      return this.getMediumMove(game, possibleMoves);
    }

    // Hard: Minimax depth 2
    return this.getHardMove(game, possibleMoves);
  }

  private static getMediumMove(game: Chess, moves: Move[]): Move {
    let bestMove = moves[0];
    let bestValue = -Infinity;

    for (const move of moves) {
      // Priorizar capturas
      let value = 0;
      if (move.captured) {
        value += this.pieceValues[move.captured] * 10;
      }

      // Evitar colgar piezas (evaluación rápida de 1 nivel)
      game.move(move);
      const opponentMoves = game.moves({ verbose: true });
      const maxOpponentCapture = Math.max(0, ...opponentMoves.map(m => m.captured ? this.pieceValues[m.captured] : 0));
      value -= maxOpponentCapture * 5;
      game.undo();

      if (value > bestValue) {
        bestValue = value;
        bestMove = move;
      } else if (value === bestValue && Math.random() < 0.5) {
        bestMove = move;
      }
    }

    return bestMove;
  }

  private static getHardMove(game: Chess, moves: Move[]): Move {
    let bestMove = moves[0];
    let bestValue = -Infinity;
    const isWhite = game.turn() === 'w';

    for (const move of moves) {
      game.move(move);
      const boardValue = -this.minimax(game, 1, -Infinity, Infinity, !isWhite);
      game.undo();

      if (boardValue > bestValue) {
        bestValue = boardValue;
        bestMove = move;
      }
    }

    return bestMove;
  }

  private static minimax(game: Chess, depth: number, alpha: number, beta: number, isMaximizingPlayer: boolean): number {
    if (depth === 0 || game.isGameOver()) {
      return this.evaluateBoard(game);
    }

    const moves = game.moves();

    if (isMaximizingPlayer) {
      let bestValue = -Infinity;
      for (const move of moves) {
        game.move(move);
        bestValue = Math.max(bestValue, this.minimax(game, depth - 1, alpha, beta, !isMaximizingPlayer));
        game.undo();
        alpha = Math.max(alpha, bestValue);
        if (beta <= alpha) break;
      }
      return bestValue;
    } else {
      let bestValue = Infinity;
      for (const move of moves) {
        game.move(move);
        bestValue = Math.min(bestValue, this.minimax(game, depth - 1, alpha, beta, !isMaximizingPlayer));
        game.undo();
        beta = Math.min(beta, bestValue);
        if (beta <= alpha) break;
      }
      return bestValue;
    }
  }

  private static evaluateBoard(game: Chess): number {
    let totalEvaluation = 0;
    const board = game.board();

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        totalEvaluation += this.getPieceValue(board[i][j], i, j);
      }
    }
    return totalEvaluation;
  }

  private static getPieceValue(piece: { type: string; color: string } | null, x: number, y: number): number {
    if (piece === null) return 0;

    const absoluteValue = this.pieceValues[piece.type] + (this.pst[piece.type]?.[piece.color === 'w' ? x : 7 - x][y] || 0);
    return piece.color === 'w' ? absoluteValue : -absoluteValue;
  }
}
