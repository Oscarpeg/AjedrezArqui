import { useState, useEffect } from "react";
import type { Page, PlayerData, GameMode } from "../models/types";
import { storageModel } from "../models/storageModel";
import { gameRepository } from "../models/gameRepository";

const HOST = window.location.hostname;
const USERS_URL = `http://${HOST}:3001`;
const AUTH_URL  = `http://${HOST}:3002`;

export function useAppController() {
  const [currentPage, setCurrentPage] = useState<Page>("menu");
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [gameId, setGameId] = useState<number | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('standard');
  const [preferredColor, setPreferredColor] = useState<'white' | 'black' | 'random'>('white');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [sessionPlayerId] = useState<number>(() => {
    const existing = sessionStorage.getItem('ajedrez_session_id');
    if (existing) return Number(existing);
    const newId = Date.now() + Math.floor(Math.random() * 1000);
    sessionStorage.setItem('ajedrez_session_id', String(newId));
    return newId;
  });

  // Auto-login con el Modelo (localStorage) 
  useEffect(() => {
    const user = storageModel.getUser();
    if (user) setPlayerData(user);
  }, []);

  const handleRegister = async (name: string, password: string, email: string) => {
    try {
      const response = await fetch(`${USERS_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreUsuario: name,
          contrasena: password,
          correoElectronico: email
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Error al registrar usuario');
        return;
      }

      // Guardar también en localStorage para auto-login
      storageModel.saveUser(name, email);
      setPlayerData({ id: data.usuarioId, name, email });
      setCurrentPage("menu");

    } catch (error) {
      console.error('Error conectando con users-service:', error);
      alert('No se pudo conectar con el servidor. ¿Está corriendo users-service (puerto 3001)?');
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch(`${AUTH_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correoElectronico: email,
          contrasena: password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Credenciales inválidas');
      }

      const userName = data.nombreUsuario || email.split('@')[0];

      localStorage.setItem('ajedrez_token', data.tokenJwt);
      storageModel.saveUser(userName, email);
      setPlayerData({ id: data.usuarioId, name: userName, email });
      setCurrentPage("menu");

    } catch (error: any) {
      console.error('Error conectando con auth-service:', error);
      if (error.message.includes('fetch')) {
         throw new Error('No se pudo conectar con el servidor de autenticación (puerto 3002).');
      }
      throw error;
    }
  };

  const handleCreateGame = async (mode: GameMode, color: 'white' | 'black' | 'random' = 'white', diff: 'easy' | 'medium' | 'hard' = 'medium') => {
    if (!playerData) {
      alert("Debes registrar una cuenta o iniciar sesión (local) primero");
      setCurrentPage("register");
      return;
    }

    setGameMode(mode);
    gameRepository.saveLastGameMode(mode);
    setPreferredColor(color);
    setDifficulty(diff);
    setGameId(Date.now());
    setCurrentPage("game");
  };

  const handleGuestPlay = () => {
    const aliasTemporal = `Invitado_${Math.floor(Math.random() * 9000) + 1000}`;
    setPlayerData({ id: Date.now(), name: aliasTemporal });
    setGameMode('standard');
    setGameId(Date.now());
    setCurrentPage("game");
  };

  const navigateToRegister = () => setCurrentPage("register");
  const navigateToLogin = () => setCurrentPage("login");
  const navigateToHistory = () => setCurrentPage("history");
  const navigateToGame = (mode: GameMode, color: 'white' | 'black' | 'random' = 'white', diff: 'easy' | 'medium' | 'hard' = 'medium') => {
    handleCreateGame(mode, color, diff);
  };
  
  const navigateToMenu = () => {
    setGameId(null);
    setCurrentPage("menu");
  };

  const handleLogout = () => {
    localStorage.removeItem("ajedrez_user");
    localStorage.removeItem("ajedrez_token");
    setPlayerData(null);
    setGameId(null);
    setCurrentPage("menu");
  };

  const handleExternalLogin = (user: { id: number, name: string, email: string }) => {
    storageModel.saveUser(user.name, user.email);
    setPlayerData(user);
    setCurrentPage("menu");
  };

  return {
    currentPage,
    playerData,
    gameId,
    gameMode,
    preferredColor,
    difficulty,
    sessionPlayerId,
    actions: {
      handleRegister,
      handleLogin,
      handleExternalLogin,
      handleCreateGame,
      handleGuestPlay,
      handleLogout,
      navigateToRegister,
      navigateToLogin,
      navigateToHistory,
      navigateToMenu,
      navigateToGame
    }
  };
}
