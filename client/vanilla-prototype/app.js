// Config
const API_URL = 'http://localhost';
const PORTS = {
    users: 3001,
    auth: 3002,
    profile: 3003,
    games: 3004
};

// State
let state = {
    token: localStorage.getItem('token') || null,
    userId: localStorage.getItem('userId') || null,
    activeInterval: null
};

// DOM Elements
const els = {
    userInfo: document.getElementById('user-info'),
    welcomeMsg: document.getElementById('welcome-msg'),
    logoutBtn: document.getElementById('logout-btn'),
    
    loginSection: document.getElementById('login-section'),
    loginForm: document.getElementById('login-form'),
    loginError: document.getElementById('login-error'),
    
    dashboardSection: document.getElementById('dashboard-section'),
    activeGamesList: document.getElementById('active-games-list'),
    createGameBtn: document.getElementById('create-game-btn'),
    opponentIdInput: document.getElementById('opponent-id'),
    gameCreateMsg: document.getElementById('game-create-msg'),
    
    gameSection: document.getElementById('game-section'),
    matchIdDisplay: document.getElementById('match-id-display'),
    matchStatus: document.getElementById('match-status'),
    movesList: document.getElementById('moves-list'),
    backDashboardBtn: document.getElementById('back-dashboard-btn'),
    
    // Register Form
    regForm: document.getElementById('register-form'),
    regUser: document.getElementById('reg-user'),
    regEmail: document.getElementById('reg-email'),
    regPass: document.getElementById('reg-pass'),
    regMsg: document.getElementById('reg-msg')
};

// Initialization
function init() {
    if (state.token && state.userId) {
        showDashboard();
    } else {
        showLogin();
    }
    setupEventListeners();
}

function setupEventListeners() {
    els.loginForm.addEventListener('submit', handleLogin);
    els.regForm.addEventListener('submit', handleRegister);
    els.logoutBtn.addEventListener('click', handleLogout);
    els.createGameBtn.addEventListener('click', handleCreateGame);
    els.backDashboardBtn.addEventListener('click', showDashboard);
}

// Navigation
function showLogin() {
    els.loginSection.classList.remove('hidden');
    els.dashboardSection.classList.add('hidden');
    els.gameSection.classList.add('hidden');
    els.userInfo.classList.add('hidden');
}

function showDashboard() {
    els.loginSection.classList.add('hidden');
    els.dashboardSection.classList.remove('hidden');
    els.gameSection.classList.add('hidden');
    els.userInfo.classList.remove('hidden');
    els.welcomeMsg.textContent = `Usuario ID: ${state.userId}`;
    
    if (state.activeInterval) {
        clearInterval(state.activeInterval);
        state.activeInterval = null;
    }
    
    loadActiveGames();
}

function showGamePhase(partidaId) {
    els.dashboardSection.classList.add('hidden');
    els.gameSection.classList.remove('hidden');
    els.matchIdDisplay.textContent = partidaId;
    
    startPollingGame(partidaId);
}

// Actions
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const res = await fetch(`${API_URL}:${PORTS.auth}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correoElectronico: email, contrasena: password })
        });
        
        const data = await res.json();
        if (res.ok) {
            state.token = data.tokenJwt;
            state.userId = data.usuarioId;
            localStorage.setItem('token', state.token);
            localStorage.setItem('userId', state.userId);
            showDashboard();
        } else {
            els.loginError.textContent = data.error || 'Error al iniciar sesión';
        }
    } catch (err) {
        els.loginError.textContent = 'Error de conexión con el servidor de autenticación';
    }
}

async function handleRegister(e) {
    e.preventDefault();
    try {
        const payload = {
            correoElectronico: els.regEmail.value,
            contrasena: els.regPass.value,
            nombreUsuario: els.regUser.value
        };
        const res = await fetch(`${API_URL}:${PORTS.users}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
            els.regMsg.style.color = "var(--secondary)";
            els.regMsg.textContent = "Usuario creado. Ahora puedes iniciar sesión arriba.";
            document.getElementById('email').value = payload.correoElectronico;
            document.getElementById('password').value = payload.contrasena;
            els.regForm.reset();
        } else {
            els.regMsg.style.color = "var(--error)";
            els.regMsg.textContent = data.error || 'Error al registrar';
        }
    } catch (err) {
        els.regMsg.style.color = "var(--error)";
        els.regMsg.textContent = 'Error de conexión';
    }
}

