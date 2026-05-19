import { ArrowLeft, RotateCcw, Flag, Clock, User, Crown, Copy } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useChessGameController } from "../controllers/useChessGameController";

import type { GameMode } from "../models/types";

interface ChessGameProps {
  onBack: () => void;
  playerName?: string;
  playerId: number;
  gameId: number;
  gameMode: GameMode;
  preferredColor?: 'white' | 'black' | 'random';
  difficulty?: 'easy' | 'medium' | 'hard';
}

export function ChessGame({ onBack, playerName = "Jugador", playerId, gameId, gameMode, preferredColor = 'white', difficulty = 'medium' }: ChessGameProps) {
  // MVC: Controlador asume lógica de turnos, timers, y reglas de la partida.
  const { state, actions } = useChessGameController(playerName, playerId, gameId, gameMode, onBack, preferredColor, difficulty);
  const { board, currentTurn, whiteTime, blackTime, moves, whiteCaptures, blackCaptures, selectedSquare, legalMovesForSelected, kingInCheck } = state;
  const whitePieces = ['♔', '♕', '♖', '♗', '♘', '♙'];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
      <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl">♔</div>
        <div className="absolute top-40 right-20 text-5xl">♕</div>
        <div className="absolute bottom-20 left-1/4 text-7xl">♘</div>
        <div className="absolute bottom-40 right-1/3 text-6xl">♖</div>
      </div>

      <div className="relative z-10 min-h-screen p-4 md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row items-start lg:items-center justify-between mb-6">
          <Button variant="ghost" onClick={actions.handleVolver} className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver al menú
          </Button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-300">
              <Clock className="w-4 h-4 text-amber-300" />
              Modo: {gameMode === 'standard' ? 'Nueva Partida (IA)' : gameMode === 'fast' ? 'Partida Fast' : 'Multiplayer'}
            </span>
            <div className="flex items-center gap-3">
               <Button variant="outline" onClick={actions.handleRestart} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                 <RotateCcw className="w-4 h-4 mr-2" />
                 Reiniciar
               </Button>
               <Button variant="outline" onClick={actions.handleSurrender} className="border-red-600 text-red-400 hover:bg-red-600/10">
                 <Flag className="w-4 h-4 mr-2" />
                 Rendirse
               </Button>
            </div>
          </div>
        </div>

        {gameMode === 'multiplayer' && (
          <Card className="mb-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <div className="p-4">
              <h3 className="text-white font-semibold mb-3">Multiplayer</h3>
              <p className="text-slate-400 mb-3 text-sm">
                Crea una sala y comparte el código con tu oponente. Si ya tienes código, únete para empezar la partida.
              </p>
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <Button
                  variant="secondary"
                  onClick={actions.handleCreateRoom}
                  className="w-full"
                >
                  Crear sala
                </Button>
                <div className="space-y-2">
                  <input
                    value={state.roomCodeInput}
                    onChange={e => actions.setRoomCodeInput(e.target.value)}
                    placeholder="Código de sala"
                    className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                  />
                  <Button
                    variant="secondary"
                    onClick={actions.handleJoinRoom}
                    className="w-full"
                  >
                    Unirse a sala
                  </Button>
                </div>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Tu ID de sesión: {playerId}
              </div>
              <div className="mt-4 text-slate-300 text-sm space-y-2">
                {state.roomCode && (
                  <div className="flex flex-col gap-2">
                    <div className="rounded border border-slate-700 bg-slate-900/80 px-3 py-2">
                      <span className="text-slate-100">Código actual: </span>
                      <strong className="text-white">{state.roomCode}</strong>
                    </div>
                    <Button
                      variant="outline"
                      onClick={actions.handleCopyRoomCode}
                      className="inline-flex items-center gap-2 px-3 py-2"
                    >
                      <Copy className="w-4 h-4" /> Copiar código
                    </Button>
                  </div>
                )}
                {state.multiplayerStatus && <p>{state.multiplayerStatus}</p>}
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 max-w-7xl mx-auto">
          {/* Panel Izquierdo: Oponente e Historial */}
          <div className="space-y-4 order-2 lg:order-1">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                       <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{gameMode === 'multiplayer' && state.opponentName ? state.opponentName : 'Oponente Local'}</p>
                      <p className="text-slate-400 text-sm">{state.playerColor === 'white' ? 'Negras' : 'Blancas'}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-lg ${currentTurn === 'black' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'}`}>
                    <Clock className="w-4 h-4 inline mr-1" />
                    {formatTime(blackTime)}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <div className="p-4">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  Historial de Movimientos
                </h3>
                <div className="max-h-64 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                  {moves.length === 0 ? (
                    <p className="text-slate-500 text-sm italic">Haz un movimiento para empezar</p>
                  ) : (
                    moves.map((move, index) => (
                      <div key={index} className="text-slate-300 text-sm py-1 px-2 rounded bg-slate-800/80 mb-1 border border-slate-700/50 flex gap-2">
                        <span className="text-amber-500 font-mono w-6">{index + 1}.</span> 
                        <span className="font-mono text-emerald-400/90">{move}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Panel Central: Tablero Interactivo */}
          <div className="flex flex-col items-center order-1 lg:order-2">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 p-4 shadow-2xl relative">
              <div className="inline-block relative">
                <div className="flex mb-1">
                  <div className="w-8"></div>
                  {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(letter => (
                    <div key={letter} className="w-12 md:w-16 text-center text-slate-500 text-sm font-semibold uppercase">{letter}</div>
                  ))}
                </div>

                {board.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex">
                    <div className="w-8 flex items-center justify-center text-slate-500 text-sm font-semibold">{8 - rowIndex}</div>
                    {row.map((piece, colIndex) => {
                      const isLight = (rowIndex + colIndex) % 2 === 0;
                      const isSelected = selectedSquare?.row === rowIndex && selectedSquare?.col === colIndex;
                      const squareName = `${String.fromCharCode(97 + colIndex)}${8 - rowIndex}`;
                      const isLegalMove = legalMovesForSelected.includes(squareName);
                      const isKingInCheck = kingInCheck?.row === rowIndex && kingInCheck?.col === colIndex;
                      
                      return (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          onClick={() => actions.handleSquareClick(rowIndex, colIndex)}
                          className={`
                            relative w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-3xl md:text-4xl transition-all duration-200
                            ${isLight ? 'bg-amber-100/90' : 'bg-amber-800/90'}
                            ${isSelected ? 'ring-4 ring-emerald-400 ring-inset opacity-90 scale-95 z-10' : ''}
                            ${isKingInCheck ? 'bg-red-500/80' : ''}
                            hover:opacity-80 cursor-pointer
                          `}
                        >
                          {isLegalMove && !piece && (
                            <div className="absolute w-4 h-4 rounded-full bg-emerald-500/40 animate-pulse"></div>
                          )}
                          {isLegalMove && piece && (
                            <div className="absolute inset-0 border-4 border-emerald-500/40 rounded-sm"></div>
                          )}
                          {piece && (
                            <span className={`${whitePieces.includes(piece) ? 'text-white' : 'text-black opacity-90'} ${isSelected ? 'drop-shadow-lg' : ''} transition-transform duration-200 hover:scale-110`}>
                              {piece}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </Card>

            <div className="mt-4 px-6 py-3 rounded-lg bg-slate-800/80 backdrop-blur-sm border border-slate-700 shadow-lg">
              <p className="text-center flex items-center gap-2">
                <span className="text-slate-400">Turno de: </span>
                <span className={`font-bold px-3 py-1 rounded ${currentTurn === 'white' ? 'bg-amber-100/10 text-white' : 'bg-slate-900/50 text-slate-300'}`}>
                  {currentTurn === 'white' ? 'Blancas' : 'Negras'}
                </span>
              </p>
            </div>
          </div>

          {/* Panel Derecho: Info del Jugador */}
          <div className="order-3">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{playerName}</p>
                      <p className="text-slate-400 text-sm">{state.playerColor === 'white' ? 'Blancas' : 'Negras'}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-lg ${currentTurn === 'white' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'}`}>
                    <Clock className="w-4 h-4 inline mr-1" />
                    {formatTime(whiteTime)}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 mt-4">
              <div className="p-4">
                <h3 className="text-white font-semibold mb-3">Piezas Capturadas</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Por las Blancas:</p>
                    <div className="flex flex-wrap gap-1 min-h-8 p-2 rounded bg-slate-900/50">
                      {whiteCaptures.length === 0 ? <span className="text-slate-600 text-sm italic">Ninguna</span> : whiteCaptures.map((p, i) => <span key={i} className="text-2xl text-black opacity-80">{p}</span>)}
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Por las Negras:</p>
                    <div className="flex flex-wrap gap-1 min-h-8 p-2 rounded bg-amber-900/20">
                      {blackCaptures.length === 0 ? <span className="text-slate-600 text-sm italic">Ninguna</span> : blackCaptures.map((p, i) => <span key={i} className="text-2xl text-white">{p}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
