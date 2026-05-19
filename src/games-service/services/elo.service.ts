export class EloService {
  private static K = 32;

  /**
   * Calcula el nuevo ELO para el ganador y el perdedor.
   * @param ratingA ELO del Jugador A (Ganador o primer jugador en empate)
   * @param ratingB ELO del Jugador B (Perdedor o segundo jugador en empate)
   * @param result 1 si A gana, 0 si B gana, 0.5 si es empate
   * @returns [nuevoEloA, nuevoEloB]
   */
  public static calculateNewElo(ratingA: number, ratingB: number, result: number): [number, number] {
    const probabilityA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
    const probabilityB = 1 - probabilityA;

    const newRatingA = Math.round(ratingA + this.K * (result - probabilityA));
    const newRatingB = Math.round(ratingB + this.K * ((1 - result) - probabilityB));

    return [newRatingA, newRatingB];
  }
}
