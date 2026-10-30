// ══════════════════════════════════════════════════════════════════
// GRIMHOLD — SISTEMA DE MATERIAIS
// Tier 0.1 (tokens) + 0.2 (raridade/categoria)
//
// Direção de arte: "estela" — pedra gravada.
// Regras: superfícies chapadas (SEM gradiente), letras baixadas
// (letterpress, NUNCA glow), molduras gravadas, paleta de materiais.
//
// PROIBIDO neste sistema:
//   ✗ linear-gradient / radial-gradient em superfície
//   ✗ box-shadow: 0 0 Npx (glow)
//   ✗ backdrop-filter: blur (vidro)
//   ✗ border-radius > 2px
//   ✗ cores neon do Tailwind
// ══════════════════════════════════════════════════════════════════

import { t } from '../../i18n';

// ─── PEDRA (superfícies) ──────────────────────────────────────────
export const STONE = {
  /** fundo da página / o mais fundo */
  s0: '#131110',
  /** superfície de painel padrão */
  s1: '#1a1513',
  /** superfície elevada (hover, célula ativa) */
  s2: '#221b18',
  /** sulco vazio (trilho de barra, pip apagado) */
  s3: '#322118',
} as const;

// ─── SULCO (profundidade gravada; substitui o glow) ──────────────
export const GROOVE = {
  /** sombra do sulco — vai embaixo do texto */
  lo: '#0b0806',
  /** luz da quina — vai em cima do texto */
  hi: 'rgba(255,255,255,.045)',
} as const;

// ─── LINHAS ───────────────────────────────────────────────────────
export const LINE = {
  base: '#322118',
  soft: '#241711',
  hover: '#603f2f',
} as const;

// ─── TINTA (texto) ────────────────────────────────────────────────
export const INK = {
  /** texto primário — osso */
  base: '#e4d1c8',
  /** secundário */
  dim: '#80776c',
  /** labels, capitulares */
  faint: '#544c44',
  /** flavor text, desabilitado */
  ghost: '#413b34',
} as const;

// ─── MATERIAIS (acentos temáticos) ────────────────────────────────
// Cada material tem: base (traço/texto) e dim (moldura/fundo de nicho).
export interface Material { base: string; dim: string; }

export const MATERIAL = {
  /** brasa — ação, forja, confirmação */
  ember:     { base: '#936149', dim: '#462e23' },
  /** ametista — essência, arcano, mítico */
  amethyst:  { base: '#8a6e96', dim: '#423446' },
  /** aço-ardósia — barreira, defesa */
  slate:     { base: '#80776c', dim: '#413b34' },
  /** ouro velho — economia, lendário */
  gold:      { base: '#936149', dim: '#462e23' },
  /** verdete — aliados, natureza */
  verdigris: { base: '#617355', dim: '#30392a' },
  /** sangue-de-boi — combate, perigo */
  oxblood:   { base: '#81483f', dim: '#3e231f' },
  /** osso — neutro, comum */
  bone:      { base: '#a0978d', dim: '#413b34' },
  /** gelo — tundra, lentidão */
  frost:     { base: '#6d8894', dim: '#344045' },
} as const;

export type MaterialName = keyof typeof MATERIAL;

// ══════════════════════════════════════════════════════════════════
// RARIDADE — fonte única de verdade
//
// Substitui os hexes neon espalhados hoje em:
//   panels/CharacterSelectPanel.tsx : 68, 368
//   panels/BattlePassPanel.tsx      : 22-25
//   GameCanvas.tsx                  : 15446, 16300, 16591, 17690-17694
//
// Cobre as TRÊS escalas que convivem no projeto:
//   heróis  : common | uncommon | semiRare | rare | legendary
//   loja    : common | uncommon | rare | legendary | mythic
//   passe   : common | rare | epic | legendary
// ══════════════════════════════════════════════════════════════════
export interface RarityStyle {
  /** cor do traço, texto e fileira superior do card */
  accent: string;
  /** moldura e fundo do nicho de ícone */
  dim: string;
  /** marca gravada no badge (sem emoji) */
  mark: string;
  /** rótulo exibido */
  label: string;
}

