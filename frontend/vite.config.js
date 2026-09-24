import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        ws: true, // bug #20 corrigé : les WebSockets sont désormais proxyées si besoin futur
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // Bug #36 corrigé (racine du problème) : les images uploadées vivent sur le serveur PHP
      // (backend/uploads/...) mais le frontend les référence en chemin relatif "/uploads/...".
      // Sans cette règle, Vite renvoyait un 404 et les images ne s'affichaient jamais après publication.
      '/uploads': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
