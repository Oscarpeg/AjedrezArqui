import { ArrowLeft, Trophy, Calendar, Hash, Swords } from "lucide-react";
import { storageModel } from "../models/storageModel";
import type { GameRecord } from "../models/types";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface MatchHistoryProps {
  onBack: () => void;
}

export function MatchHistory({ onBack }: MatchHistoryProps) {
  // MVC: Vista pura, lee de la función exportada por el modelo
  const history: GameRecord[] = storageModel.getHistory();

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('es-CO', { 
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    }).format(d);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
      
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl">♔</div>
        <div className="absolute bottom-20 right-20 text-7xl">♖</div>
      </div>

      <div className="relative z-10 min-h-screen p-4 md:p-8 max-w-5xl mx-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </Button>
          <div className="flex-1"></div>
        </div>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 mb-4 ring-1 ring-amber-500/30">
            <Trophy className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent mb-4 tracking-tight">
            Historial de Partidas
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Revisa tu progreso, estadísticas y registros de todos tus encuentros jugados de forma local.
          </p>
        </div>

        {/* Listado de Historial */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
          {history.length === 0 ? (
            <Card className="bg-slate-800/30 border-slate-700/50 border-dashed border-2 flex flex-col items-center justify-center p-12">
              <Swords className="w-12 h-12 text-slate-600 mb-4" />
              <p className="text-slate-400 text-lg">Aún no has jugado ninguna partida.</p>
              <p className="text-slate-500">Únete a una nueva partida y aparecerá aquí.</p>
            </Card>
          ) : (
            history.map((record) => (
              <Card key={record.id} className="bg-slate-800/60 backdrop-blur-sm border-slate-700 hover:bg-slate-800 transition-colors overflow-hidden group">
                <div className="flex flex-col sm:flex-row sm:items-center p-5 gap-6">
                  
                  {/* Fecha y Estado */}
                  <div className="flex items-center gap-4 min-w-[180px]">
                    <div className="w-12 h-12 rounded-xl bg-slate-900/80 flex items-center justify-center border border-slate-700">
                      <Calendar className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{formatDate(record.date)}</h4>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold bg-slate-700 text-slate-300">
                        {record.reason}
                      </span>
                    </div>
                  </div>

                  <div className="hidden sm:block w-px h-12 bg-slate-700"></div>

                  {/* Info Partida */}
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider font-semibold">Movimientos</p>
                      <p className="text-slate-200 font-medium flex items-center gap-2">
                        <Hash className="w-4 h-4 text-amber-500" />
                        {record.movesCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider font-semibold">Capturas Blancas</p>
                      <p className="text-emerald-400 font-medium">{record.whiteCaptures}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider font-semibold">Capturas Negras</p>
                      <p className="text-rose-400 font-medium">{record.blackCaptures}</p>
                    </div>
                  </div>

                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
