export interface MultiplayerRoomEntity {
  roomId: number;
  code: string;
  host: {
    usuarioId: number;
    nombre: string;
  };
  jugadores: {
    usuarioId: number;
    nombre: string;
    color?: 'white' | 'black';
  }[];
  estado: 'abierta' | 'completa' | 'cerrada';
  fechaCreacion: Date;
}
