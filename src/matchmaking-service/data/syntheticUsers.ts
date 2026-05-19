export interface UsuarioSintetico {
  usuarioId: number;
  nombreUsuario: string;
  puntuacionElo: number;
  estadoConexion: 'online' | 'offline';
}

export const usuariosSinteticos: UsuarioSintetico[] = [
  { usuarioId: 101, nombreUsuario: 'GranMaestro_Ana', puntuacionElo: 1950, estadoConexion: 'online' },
  { usuarioId: 102, nombreUsuario: 'CaballoNegro_77', puntuacionElo: 1600, estadoConexion: 'online' },
  { usuarioId: 103, nombreUsuario: 'TorreBlanca_23', puntuacionElo: 1350, estadoConexion: 'offline' },
  { usuarioId: 104, nombreUsuario: 'AlfilMagico', puntuacionElo: 1100, estadoConexion: 'online' },
  { usuarioId: 105, nombreUsuario: 'ReyDeLaDefensa', puntuacionElo: 1800, estadoConexion: 'online' },
  { usuarioId: 106, nombreUsuario: 'PeonValiente_99', puntuacionElo: 900, estadoConexion: 'offline' },
  { usuarioId: 107, nombreUsuario: 'DamaLetal', puntuacionElo: 1450, estadoConexion: 'online' },
  { usuarioId: 108, nombreUsuario: 'JaqueRapido_X', puntuacionElo: 1200, estadoConexion: 'online' },
  { usuarioId: 109, nombreUsuario: 'Enroque_Maestro', puntuacionElo: 1700, estadoConexion: 'online' },
  { usuarioId: 110, nombreUsuario: 'GambitoFinal', puntuacionElo: 850, estadoConexion: 'offline' }
];
