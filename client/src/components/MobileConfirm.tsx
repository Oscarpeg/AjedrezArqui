import { useState, useEffect, useRef } from "react";
import jsQR from "jsqr";

const AUTH_SERVICE = `http://${window.location.hostname}:3002`;

function getLoggedInUser(): { userId: number; name: string } | null {
  try {
    const token = localStorage.getItem("ajedrez_token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    const saved = localStorage.getItem("ajedrez_user");
    const name = saved ? JSON.parse(saved).name : payload.correoElectronico;
    return { userId: payload.usuarioId, name };
  } catch {
    return null;
  }
}

export function MobileConfirm() {
  const [user, setUser] = useState<{ userId: number; name: string } | null>(null);
  const [status, setStatus] = useState<"scanning" | "confirming" | "done" | "error" | "no_camera">("scanning");
  const [error, setError] = useState("");

  // Estado para usuario NO logueado
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const u = getLoggedInUser();
    setUser(u);
    if (u) startCamera();
    return () => stopCamera();
  }, []);

  const stopCamera = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    intervalRef.current = null;
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      intervalRef.current = window.setInterval(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code?.data && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(code.data)) {
          stopCamera();
          const u = getLoggedInUser();
          if (u) confirmSession(code.data, u.userId);
        }
      }, 300);

    } catch {
      setStatus("no_camera");
    }
  };

  const confirmSession = async (sid: string, userId: number) => {
    setStatus("confirming");
    setError("");
    try {
      const res = await fetch(`${AUTH_SERVICE}/auth/qr/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, userId }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("done");
      } else {
        setError(data.error || "Sesión inválida o expirada");
        setStatus("error");
      }
    } catch {
      setError("Error de conexión con el servidor");
      setStatus("error");
    }
  };

  const handleLoginAndConfirm = async () => {
    if (!email || !password || !sessionId.trim()) { setError("Completa todos los campos"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${AUTH_SERVICE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correoElectronico: email, contrasena: password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Credenciales inválidas"); setLoading(false); return; }
      localStorage.setItem("ajedrez_token", data.tokenJwt);
      localStorage.setItem("ajedrez_user", JSON.stringify({ name: data.nombreUsuario }));
      await confirmSession(sessionId.trim(), data.usuarioId);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  // ── Éxito ─────────────────────────────────────────────────────────
  if (status === "done") return (
    <div style={s.page}>
      <div style={s.card}>
        <p style={s.success}>&#10003; Sesión autorizada.<br />Vuelve a tu computadora.</p>
      </div>
    </div>
  );

  // ── Confirmando ────────────────────────────────────────────────────
  if (status === "confirming") return (
    <div style={s.page}>
      <div style={s.card}>
        <p style={s.info}>Autorizando sesión...</p>
      </div>
    </div>
  );

  // ── Error ──────────────────────────────────────────────────────────
  if (status === "error") return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.title}>&#9813; Ajedrez</h1>
        <p style={s.errorText}>{error}</p>
        <button style={s.btn} onClick={() => { setStatus("scanning"); setError(""); if (user) startCamera(); }}>
          Intentar de nuevo
        </button>
      </div>
    </div>
  );

  // ── Usuario logueado — cámara activa ───────────────────────────────
  if (user && status === "scanning") return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.title}>&#9813; Vincular PC</h1>
        <p style={s.info}>
          Hola <strong style={{ color: "#fbbf24" }}>{user.name}</strong>, apunta la cámara al QR de tu PC.
        </p>
        <video ref={videoRef} style={s.video} muted playsInline />
        <canvas ref={canvasRef} style={{ display: "none" }} />
        <p style={{ ...s.info, textAlign: "center", marginTop: "0.75rem", fontSize: "0.75rem" }}>
          Escaneando automáticamente...
        </p>
      </div>
    </div>
  );

  // ── Usuario logueado — sin BarcodeDetector (fallback manual) ───────
  if (user && status === "no_camera") return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.title}>&#9813; Vincular PC</h1>
        <p style={s.info}>
          Hola <strong style={{ color: "#fbbf24" }}>{user.name}</strong>
        </p>
        <p style={s.info}>Tu navegador no soporta escaneo automático. Pega el código del QR:</p>
        <input style={s.input} placeholder="Código del QR" value={sessionId} onChange={e => setSessionId(e.target.value)} />
        {error && <p style={s.errorText}>{error}</p>}
        <button
          style={{ ...s.btn, opacity: sessionId.trim() ? 1 : 0.5 }}
          disabled={!sessionId.trim()}
          onClick={() => confirmSession(sessionId.trim(), user.userId)}
        >
          Autorizar
        </button>
      </div>
    </div>
  );

  // ── Usuario NO logueado ────────────────────────────────────────────
  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.title}>&#9813; Vincular PC</h1>
        <p style={s.info}>Inicia sesión en tu celular para vincular el PC.</p>
        {error && <p style={s.errorText}>{error}</p>}
        <label style={s.label}>Correo electrónico</label>
        <input style={s.input} type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
        <label style={s.label}>Contraseña</label>
        <input style={s.input} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
        <label style={s.label}>Código del QR</label>
        <input style={s.input} placeholder="Pega el código del QR" value={sessionId} onChange={e => setSessionId(e.target.value)} />
        <button
          style={{ ...s.btn, opacity: (email && password && sessionId.trim() && !loading) ? 1 : 0.5 }}
          disabled={!email || !password || !sessionId.trim() || loading}
          onClick={handleLoginAndConfirm}
        >
          {loading ? "Autorizando..." : "Iniciar sesión y vincular"}
        </button>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", fontFamily: "system-ui, sans-serif" },
  card: { background: "#1e293b", border: "1px solid #334155", borderRadius: "1rem", padding: "2rem", width: "100%", maxWidth: "380px" },
  title: { color: "#fbbf24", fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" },
  label: { display: "block", color: "#cbd5e1", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.375rem" },
  input: { width: "100%", padding: "0.75rem 1rem", borderRadius: "0.5rem", background: "#0f172a", border: "1px solid #475569", color: "#f1f5f9", fontSize: "0.875rem", marginBottom: "0.75rem", outline: "none", boxSizing: "border-box" },
  btn: { width: "100%", padding: "0.875rem", borderRadius: "0.5rem", background: "#fbbf24", color: "#0f172a", fontWeight: 700, fontSize: "1rem", border: "none", cursor: "pointer", marginTop: "0.5rem" },
  video: { width: "100%", borderRadius: "0.5rem", background: "#000", aspectRatio: "4/3" },
  info: { color: "#94a3b8", fontSize: "0.875rem", marginBottom: "0.75rem" },
  errorText: { background: "#450a0a", border: "1px solid #991b1b", color: "#fca5a5", padding: "0.75rem", borderRadius: "0.5rem", fontSize: "0.875rem", marginBottom: "1rem" },
  success: { color: "#4ade80", fontSize: "1.1rem", fontWeight: 600, textAlign: "center", lineHeight: 1.8 },
};
