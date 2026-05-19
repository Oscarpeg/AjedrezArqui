import { Crown, UserPlus, ArrowLeft, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useRegisterController } from "../controllers/useRegisterController";

interface RegisterPlayerProps {
  onBack: () => void;
  onRegister: (name: string, password: string, email: string) => void;
}

export function RegisterPlayer({ onBack, onRegister }: RegisterPlayerProps) {
  // MVC: Controlador asume toda la lógica y el estado.
  const { state, setters, onSubmit } = useRegisterController(onRegister);
  const { name, password, confirmPassword, email, showPassword, showConfirmPassword, errors } = state;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-10 left-10 text-6xl">♔</div>
        <div className="absolute top-40 right-20 text-5xl">♕</div>
        <div className="absolute bottom-20 left-1/4 text-7xl">♘</div>
        <div className="absolute bottom-40 right-1/3 text-6xl">♖</div>
        <div className="absolute top-1/3 right-10 text-5xl">♗</div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        <Button variant="ghost" onClick={onBack} className="absolute top-8 left-8 text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver al menú
        </Button>

        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Crown className="w-10 h-10 text-amber-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
              Registro de Jugador
            </h1>
          </div>
          <p className="text-slate-400">Crea tu cuenta para comenzar a jugar</p>
        </div>

        <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <form onSubmit={onSubmit} className="p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-200">Nombre de Jugador</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Ingresa tu nombre"
                  value={name}
                  onChange={(e) => setters.setName(e.target.value)}
                  className={`pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 ${errors.name ? "border-red-500" : ""}`}
                />
              </div>
              {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setters.setPassword(e.target.value)}
                  className={`pl-10 pr-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 ${errors.password ? "border-red-500" : ""}`}
                />
                <button type="button" onClick={() => setters.setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-200">Confirmar Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setters.setConfirmPassword(e.target.value)}
                  className={`pl-10 pr-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 ${errors.confirmPassword ? "border-red-500" : ""}`}
                />
                <button type="button" onClick={() => setters.setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-sm">{errors.confirmPassword}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setters.setEmail(e.target.value)}
                  className={`pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 ${errors.email ? "border-red-500" : ""}`}
                />
              </div>
              {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-6">
              <UserPlus className="w-5 h-5 mr-2" />
              Crear Cuenta
            </Button>
          </form>
        </Card>

        <p className="text-slate-500 text-sm mt-6 max-w-md text-center">
          Al registrarte, podrás guardar tu progreso, competir en torneos y seguir tu historial de partidas.
        </p>
      </div>
    </div>
  );
}