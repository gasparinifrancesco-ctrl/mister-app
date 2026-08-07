// Deriva le varianti hover/dim/wash da un unico colore accent scelto dall'utente, con la
// stessa logica usata (a mano) per la palette di default arancione — mai bg/pannelli/testo,
// solo --accent* cambia. Duplicata in public/app.js (script statico, non un modulo) per
// l'anteprima dal vivo nel popover di scelta colore.
function hexToRgbTriplet(hex) {
  const h = (hex || '').replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
}
function mixRgb([r, g, b], [tr, tg, tb], amount) {
  return [r + (tr - r) * amount, g + (tg - g) * amount, b + (tb - b) * amount];
}

export function deriveAccentPalette(hex) {
  const rgb = hexToRgbTriplet(hex);
  return {
    accent: hex,
    accentHover: rgbToHex(mixRgb(rgb, [255, 255, 255], 0.2)),
    accentDim: rgbToHex(mixRgb(rgb, [0, 0, 0], 0.55)),
    accentWash: 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0.14)',
    accentRgb: rgb[0] + ',' + rgb[1] + ',' + rgb[2],
  };
}
