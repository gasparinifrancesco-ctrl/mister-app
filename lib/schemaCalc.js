export const ASPECT_RATIO = 1.4; // larghezza:lunghezza, costante per ora (editabile al passo 7)

// §5.1: superficie totale dall'obiettivo e dal numero di giocatori, poi convertita
// in una coppia larghezza/lunghezza con un rapporto di forma fisso.
export function computeFieldSize(objective, numeroGiocatori) {
  const n = Math.max(1, Number(numeroGiocatori) || 0);
  const superficie = objective.m2PerPlayer * n;
  const larghezza = Math.sqrt(superficie / ASPECT_RATIO);
  const lunghezza = larghezza * ASPECT_RATIO;
  return {
    larghezzaCampo: Math.round(larghezza * 10) / 10,
    lunghezzaCampo: Math.round(lunghezza * 10) / 10,
  };
}

// §5.2: indiceCarico = fattoreIntensità(obiettivo) × fattoreDensità(esercizio) × durataMinuti,
// con indiceFatica (1-5, percepito) come moltiplicatore correttivo finale (3 = neutro).
export function computeLoadIndex({ objective, larghezzaCampo, lunghezzaCampo, numeroGiocatoriBase, durataTipica, indiceFatica }) {
  const n = Math.max(1, Number(numeroGiocatoriBase) || 0);
  const superficieEffettiva = (Number(larghezzaCampo) || 0) * (Number(lunghezzaCampo) || 0);
  if (!superficieEffettiva) return 0;
  const m2PerGiocatoreEffettivo = superficieEffettiva / n;
  if (!m2PerGiocatoreEffettivo) return 0;
  const fattoreDensita = objective.m2PerPlayer / m2PerGiocatoreEffettivo;
  const fatica = Math.max(1, Math.min(5, Number(indiceFatica) || 3));
  const durata = Math.max(0, Number(durataTipica) || 0);
  const indice = objective.intensityFactor * fattoreDensita * durata * (fatica / 3);
  return Math.round(indice * 10) / 10;
}
