import { useAppController } from "./controllers/useAppController";
import { ChessMenu } from "./components/ChessMenu";
import { RegisterPlayer } from "./components/RegisterPlayer";
import { LoginPlayer } from "./components/LoginPlayer";
import { ChessGame } from "./components/ChessGame";
import { MatchHistory } from "./components/MatchHistory";
import { MobileConfirm } from "./components/MobileConfirm";

export default function App() {
  const { currentPage, playerData, gameId, gameMode, preferredColor, difficulty, sessionPlayerId, actions } = useAppController();

  if (window.location.pathname === '/mobile-confirm') {
    return <MobileConfirm />;
  }

  if (currentPage === "register") {
    return (
      <RegisterPlayer
        onBack={actions.navigateToMenu}
        onRegister={actions.handleRegister}
      />
    );
  }

  if (currentPage === "login") {
    return (
      <LoginPlayer
        onBack={actions.navigateToMenu}
        onLogin={actions.handleLogin}
        onExternalLogin={actions.handleExternalLogin}
      />
    );
  }

  if (currentPage === "game") {
    return (
      <ChessGame
        onBack={actions.navigateToMenu}
        playerName={playerData?.name}
        playerId={sessionPlayerId}
        gameId={gameId || 0}
        gameMode={gameMode}
        preferredColor={preferredColor}
        difficulty={difficulty}
      />
    );
  }

  if (currentPage === "history") {
    return (
      <MatchHistory onBack={actions.navigateToMenu} />
    );
  }

  return (
    <ChessMenu
      onNavigateToRegister={actions.navigateToRegister}
      onNavigateToLogin={actions.navigateToLogin}
      onNavigateToGame={actions.navigateToGame}
      onNavigateToHistory={actions.navigateToHistory}
      onNavigateAsGuest={actions.handleGuestPlay}
      onLogout={actions.handleLogout}
      playerName={playerData?.name}
    />
  );
}