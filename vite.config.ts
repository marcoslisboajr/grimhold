import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(() => {
    return {
      base: './',
      server: {
        port: 3000,
        host: '0.0.0.0',
        watch: {
          // O i18n-verify empacota o GameCanvas em scripts/.tmp pra conferir
          // os <Trans>. Sem isso o Vite vê aquele arquivo aparecer, recarrega
          // a página, e rodar a verificação com o dev server aberto trava o
          // navegador num laço de reload.
          // assets-pixel/ e a biblioteca da migracao pra pixel art (PLANO_MESTRE
          // B1). Sao pacotes pesados que ainda nao entram no jogo — o watcher
          // nao precisa vigia-los.
          ignored: ['**/scripts/.tmp/**', '**/scripts/.snapshots/**', '**/assets-pixel/**'],
        },
      },
      plugins: [
        react(),
        tailwindcss(),
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
