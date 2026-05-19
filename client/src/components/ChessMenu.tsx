import { useState } from "react";
import {
  Crown,
  Play,
  Settings,
  Trophy,
  Users,
  Clock,
  Sparkles,
  UserX
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";

import type { GameMode } from "../models/types";

interface ChessMenuProps {
  onNavigateToRegister: () => void;
  onNavigateToLogin: () => void;
  onNavigateToGame: (mode: GameMode, color: 'white' | 'black' | 'random', difficulty?: 'easy' | 'medium' | 'hard') => void;
  onNavigateToHistory: () => void;
  onNavigateAsGuest: () => void;
  onLogout: () => void;
  playerName?: string;
}

export function ChessMenu({ onNavigateToRegister, onNavigateToLogin, onNavigateToGame, onNavigateToHistory, onNavigateAsGuest, onLogout, playerName }: ChessMenuProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<'white' | 'black' | 'random'>('white');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const menuItems = [
    {
      id: "new-game",
      label: "Nueva Partida",
      icon: Play,
      color: "from-emerald-500 to-teal-600",
      onClick: () => onNavigateToGame('standard', selectedColor, selectedDifficulty),
      habilitado: true
    },
    {
      id: "quick-play",
      label: "Partida Fast",
      icon: Clock,
      color: "from-blue-500 to-cyan-600",
      onClick: () => onNavigateToGame('fast', selectedColor, selectedDifficulty),
      habilitado: true
    },
    {
      id: "multiplayer",
      label: "Multiplayer (PvP)",
      icon: Users,
      color: "from-purple-500 to-pink-600",
      onClick: () => onNavigateToGame('multiplayer', 'random'),
      habilitado: true
    },
    {
      id: "tournaments",
      label: "Historial",
      icon: Trophy,
      color: "from-amber-500 to-orange-600",
      onClick: onNavigateToHistory,
      habilitado: true
    },
    {
      id: "guest-play",
      label: "Jugar como invitado",
      icon: UserX,
      color: "from-indigo-500 to-blue-600",
      onClick: onNavigateAsGuest,
      habilitado: true
    },
    {
      id: "settings",
      label: "Configuración",
      icon: Settings,
      color: "from-slate-500 to-gray-600",
      habilitado: false
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 opacity-20">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1739416333363-4b01dd9874c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVzcyUyMGJvYXJkJTIwcGllY2VzJTIwZGFya3xlbnwxfHx8fDE3NzI3NDk2ODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Chess board"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>

      {/* Animated Pieces Background Pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-10 left-10 text-6xl">♔</div>
        <div className="absolute top-40 right-20 text-5xl">♕</div>
        <div className="absolute bottom-20 left-1/4 text-7xl">♘</div>
        <div className="absolute bottom-40 right-1/3 text-6xl">♖</div>
        <div className="absolute top-1/3 right-10 text-5xl">♗</div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Title */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Crown className="w-16 h-16 text-amber-400" />
            <h1 className="text-7xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent drop-shadow-sm">
              CHESS
            </h1>
            <Crown className="w-16 h-16 text-amber-400" />
          </div>
          <p className="text-slate-400 text-lg flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            Domina el tablero, maestro
            <Sparkles className="w-5 h-5" />
          </p>
        </div>

        {/* Color Selection */}
        <div className="flex items-center gap-4 mb-8 bg-slate-800/50 p-2 rounded-lg border border-slate-700 animate-fade-in shadow-xl backdrop-blur-md">
          <span className="text-slate-400 text-sm ml-2 font-medium">Jugar como:</span>
          <div className="flex bg-slate-900/50 p-1 rounded-md gap-1">
            <Button
              variant={selectedColor === 'white' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedColor('white')}
              className={`transition-all duration-200 ${selectedColor === 'white' ? 'bg-amber-100 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Blancas
            </Button>
            <Button
              variant={selectedColor === 'black' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedColor('black')}
              className={`transition-all duration-200 ${selectedColor === 'black' ? 'bg-slate-700 text-white shadow-lg border border-slate-600' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Negras
            </Button>
            <Button
              variant={selectedColor === 'random' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedColor('random')}
              className={`transition-all duration-200 ${selectedColor === 'random' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Aleatorio
            </Button>
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="flex items-center gap-4 mb-8 bg-slate-800/50 p-2 rounded-lg border border-slate-700 animate-fade-in shadow-xl backdrop-blur-md">
          <span className="text-slate-400 text-sm ml-2 font-medium">Dificultad IA:</span>
          <div className="flex bg-slate-900/50 p-1 rounded-md gap-1">
            <Button
              variant={selectedDifficulty === 'easy' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedDifficulty('easy')}
              className={`transition-all duration-200 ${selectedDifficulty === 'easy' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Fácil
            </Button>
            <Button
              variant={selectedDifficulty === 'medium' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedDifficulty('medium')}
              className={`transition-all duration-200 ${selectedDifficulty === 'medium' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Medio
            </Button>
            <Button
              variant={selectedDifficulty === 'hard' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedDifficulty('hard')}
              className={`transition-all duration-200 ${selectedDifficulty === 'hard' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Difícil
            </Button>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isHovered = hoveredItem === item.id;
            const isDisabled = !item.habilitado;

            return (
              <Card
                key={item.id}
                className={`
                  relative overflow-hidden
                  transition-all duration-300 ease-out
                  ${isDisabled
                    ? 'cursor-not-allowed opacity-50'
                    : 'cursor-pointer hover:bg-slate-800/70'
                  }
                  ${isHovered && !isDisabled ? 'scale-105 shadow-2xl' : 'scale-100'}
                  bg-slate-800/50 backdrop-blur-sm border-slate-700
                `}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* Gradient Background on Hover */}
                <div
                  className={`
                    absolute inset-0 bg-gradient-to-br ${item.color} 
                    transition-opacity duration-300
                    ${isHovered && !isDisabled ? 'opacity-20' : 'opacity-0'}
                  `}
                />

                <Button
                  variant="ghost"
                  className={`
                    w-full h-full p-6 flex flex-col items-start justify-between min-h-[140px] relative z-10 hover:bg-transparent
                    ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  onClick={isDisabled ? undefined : item.onClick}
                  disabled={isDisabled}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className={`
                      p-3 rounded-lg bg-gradient-to-br ${item.color}
                      transition-transform duration-300
                      ${isHovered && !isDisabled ? 'scale-110 rotate-3' : 'scale-100'}
                    `}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className={`font-semibold text-lg ${isDisabled ? 'text-slate-500' : 'text-white'}`}>
                        {item.label}
                      </h3>
                      {isDisabled && (
                        <p className="text-slate-600 text-xs mt-1">Próximamente</p>
                      )}
                    </div>
                  </div>
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Footer / Player Info */}
        <div className="mt-12 text-center space-y-4">
          {playerName ? (
            <div className="flex flex-col items-center gap-3">
              <div className="text-slate-300">
                Bienvenido, <span className="text-amber-400 font-semibold">{playerName}</span>
              </div>
              <Button
                onClick={() => window.location.href = '/mobile-confirm'}
                variant="outline"
                className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 cursor-pointer"
              >
                &#128247; Vincular PC con QR
              </Button>
              <Button
                onClick={onLogout}
                variant="ghost"
                className="text-slate-500 hover:text-red-400 cursor-pointer text-sm"
              >
                Cerrar sesión
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={onNavigateToLogin}
                variant="outline"
                className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 cursor-pointer"
              >
                Iniciar Sesión
              </Button>
              <Button
                onClick={onNavigateToRegister}
                variant="outline"
                className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 cursor-pointer"
              >
                <Users className="w-4 h-4 mr-2" />
                Registrar Jugador
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}