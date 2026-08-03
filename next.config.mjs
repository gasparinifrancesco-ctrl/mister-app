/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permette al dev server (già in ascolto su 0.0.0.0 di default) di rispondere anche a
  // richieste che arrivano con Origin diverso da "localhost" — es. il telefono/tablet che
  // apre l'IP di rete locale del PC. Senza questo, alcune risorse di sviluppo (hot reload)
  // possono essere bloccate dalla protezione cross-origin del dev server. Se il router
  // riassegna un altro IP al PC, aggiorna qui il valore (o usa un IP statico/riservato).
  // '*.trycloudflare.com': il tunnel pubblico usato per il pilota con i collaboratori
  // esterni (cloudflared quick tunnel) — l'hostname cambia a ogni riavvio del tunnel, il
  // wildcard evita di doverlo aggiornare qui ogni volta.
  allowedDevOrigins: ['192.168.1.109', '*.trycloudflare.com'],
};

export default nextConfig;
