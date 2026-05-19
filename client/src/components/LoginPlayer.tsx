import { useState, useEffect } from "react";
import { Crown, LogIn, ArrowLeft, Mail, Lock, Eye, EyeOff, QrCode } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface LoginPlayerProps {
  onBack: () => void;
  onLogin: (email: string, password: string) => void;
  // We'll add a way to handle external login success
  onExternalLogin?: (user: { id: number, name: string, email: string }) => void;
}

export function LoginPlayer({ onBack, onLogin, onExternalLogin }: LoginPlayerProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // QR Login State
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isQrLoading, setIsQrLoading] = useState(true);

  useEffect(() => {
    let ws: WebSocket | null = null;

    const initQrLogin = async () => {
      try {
        setQrCode(null);
        setIsQrLoading(true);

        // Cerrar WebSocket anterior antes de abrir uno nuevo
        if (ws) ws.close();

        const host = window.location.hostname;
        // 1. Fetch QR from Auth Service
        const response = await fetch(`http://${host}:3002/auth/qr/generate`);
        const data = await response.json();
        setQrCode(data.qrCodeDataUrl);
        setSessionId(data.sessionId);

        // 2. Connect to Games Service WS to listen for success
        ws = new WebSocket(`ws://${host}:3004/ws`);

        ws.onopen = () => {
          console.log('WS Connected for QR Auth');
          ws?.send(JSON.stringify({
            action: 'subscribeAuth',
            payload: { sessionId: data.sessionId }
          }));
        };

        ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          if (message.type === 'login_success') {
            console.log('Login success via QR!', message.payload);
            const { tokenJwt, usuarioId, nombreUsuario } = message.payload;

            // Save token and user data
            localStorage.setItem('ajedrez_token', tokenJwt);
            // Call parent handler to update state and redirect
            if (onExternalLogin) {
              onExternalLogin({ id: usuarioId, name: nombreUsuario, email: 'google-user@auth.com' });
            }
          }
        };

      } catch (err) {
        console.error('Failed to init QR login:', err);
      } finally {
        setIsQrLoading(false);
      }
    };

    initQrLogin();

    // Regenerar QR cada 2 minutos
    const interval = setInterval(initQrLogin, 2 * 60 * 1000);

    return () => {
      clearInterval(interval);
      if (ws) ws.close();
    };
  }, [onExternalLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    setIsLoading(true);
    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        <Button variant="ghost" onClick={onBack} className="absolute top-8 left-8 text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver al menú
        </Button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Crown className="w-10 h-10 text-amber-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
              Entrar al Juego
            </h1>
          </div>
          <p className="text-slate-400">Escanea el QR o usa tu cuenta tradicional</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 w-full max-w-4xl">
          {/* QR Login Section */}
          <Card className="flex-1 bg-slate-800/40 backdrop-blur-md border-slate-700 p-8 flex flex-col items-center justify-center text-center">
            <div className="mb-6 bg-white p-4 rounded-xl shadow-2xl shadow-amber-500/20">
              {isQrLoading ? (
                <div className="w-48 h-48 flex items-center justify-center bg-slate-100 rounded-lg animate-pulse">
                  <QrCode className="w-12 h-12 text-slate-400" />
                </div>
              ) : (
                <img src={qrCode || ""} alt="QR Auth" className="w-48 h-48" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
              <LogIn className="w-5 h-5 text-amber-400" />
              Login rápido con QR
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              Escanea este código con tu celular e ingresa con tu cuenta para iniciar sesión.
            </p>
            <div className="flex items-center gap-2 text-amber-400/80 text-xs font-medium uppercase tracking-wider">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-ping" />
              Esperando escaneo...
            </div>
          </Card>

          {/* Traditional Login Section */}
          <Card className="flex-1 bg-slate-800/60 backdrop-blur-md border-slate-700">
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-md text-center">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 text-xs font-bold uppercase tracking-tight">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-slate-900/50 border-slate-700 text-white focus:ring-amber-500/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300 text-xs font-bold uppercase tracking-tight">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-slate-900/50 border-slate-700 text-white focus:ring-amber-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-100 hover:bg-white text-slate-900 font-bold py-6 mt-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? "Validando..." : "Ingresar con Correo"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