function handleLogout() {
    state.token = null;
    state.userId = null;
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    showLogin();
}

async function handleCreateGame() {
    const oppId = els.opponentIdInput.value;
    if (!oppId) {
        els.gameCreateMsg.textContent = 'Ingresa un ID de oponente (ej: 1 o 2)';
        els.gameCreateMsg.style.color = 'var(--error)';
        return;
    }
    
    try {
        els.createGameBtn.disabled = true;
        els.createGameBtn.textContent = 'Creando...';
        
        const res = await fetch(`${API_URL}:${PORTS.games}/games`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuarioIdBlanco: state.userId,
                usuarioIdNegro: oppId
            })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            els.gameCreateMsg.style.color = 'var(--secondary)';
            els.gameCreateMsg.textContent = '¡Partida Creada! Iniciando vista...';
            setTimeout(() => {
                els.gameCreateMsg.textContent = '';
                showGamePhase(data.partidaId);
            }, 1000);
        } else {
            els.gameCreateMsg.style.color = 'var(--error)';
            els.gameCreateMsg.textContent = data.error || 'Error creando partida';
        }
    } catch (err) {
        els.gameCreateMsg.style.color = 'var(--error)';
        els.gameCreateMsg.textContent = 'Error de red';
    } finally {
        els.createGameBtn.disabled = false;
        els.createGameBtn.textContent = 'Empezar Partida';
    }
}

async function loadActiveGames() {
    if (!state.userId) return;
    
    try {
        const res = await fetch(`${API_URL}:${PORTS.games}/games/usuario/${state.userId}/activas`);
        if (res.ok) {
            const games = await res.json();
            renderActiveGames(games);
        }
    } catch (err) {
        els.activeGamesList.innerHTML = '<li>Error cargando partidas</li>';
    }
}

function renderActiveGames(games) {
    if (games.length === 0) {
        els.activeGamesList.innerHTML = '<li>No tienes partidas activas. Cread una nueva.</li>';
        return;
    }
    
    els.activeGamesList.innerHTML = '';
    games.forEach(g => {
        const li = document.createElement('li');
        const opponent = g.jugadores.find(p => p.usuarioId != state.userId)?.usuarioId || 'Tú mismo';
        li.innerHTML = `
            <span><strong>Partida #${g.partidaId}</strong> vs Jugador ${opponent}</span>
            <button class="game-btn" onclick="showGamePhase(${g.partidaId})">Ver Partida</button>
        `;
        els.activeGamesList.appendChild(li);
    });
}

// Live Game Polling
function startPollingGame(partidaId) {
    updateGameView(partidaId);
    state.activeInterval = setInterval(() => {
        updateGameView(partidaId);
    }, 2000);
}

async function updateGameView(partidaId) {
    try {
        const res = await fetch(`${API_URL}:${PORTS.games}/games/${partidaId}`);
        if (!res.ok) return;
        
        const game = await res.json();
        
        // Update Status
        if (game.estado === 'activa') {
            els.matchStatus.textContent = 'Simulando... (Activa)';
            els.matchStatus.className = 'badge';
        } else {
            els.matchStatus.textContent = `FINALIZADA: ${game.resultado?.razon || ''} (Ganador: ${game.resultado?.ganadorId || 'Empate'})`;
            els.matchStatus.className = 'badge finalizada';
            if (state.activeInterval) {
                clearInterval(state.activeInterval);
                state.activeInterval = null;
            }
        }
        
        // Update Moves
        renderMoves(game.movimientos);
        
    } catch (err) {
        console.error('Error fetching game data', err);
    }
}

function renderMoves(moves) {
    els.movesList.innerHTML = '';
    
    if (!moves || moves.length === 0) {
        els.movesList.innerHTML = '<li>Esperando movimientos...</li>';
        return;
    }
    
    [...moves].reverse().forEach((m, idx) => {
        const li = document.createElement('li');
        const moveNum = moves.length - idx;
        const colorClass = m.color === 'blanco' ? 'color-blanco' : 'color-negro';
        li.innerHTML = `<span class="move-color ${colorClass}"></span> ${moveNum}. ${m.origen} → ${m.destino}`;
        els.movesList.appendChild(li);
    });
}

// Boot
window.onload = init;
