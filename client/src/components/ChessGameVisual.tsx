import { 
  ArrowLeft, 
  RotateCcw, 
  Flag, 
  Clock,
  User,
  Crown
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

/**
 * VERSIÓN SOLO DISEÑO - SIN FUNCIONALIDAD
 * 
 * Este componente muestra ÚNICAMENTE la parte visual del tablero de ajedrez.
 * No tiene estados, no se puede jugar, no hay lógica.
 * Es perfecto para ver el diseño puro.
 */

export function ChessGameVisual() {
  // TABLERO INICIAL - Solo visual, no cambia
  const board = [
    ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
    ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
    ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
  ];

  const whitePieces = ['♔', '♕', '♖', '♗', '♘', '♙'];
  const sampleMoves = ["e2 → e4", "e7 → e5", "Nf3 → Nc6"];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      
      {/* ========================================
          FONDO CON DEGRADADOS
          ======================================== */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>

      {/* ========================================
          PIEZAS DECORATIVAS DE FONDO
          ======================================== */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        <div className="absolute top-10 left-10 text-6xl">♔</div>
        <div className="absolute top-40 right-20 text-5xl">♕</div>
        <div className="absolute bottom-20 left-1/4 text-7xl">♘</div>
        <div className="absolute bottom-40 right-1/3 text-6xl">♖</div>
      </div>

      {/* ========================================
          CONTENIDO PRINCIPAL
          ======================================== */}
      <div className="relative z-10 min-h-screen p-4 md:p-8">
        
        {/* ========================================
            HEADER CON BOTONES DE CONTROL
            ======================================== */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver al menú
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reiniciar
            </Button>
            <Button
              variant="outline"
              className="border-red-600 text-red-400 hover:bg-red-600/10"
            >
              <Flag className="w-4 h-4 mr-2" />
              Rendirse
            </Button>
          </div>
        </div>

        {/* ========================================
            LAYOUT PRINCIPAL: 3 COLUMNAS
            ======================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 max-w-7xl mx-auto">
          
          {/* ========================================
              PANEL IZQUIERDO: INFO DEL OPONENTE
              ======================================== */}
          <div className="space-y-4 order-2 lg:order-1">
            {/* Card del Oponente */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Oponente</p>
                      <p className="text-slate-400 text-sm">Negras</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-slate-700 text-slate-400">
                    <Clock className="w-4 h-4 inline mr-1" />
                    10:00
                  </div>
                </div>
              </div>
            </Card>

            {/* Historial de Movimientos */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <div className="p-4">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  Historial de Movimientos
                </h3>
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {sampleMoves.map((move, index) => (
                    <div 
                      key={index}
                      className="text-slate-300 text-sm py-1 px-2 rounded hover:bg-slate-700/50"
                    >
                      <span className="text-amber-400 font-mono">{index + 1}.</span> {move}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* ========================================
              PANEL CENTRAL: TABLERO DE AJEDREZ
              ======================================== */}
          <div className="flex flex-col items-center order-1 lg:order-2">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 p-4">
              <div className="inline-block">
                
                {/* Letras de columnas (a-h) */}
                <div className="flex mb-1">
                  <div className="w-8"></div>
                  {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(letter => (
                    <div 
                      key={letter} 
                      className="w-12 md:w-16 text-center text-slate-400 text-sm font-semibold"
                    >
                      {letter}
                    </div>
                  ))}
                </div>

                {/* Tablero 8x8 */}
                {board.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex">
                    {/* Números de filas (8-1) */}
                    <div className="w-8 flex items-center justify-center text-slate-400 text-sm font-semibold">
                      {8 - rowIndex}
                    </div>
                    
                    {/* Casillas del tablero */}
                    {row.map((piece, colIndex) => {
                      const isLight = (rowIndex + colIndex) % 2 === 0;
                      
                      return (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={`
                            w-12 h-12 md:w-16 md:h-16
                            flex items-center justify-center
                            text-3xl md:text-4xl
                            transition-all duration-200
                            ${isLight ? 'bg-amber-100' : 'bg-amber-800'}
                            hover:scale-105 cursor-pointer
                          `}
                        >
                          {piece && (
                            <span className={`
                              ${whitePieces.includes(piece) 
                                ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' 
                                : 'text-black drop-shadow-[0_1px_2px_rgba(255,255,255,0.3)]'
                              }
                            `}>
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

            {/* Indicador de Turno */}
            <div className="mt-4 px-6 py-3 rounded-lg bg-slate-800/50 backdrop-blur-sm border border-slate-700">
              <p className="text-center">
                <span className="text-slate-400">Turno: </span>
                <span className="font-semibold text-white">Blancas</span>
              </p>
            </div>
          </div>

          {/* ========================================
              PANEL DERECHO: INFO DEL JUGADOR
              ======================================== */}
          <div className="order-3">
            {/* Card del Jugador */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Jugador</p>
                      <p className="text-slate-400 text-sm">Blancas</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-400">
                    <Clock className="w-4 h-4 inline mr-1" />
                    10:00
                  </div>
                </div>
              </div>
            </Card>

            {/* Piezas Capturadas */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 mt-4">
              <div className="p-4">
                <h3 className="text-white font-semibold mb-3">Piezas Capturadas</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Negras capturadas:</p>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-slate-600 text-sm">Ninguna</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Blancas capturadas:</p>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-slate-600 text-sm">Ninguna</span>
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
