/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permette al dev server (già in ascolto su 0.0.0.0 di default) di rispondere anche a
  // richieste che arrivano con Origin diverso da "localhost" — es. il telefono/tablet che
  // apre l'IP di rete locale del PC. Senza questo, alcune risorse di sviluppo (hot reload)
  // possono essere bloccate dalla protezione cross-origin del dev server. Se il router
  // riassegna un altro IP al PC, aggiorna qui il valore (o usa un IP statico/riservato).
  allowedDevOrigins: ['192.168.1.109'],
};

export default nextConfig;