// `label` e getter, nao valor: o t() tem que rodar no acesso pra a troca de
// idioma valer na hora (mesmo padrao de CLASS_INFO e RARITY_LABEL).
export const RARITY: Record<string, RarityStyle> = {
  common:    { accent: MATERIAL.bone.base,      dim: MATERIAL.bone.dim,      mark: '·',  get label() { return t('ui.rarity.common'); }     },
  uncommon:  { accent: MATERIAL.verdigris.base, dim: MATERIAL.verdigris.dim, mark: '◦',  get label() { return t('ui.rarity.uncommon'); }   },
  semiRare:  { accent: MATERIAL.slate.base,     dim: MATERIAL.slate.dim,     mark: '◇',  get label() { return t('ui.rarity.semiRare'); } },
  rare:      { accent: MATERIAL.slate.base,     dim: MATERIAL.slate.dim,     mark: '◇',  get label() { return t('ui.rarity.rare'); }      },
  epic:      { accent: MATERIAL.amethyst.base,  dim: MATERIAL.amethyst.dim,  mark: '◈',  get label() { return t('ui.rarity.epic'); }     },
  legendary: { accent: MATERIAL.gold.base,      dim: MATERIAL.gold.dim,      mark: '✦',  get label() { return t('ui.rarity.legendary'); }  },
  mythic:    { accent: MATERIAL.amethyst.base,  dim: MATERIAL.amethyst.dim,  mark: '✧',  get label() { return t('ui.rarity.mythic'); }    },
};

export const getRarity = (r: string): RarityStyle =>
  RARITY[r] ?? RARITY.common;

// ─── CATEGORIA DA FORJA ───────────────────────────────────────────
// Substitui forgeCatAccent em panels/ForgePanel.tsx : 24-29
export const FORGE_CATEGORY: Record<string, Material> = {
  barrier: MATERIAL.slate,
  economy: MATERIAL.gold,
  allies:  MATERIAL.verdigris,
  combat:  MATERIAL.oxblood,
};

export const getForgeCategory = (c: string): Material =>
  FORGE_CATEGORY[c] ?? MATERIAL.bone;

// ══════════════════════════════════════════════════════════════════
// TIPOGRAFIA (Tier 0.4)
// Cinzel fica — já é a identidade do jogo.
// ══════════════════════════════════════════════════════════════════
export const FONT = {
  /** títulos, nomes, botões — gravitas de inscrição */
  display: "'Jersey 10', 'Cardo', 'Noto Sans SC', serif",   // pixel (B1b)
  /** corpo, descrições, flavor */
  body: "'Jersey 15', 'Spectral', Georgia, 'Noto Sans SC', serif",   // pixel (B1b)
  /** números, contadores, códigos — tudo que precisa alinhar */
  mono: "'Jersey 15', 'Space Mono', 'Noto Sans SC', monospace",   // pixel (B1b)
} as const;

export const TYPE = {
  pageTitle:  { fontFamily: FONT.display, fontWeight: 800, fontSize: 30, letterSpacing: '.14em' },
  panelTitle: { fontFamily: FONT.display, fontWeight: 700, fontSize: 20, letterSpacing: '.10em' },
  itemName:   { fontFamily: FONT.display, fontWeight: 700, fontSize: 15, letterSpacing: '.02em' },
  label:      { fontFamily: FONT.mono, fontWeight: 400, fontSize: 12, letterSpacing: '.18em', textTransform: 'uppercase' as const },   // pixel: Jersey 15 le melhor pequeno que a 10
  body:       { fontFamily: FONT.body,    fontWeight: 400, fontSize: 16, lineHeight: 1.3 },
  flavor:     { fontFamily: FONT.body,    fontStyle: 'normal' as const, fontSize: 15, lineHeight: 1.35 },   // pixel nao tem italico
  numeral:    { fontFamily: FONT.mono,    fontSize: 14, letterSpacing: '.04em' },
} as const;

