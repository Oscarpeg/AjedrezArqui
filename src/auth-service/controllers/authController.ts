import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import QRCode from 'qrcode';
import { sessionManager } from '../services/sessionManager';

const USERS_SERVICE_URL = 'http://localhost:3001';
const GAMES_SERVICE_URL = 'http://localhost:3004';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretajedrez';

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { correoElectronico, contrasena } = req.body;
    if (!correoElectronico || !contrasena) {
      res.status(400).json({ error: 'Faltan campos obligatorios' });
      return;
    }
    const response = await axios.get(`${USERS_SERVICE_URL}/internal/users/email/${correoElectronico}`);
    const user = response.data;
    const isMatch = await bcrypt.compare(contrasena, user.contrasena);
    if (!isMatch) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }
    const tokenJwt = jwt.sign({ usuarioId: user.usuarioId, correoElectronico: user.correoElectronico }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ tokenJwt, usuarioId: user.usuarioId, nombreUsuario: user.nombreUsuario });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};

export const generateQr = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = sessionManager.createSession();
    const qrCodeDataUrl = await QRCode.toDataURL(sessionId);

    res.json({ sessionId, qrCodeDataUrl });
  } catch (error) {
    console.error('Error in generateQr:', error);
    res.status(500).json({ error: 'Error generating QR' });
  }
};

export const confirmQr = async (req: Request, res: Response): Promise<void> => {
  const { sessionId, userId } = req.body;

  const session = sessionManager.getSession(sessionId);
  if (!session || (session.status !== 'pending' && session.status !== 'scanned')) {
    res.status(400).json({ error: 'Sesión inválida o expirada' });
    return;
  }

  try {
    const userResponse = await axios.get(`${USERS_SERVICE_URL}/internal/users/${userId}`);
    const user = userResponse.data;

    const tokenJwt = jwt.sign(
      { usuarioId: user.usuarioId, correoElectronico: user.correoElectronico },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    sessionManager.updateSession(sessionId, {
      status: 'authenticated',
      userData: { usuarioId: user.usuarioId, nombreUsuario: user.nombreUsuario },
      jwt: tokenJwt,
    });

    try {
      await axios.post(`${GAMES_SERVICE_URL}/internal/auth-notify`, {
        sessionId,
        tokenJwt,
        user: { usuarioId: user.usuarioId, nombreUsuario: user.nombreUsuario },
      });
    } catch (notifyError) {
      console.error('Failed to notify Games Service:', notifyError);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};

export const mobileLoginPage = (req: Request, res: Response): void => {
  const { session } = req.query;
  if (!session) {
    res.status(400).send('<h1>Sesión inválida</h1>');
    return;
  }

  const sessionData = sessionManager.getSession(session as string);
  if (!sessionData || sessionData.status !== 'pending') {
    res.status(400).send('<h1>Sesión expirada o ya utilizada</h1>');
    return;
  }

  res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Login QR — Ajedrez</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, sans-serif;
      background: #0f172a;
      color: #f1f5f9;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 1rem;
      padding: 2rem;
      width: 100%;
      max-width: 380px;
    }
    h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem; color: #fbbf24; }
    p { font-size: 0.875rem; color: #94a3b8; margin-bottom: 1.5rem; }
    label { display: block; font-size: 0.75rem; font-weight: 600; text-transform: uppercase;
            letter-spacing: 0.05em; color: #cbd5e1; margin-bottom: 0.375rem; }
    input {
      width: 100%; padding: 0.75rem 1rem; border-radius: 0.5rem;
      background: #0f172a; border: 1px solid #475569; color: #f1f5f9;
      font-size: 1rem; margin-bottom: 1rem; outline: none;
    }
    input:focus { border-color: #fbbf24; }
    button {
      width: 100%; padding: 0.875rem; border-radius: 0.5rem;
      background: #fbbf24; color: #0f172a; font-weight: 700;
      font-size: 1rem; border: none; cursor: pointer;
    }
    button:active { opacity: 0.85; }
    .error { background: #450a0a; border: 1px solid #991b1b; color: #fca5a5;
             padding: 0.75rem; border-radius: 0.5rem; font-size: 0.875rem; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1>&#9813; Ajedrez</h1>
    <p>Inicia sesión en tu computadora escaneando este QR</p>
    <div id="error-box" class="error" style="display:none"></div>
    <form id="login-form">
      <input type="hidden" name="session" value="${session}" />
      <label for="email">Correo electrónico</label>
      <input id="email" type="email" name="correoElectronico" placeholder="tu@email.com" required />
      <label for="password">Contraseña</label>
      <input id="password" type="password" name="contrasena" placeholder="••••••••" required />
      <button type="submit" id="btn">Ingresar</button>
    </form>
  </div>
  <script>
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btn');
      const errorBox = document.getElementById('error-box');
      btn.textContent = 'Validando...';
      btn.disabled = true;
      errorBox.style.display = 'none';

      const form = e.target;
      const body = {
        session: form.session.value,
        correoElectronico: form.correoElectronico.value,
        contrasena: form.contrasena.value,
      };

      try {
        const res = await fetch('/mobile/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0f172a;color:#fbbf24;font-family:system-ui;font-size:1.25rem;font-weight:700;">&#10003; ¡Listo! Vuelve a tu computadora.</div>';
        } else {
          const data = await res.json();
          errorBox.textContent = data.error || 'Error al iniciar sesión';
          errorBox.style.display = 'block';
          btn.textContent = 'Ingresar';
          btn.disabled = false;
        }
      } catch {
        errorBox.textContent = 'Error de conexión';
        errorBox.style.display = 'block';
        btn.textContent = 'Ingresar';
        btn.disabled = false;
      }
    });
  </script>
</body>
</html>`);
};

export const mobileLoginSubmit = async (req: Request, res: Response): Promise<void> => {
  const { session, correoElectronico, contrasena } = req.body;

  if (!session || !correoElectronico || !contrasena) {
    res.status(400).json({ error: 'Faltan campos obligatorios' });
    return;
  }

  const sessionData = sessionManager.getSession(session);
  if (!sessionData || sessionData.status !== 'pending') {
    res.status(400).json({ error: 'Sesión inválida o expirada' });
    return;
  }

  try {
    const response = await axios.get(`${USERS_SERVICE_URL}/internal/users/email/${correoElectronico}`);
    const user = response.data;

    const isMatch = await bcrypt.compare(contrasena, user.contrasena);
    if (!isMatch) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const tokenJwt = jwt.sign(
      { usuarioId: user.usuarioId, correoElectronico: user.correoElectronico },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    sessionManager.updateSession(session, {
      status: 'authenticated',
      userData: { usuarioId: user.usuarioId, nombreUsuario: user.nombreUsuario },
      jwt: tokenJwt,
    });

    try {
      await axios.post(`${GAMES_SERVICE_URL}/internal/auth-notify`, {
        sessionId: session,
        tokenJwt,
        user: { usuarioId: user.usuarioId, nombreUsuario: user.nombreUsuario },
      });
    } catch (notifyError) {
      console.error('Failed to notify Games Service:', notifyError);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};
