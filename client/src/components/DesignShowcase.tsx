import { useState } from "react";
import { ChessMenuVisual } from "./ChessMenuVisual";
import { ChessGameVisual } from "./ChessGameVisual";
import { RegisterPlayerVisual } from "./RegisterPlayerVisual";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Eye, Menu, Gamepad2, UserPlus } from "lucide-react";

/**
 * SHOWCASE DE DISEÑOS
 * 
 * Este componente permite alternar entre las diferentes vistas visuales
 * para ver el diseño sin funcionalidad.
 */

type DesignView = "selector" | "menu" | "game" | "register";

export function DesignShowcase() {
  const [currentView, setCurrentView] = useState<DesignView>("selector");

  // Selector de diseños
  if (currentView === "selector") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 p-8 max-w-2xl">
          <div className="text-center mb-8">
            <Eye className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-2">
              Galería de Diseños
            </h1>
            <p className="text-slate-400">
              Versiones solo visuales - Sin funcionalidad
            </p>
          </div>

          <div className="grid gap-4">
            <Button
              onClick={() => setCurrentView("menu")}
              className="w-full justify-start bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-6"
            >
              <Menu className="w-5 h-5 mr-3" />
              Ver Menú Principal
            </Button>

            <Button
              onClick={() => setCurrentView("game")}
              className="w-full justify-start bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-6"
            >
              <Gamepad2 className="w-5 h-5 mr-3" />
              Ver Tablero de Ajedrez
            </Button>

            <Button
              onClick={() => setCurrentView("register")}
              className="w-full justify-start bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-6"
            >
              <UserPlus className="w-5 h-5 mr-3" />
              Ver Formulario de Registro
            </Button>
          </div>

          <p className="text-slate-500 text-sm mt-6 text-center">
            💡 Tip: Estas versiones solo muestran el diseño sin lógica
          </p>
        </Card>
      </div>
    );
  }

  // Mostrar la vista seleccionada con botón de volver
  return (
    <div className="relative">
      {/* Botón para volver al selector */}
      <Button
        onClick={() => setCurrentView("selector")}
        variant="ghost"
        className="absolute top-4 right-4 z-50 text-slate-400 hover:text-white bg-slate-800/80 backdrop-blur-sm"
      >
        ← Volver al selector
      </Button>

      {/* Vista seleccionada */}
      {currentView === "menu" && <ChessMenuVisual />}
      {currentView === "game" && <ChessGameVisual />}
      {currentView === "register" && <RegisterPlayerVisual />}
    </div>
  );
}