// ══════════════════════════════════════════════════════════════════
// EFEITOS — os substitutos legais do glow/gradiente
// ══════════════════════════════════════════════════════════════════

/** Letra baixada na pedra. Substitui todo `textShadow` de glow. */
export const engraved = {
  textShadow: `0 1px 0 ${GROOVE.lo}, 0 -1px 0 ${GROOVE.hi}`,
};

/** Superfície com quina de luz em cima e sulco embaixo. Substitui gradiente. */
export const carved = {
  // Pixel (B1b): moldura 9-slice de pedra gravada (public/ui/pixel/panel_neutral.png,
  // gerada por scripts/ui-pixel.py). Sobrescreve qualquer `border` declarado antes.
  borderStyle: 'solid', borderWidth: 8,
  borderImage: 'url(./ui/pixel/panel_neutral.png) 8 fill / 8px round',
  imageRendering: 'pixelated',
} as const;

/** Nicho fundo — onde ícones e pips ficam. Substitui o glow do ícone. */
export const recessed = {
  // Pixel (B1b): nicho/trilho gravado = sulco pixel fino (bar.png, 2 px), sem sombra difusa.
  borderStyle: 'solid', borderWidth: 2,
  borderImage: 'url(./ui/pixel/bar.png) 4 fill / 2px round',
  imageRendering: 'pixelated',
} as const;

/** Elevação de painel/modal. Sombra projetada, nunca colorida. */
export const lifted = {
  // Pixel (B1b): modal = mesma moldura, elevada (panel_neutral_hi) + sombra projetada.
  borderStyle: 'solid', borderWidth: 8,
  borderImage: 'url(./ui/pixel/panel_neutral_hi.png) 8 fill / 8px round',
  imageRendering: 'pixelated',
  boxShadow: '0 30px 80px rgba(0,0,0,.55)',
} as const;

/** Textura de pedra em SVG — aplicar no fundo da página. */
export const STONE_TEXTURE =
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='260'%3E%3Cfilter id='s'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.012' numOctaves='4'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23s)'/%3E%3C/svg%3E")`;

// ══════════════════════════════════════════════════════════════════
// CSS VARS — para quem prefere classe a inline style
// Injetar uma vez no :root.
// ══════════════════════════════════════════════════════════════════
export const cssVars = `
  --stone-0:${STONE.s0}; --stone-1:${STONE.s1}; --stone-2:${STONE.s2}; --stone-3:${STONE.s3};
  --groove-lo:${GROOVE.lo}; --groove-hi:${GROOVE.hi};
  --line:${LINE.base}; --line-soft:${LINE.soft}; --line-hover:${LINE.hover};
  --ink:${INK.base}; --ink-dim:${INK.dim}; --ink-faint:${INK.faint}; --ink-ghost:${INK.ghost};
  --ember:${MATERIAL.ember.base}; --ember-dim:${MATERIAL.ember.dim};
  --amethyst:${MATERIAL.amethyst.base}; --amethyst-dim:${MATERIAL.amethyst.dim};
  --slate:${MATERIAL.slate.base}; --slate-dim:${MATERIAL.slate.dim};
  --gold:${MATERIAL.gold.base}; --gold-dim:${MATERIAL.gold.dim};
  --verdigris:${MATERIAL.verdigris.base}; --verdigris-dim:${MATERIAL.verdigris.dim};
  --oxblood:${MATERIAL.oxblood.base}; --oxblood-dim:${MATERIAL.oxblood.dim};
  --bone:${MATERIAL.bone.base}; --bone-dim:${MATERIAL.bone.dim};
  --frost:${MATERIAL.frost.base}; --frost-dim:${MATERIAL.frost.dim};
`;
