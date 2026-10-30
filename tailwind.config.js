/**
 * GRIMHOLD — paleta Estela para Tailwind
 * Gerado a partir da paleta MATERIAL (data/materials.ts).
 *
 * Sobrescreve as famílias de cor saturadas do Tailwind por rampas de
 * material. NENHUMA classe no JSX precisa mudar — bg-red-500 vira oxblood,
 * text-blue-300 vira gelo, border-green-700 vira verdete, etc.
 *
 * COMO USAR (Tailwind v3):
 *   Faça merge deste bloco `theme.extend.colors` no seu tailwind.config
 *   existente (ou use este arquivo como base). Rode o build normalmente.
 *
 * Tailwind v4 (config em CSS): veja o bloco @theme comentado no fim.
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        red: { 50: '#e2d1c7', 100: '#d7bdb3', 200: '#c59e93', 300: '#b27c70', 400: '#9f594e', 500: '#8f3d31', 600: '#763329', 700: '#5e2920', 800: '#451f18', 900: '#311712', 950: '#24110d' },
        rose: { 50: '#e2d1c7', 100: '#d7bdb3', 200: '#c59e93', 300: '#b27c70', 400: '#9f594e', 500: '#8f3d31', 600: '#763329', 700: '#5e2920', 800: '#451f18', 900: '#311712', 950: '#24110d' },
        orange: { 50: '#e5d5c7', 100: '#ddc4b3', 200: '#d0aa94', 300: '#c28e72', 400: '#b47250', 500: '#a85a34', 600: '#8b4a2b', 700: '#6d3b22', 800: '#502b19', 900: '#381f12', 950: '#28160d' },
        amber: { 50: '#e3dac9', 100: '#d9cdb6', 200: '#cab999', 300: '#b9a379', 400: '#a88d5a', 500: '#9a7b3f', 600: '#7f6634', 700: '#655029', 800: '#4a3b1e', 900: '#352a15', 950: '#261e0f' },
        yellow: { 50: '#e3dac9', 100: '#d9cdb6', 200: '#cab999', 300: '#b9a379', 400: '#a88d5a', 500: '#9a7b3f', 600: '#7f6634', 700: '#655029', 800: '#4a3b1e', 900: '#352a15', 950: '#261e0f' },
        lime: { 50: '#dbd8cc', 100: '#cbcabc', 200: '#b1b5a3', 300: '#959e87', 400: '#78866c', 500: '#617355', 600: '#516047', 700: '#404c38', 800: '#30392a', 900: '#232a1e', 950: '#1a1f16' },
        green: { 50: '#dbd8cc', 100: '#cbcabc', 200: '#b1b5a3', 300: '#959e87', 400: '#78866c', 500: '#617355', 600: '#516047', 700: '#404c38', 800: '#30392a', 900: '#232a1e', 950: '#1a1f16' },
        emerald: { 50: '#dbd8cc', 100: '#cbcabc', 200: '#b1b5a3', 300: '#959e87', 400: '#78866c', 500: '#617355', 600: '#516047', 700: '#404c38', 800: '#30392a', 900: '#232a1e', 950: '#1a1f16' },
        teal: { 50: '#dddbd4', 100: '#ced0cb', 200: '#b6bebe', 300: '#9cabaf', 400: '#8398a0', 500: '#6d8894', 600: '#5a707a', 700: '#47585f', 800: '#344045', 900: '#242c2f', 950: '#1a1f21' },
        cyan: { 50: '#dddbd4', 100: '#ced0cb', 200: '#b6bebe', 300: '#9cabaf', 400: '#8398a0', 500: '#6d8894', 600: '#5a707a', 700: '#47585f', 800: '#344045', 900: '#242c2f', 950: '#1a1f21' },
        sky: { 50: '#dddbd4', 100: '#ced0cb', 200: '#b6bebe', 300: '#9cabaf', 400: '#8398a0', 500: '#6d8894', 600: '#5a707a', 700: '#47585f', 800: '#344045', 900: '#242c2f', 950: '#1a1f21' },
        blue: { 50: '#dddbd4', 100: '#ced0cb', 200: '#b6bebe', 300: '#9cabaf', 400: '#8398a0', 500: '#6d8894', 600: '#5a707a', 700: '#47585f', 800: '#344045', 900: '#242c2f', 950: '#1a1f21' },
        indigo: { 50: '#e1d8d5', 100: '#d5cacd', 200: '#c3b3bf', 300: '#af9bb1', 400: '#9b82a2', 500: '#8a6e96', 600: '#725b7b', 700: '#5a4860', 800: '#423446', 900: '#2e2530', 950: '#211a21' },
        violet: { 50: '#e1d8d5', 100: '#d5cacd', 200: '#c3b3bf', 300: '#af9bb1', 400: '#9b82a2', 500: '#8a6e96', 600: '#725b7b', 700: '#5a4860', 800: '#423446', 900: '#2e2530', 950: '#211a21' },
        purple: { 50: '#e1d8d5', 100: '#d5cacd', 200: '#c3b3bf', 300: '#af9bb1', 400: '#9b82a2', 500: '#8a6e96', 600: '#725b7b', 700: '#5a4860', 800: '#423446', 900: '#2e2530', 950: '#211a21' },
        fuchsia: { 50: '#e1d8d5', 100: '#d5cacd', 200: '#c3b3bf', 300: '#af9bb1', 400: '#9b82a2', 500: '#8a6e96', 600: '#725b7b', 700: '#5a4860', 800: '#423446', 900: '#2e2530', 950: '#211a21' },
        pink: { 50: '#e1d8d5', 100: '#d5cacd', 200: '#c3b3bf', 300: '#af9bb1', 400: '#9b82a2', 500: '#8a6e96', 600: '#725b7b', 700: '#5a4860', 800: '#423446', 900: '#2e2530', 950: '#211a21' },
        slate: { 50: '#e8e3da', 100: '#d6d2c9', 200: '#bab6ae', 300: '#9b9891', 400: '#7c7a74', 500: '#64635d', 600: '#51504b', 700: '#3f3d3a', 800: '#2c2b28', 900: '#1d1b1a', 950: '#131110' },
        gray: { 50: '#ebe5db', 100: '#dbd5cb', 200: '#c3bcb1', 300: '#a8a095', 400: '#8e8479', 500: '#786e63', 600: '#615950', 700: '#4a433d', 800: '#322e2a', 900: '#201d1a', 950: '#131110' },
        zinc: { 50: '#ebe5db', 100: '#dbd5cb', 200: '#c3bcb1', 300: '#a8a095', 400: '#8e8479', 500: '#786e63', 600: '#615950', 700: '#4a433d', 800: '#322e2a', 900: '#201d1a', 950: '#131110' },
        neutral: { 50: '#ebe5db', 100: '#dbd5cb', 200: '#c3bcb1', 300: '#a8a095', 400: '#8e8479', 500: '#786e63', 600: '#615950', 700: '#4a433d', 800: '#322e2a', 900: '#201d1a', 950: '#131110' },
        stone: { 50: '#ebe5db', 100: '#dbd5cb', 200: '#c3bcb1', 300: '#a8a095', 400: '#8e8479', 500: '#786e63', 600: '#615950', 700: '#4a433d', 800: '#322e2a', 900: '#201d1a', 950: '#131110' },
      },
    },
  },
};

/* ─── Tailwind v4 — cole no seu CSS global dentro de @theme ───────────
@theme {
  --color-red-50: #e2d1c7;
  --color-red-100: #d7bdb3;
  --color-red-200: #c59e93;
  --color-red-300: #b27c70;
  --color-red-400: #9f594e;
  --color-red-500: #8f3d31;
  --color-red-600: #763329;
  --color-red-700: #5e2920;
  --color-red-800: #451f18;
  --color-red-900: #311712;
  --color-red-950: #24110d;
  --color-rose-50: #e2d1c7;
  --color-rose-100: #d7bdb3;
  --color-rose-200: #c59e93;
  --color-rose-300: #b27c70;
  --color-rose-400: #9f594e;
  --color-rose-500: #8f3d31;
  --color-rose-600: #763329;
  --color-rose-700: #5e2920;
  --color-rose-800: #451f18;
  --color-rose-900: #311712;
  --color-rose-950: #24110d;
  --color-orange-50: #e5d5c7;
  --color-orange-100: #ddc4b3;
  --color-orange-200: #d0aa94;
  --color-orange-300: #c28e72;
  --color-orange-400: #b47250;
  --color-orange-500: #a85a34;
  --color-orange-600: #8b4a2b;
  --color-orange-700: #6d3b22;
  --color-orange-800: #502b19;
  --color-orange-900: #381f12;
  --color-orange-950: #28160d;
  --color-amber-50: #e3dac9;
  --color-amber-100: #d9cdb6;
  --color-amber-200: #cab999;
  --color-amber-300: #b9a379;
  --color-amber-400: #a88d5a;
  --color-amber-500: #9a7b3f;
  --color-amber-600: #7f6634;
  --color-amber-700: #655029;
  --color-amber-800: #4a3b1e;
  --color-amber-900: #352a15;
  --color-amber-950: #261e0f;
  --color-yellow-50: #e3dac9;
  --color-yellow-100: #d9cdb6;
  --color-yellow-200: #cab999;
  --color-yellow-300: #b9a379;
  --color-yellow-400: #a88d5a;
  --color-yellow-500: #9a7b3f;
  --color-yellow-600: #7f6634;
  --color-yellow-700: #655029;
  --color-yellow-800: #4a3b1e;
  --color-yellow-900: #352a15;
  --color-yellow-950: #261e0f;
  --color-lime-50: #dbd8cc;
  --color-lime-100: #cbcabc;
  --color-lime-200: #b1b5a3;
  --color-lime-300: #959e87;
  --color-lime-400: #78866c;
  --color-lime-500: #617355;
  --color-lime-600: #516047;
  --color-lime-700: #404c38;
  --color-lime-800: #30392a;
  --color-lime-900: #232a1e;
  --color-lime-950: #1a1f16;
  --color-green-50: #dbd8cc;
  --color-green-100: #cbcabc;
  --color-green-200: #b1b5a3;
  --color-green-300: #959e87;
  --color-green-400: #78866c;
  --color-green-500: #617355;
  --color-green-600: #516047;
  --color-green-700: #404c38;
  --color-green-800: #30392a;
  --color-green-900: #232a1e;
  --color-green-950: #1a1f16;
  --color-emerald-50: #dbd8cc;
  --color-emerald-100: #cbcabc;
  --color-emerald-200: #b1b5a3;
  --color-emerald-300: #959e87;
  --color-emerald-400: #78866c;
  --color-emerald-500: #617355;
  --color-emerald-600: #516047;
  --color-emerald-700: #404c38;
  --color-emerald-800: #30392a;
  --color-emerald-900: #232a1e;
  --color-emerald-950: #1a1f16;
  --color-teal-50: #dddbd4;
  --color-teal-100: #ced0cb;
  --color-teal-200: #b6bebe;
  --color-teal-300: #9cabaf;
  --color-teal-400: #8398a0;
  --color-teal-500: #6d8894;
  --color-teal-600: #5a707a;
  --color-teal-700: #47585f;
  --color-teal-800: #344045;
  --color-teal-900: #242c2f;
  --color-teal-950: #1a1f21;
  --color-cyan-50: #dddbd4;
  --color-cyan-100: #ced0cb;
  --color-cyan-200: #b6bebe;
  --color-cyan-300: #9cabaf;
  --color-cyan-400: #8398a0;
  --color-cyan-500: #6d8894;
  --color-cyan-600: #5a707a;
  --color-cyan-700: #47585f;
  --color-cyan-800: #344045;
  --color-cyan-900: #242c2f;
  --color-cyan-950: #1a1f21;
  --color-sky-50: #dddbd4;
  --color-sky-100: #ced0cb;
  --color-sky-200: #b6bebe;
  --color-sky-300: #9cabaf;
  --color-sky-400: #8398a0;
  --color-sky-500: #6d8894;
  --color-sky-600: #5a707a;
  --color-sky-700: #47585f;
  --color-sky-800: #344045;
  --color-sky-900: #242c2f;
  --color-sky-950: #1a1f21;
  --color-blue-50: #dddbd4;
  --color-blue-100: #ced0cb;
  --color-blue-200: #b6bebe;
  --color-blue-300: #9cabaf;
  --color-blue-400: #8398a0;
  --color-blue-500: #6d8894;
  --color-blue-600: #5a707a;
  --color-blue-700: #47585f;
  --color-blue-800: #344045;
  --color-blue-900: #242c2f;
  --color-blue-950: #1a1f21;
  --color-indigo-50: #e1d8d5;
  --color-indigo-100: #d5cacd;
  --color-indigo-200: #c3b3bf;
  --color-indigo-300: #af9bb1;
  --color-indigo-400: #9b82a2;
  --color-indigo-500: #8a6e96;
  --color-indigo-600: #725b7b;
  --color-indigo-700: #5a4860;
  --color-indigo-800: #423446;
  --color-indigo-900: #2e2530;
  --color-indigo-950: #211a21;
  --color-violet-50: #e1d8d5;
  --color-violet-100: #d5cacd;
  --color-violet-200: #c3b3bf;
  --color-violet-300: #af9bb1;
  --color-violet-400: #9b82a2;
  --color-violet-500: #8a6e96;
  --color-violet-600: #725b7b;
  --color-violet-700: #5a4860;
  --color-violet-800: #423446;
  --color-violet-900: #2e2530;
  --color-violet-950: #211a21;
  --color-purple-50: #e1d8d5;
  --color-purple-100: #d5cacd;
  --color-purple-200: #c3b3bf;
  --color-purple-300: #af9bb1;
  --color-purple-400: #9b82a2;
  --color-purple-500: #8a6e96;
  --color-purple-600: #725b7b;
  --color-purple-700: #5a4860;
  --color-purple-800: #423446;
  --color-purple-900: #2e2530;
  --color-purple-950: #211a21;
  --color-fuchsia-50: #e1d8d5;
  --color-fuchsia-100: #d5cacd;
  --color-fuchsia-200: #c3b3bf;
  --color-fuchsia-300: #af9bb1;
  --color-fuchsia-400: #9b82a2;
  --color-fuchsia-500: #8a6e96;
  --color-fuchsia-600: #725b7b;
  --color-fuchsia-700: #5a4860;
  --color-fuchsia-800: #423446;
  --color-fuchsia-900: #2e2530;
  --color-fuchsia-950: #211a21;
  --color-pink-50: #e1d8d5;
  --color-pink-100: #d5cacd;
  --color-pink-200: #c3b3bf;
  --color-pink-300: #af9bb1;
  --color-pink-400: #9b82a2;
  --color-pink-500: #8a6e96;
  --color-pink-600: #725b7b;
  --color-pink-700: #5a4860;
  --color-pink-800: #423446;
  --color-pink-900: #2e2530;
  --color-pink-950: #211a21;
  --color-slate-50: #e8e3da;
  --color-slate-100: #d6d2c9;
  --color-slate-200: #bab6ae;
  --color-slate-300: #9b9891;
  --color-slate-400: #7c7a74;
  --color-slate-500: #64635d;
  --color-slate-600: #51504b;
  --color-slate-700: #3f3d3a;
  --color-slate-800: #2c2b28;
  --color-slate-900: #1d1b1a;
  --color-slate-950: #131110;
  --color-gray-50: #ebe5db;
  --color-gray-100: #dbd5cb;
  --color-gray-200: #c3bcb1;
  --color-gray-300: #a8a095;
  --color-gray-400: #8e8479;
  --color-gray-500: #786e63;
  --color-gray-600: #615950;
  --color-gray-700: #4a433d;
  --color-gray-800: #322e2a;
  --color-gray-900: #201d1a;
  --color-gray-950: #131110;
  --color-zinc-50: #ebe5db;
  --color-zinc-100: #dbd5cb;
  --color-zinc-200: #c3bcb1;
  --color-zinc-300: #a8a095;
  --color-zinc-400: #8e8479;
  --color-zinc-500: #786e63;
  --color-zinc-600: #615950;
  --color-zinc-700: #4a433d;
  --color-zinc-800: #322e2a;
  --color-zinc-900: #201d1a;
  --color-zinc-950: #131110;
  --color-neutral-50: #ebe5db;
  --color-neutral-100: #dbd5cb;
  --color-neutral-200: #c3bcb1;
  --color-neutral-300: #a8a095;
  --color-neutral-400: #8e8479;
  --color-neutral-500: #786e63;
  --color-neutral-600: #615950;
  --color-neutral-700: #4a433d;
  --color-neutral-800: #322e2a;
  --color-neutral-900: #201d1a;
  --color-neutral-950: #131110;
  --color-stone-50: #ebe5db;
  --color-stone-100: #dbd5cb;
  --color-stone-200: #c3bcb1;
  --color-stone-300: #a8a095;
  --color-stone-400: #8e8479;
  --color-stone-500: #786e63;
  --color-stone-600: #615950;
  --color-stone-700: #4a433d;
  --color-stone-800: #322e2a;
  --color-stone-900: #201d1a;
  --color-stone-950: #131110;
}
──────────────────────────────────────────────────────────────────── */
