// ══════════════════════════════════════════════════════════════════════
// components/ui/pixelIcons.ts — emoji (e nomes de Sigil) -> icone pixel.
//
// As cartas, a loja e as conquistas guardam o icone como emoji ('🩸', '⚔️')
// ou nome de Sigil ('blade'). O <Ico> consulta esta tabela ANTES de cair
// no emoji do sistema: se ha um icone pixel (public/ui/pixel/icons/<nome>.png,
// exportado por scripts/icones-pixel.py), usa ele. Emoji sem par aqui continua
// aparecendo como emoji — acrescente o par e rode o script.
// ══════════════════════════════════════════════════════════════════════
export const EMOJI_TO_PIXEL: Record<string, string> = {
  // combate / dano
  '🩸': 'blood', '💀': 'skull', '☠️': 'skull_red', '⚔️': 'swords', '⚔': 'swords', '🗡️': 'dagger', '🪓': 'axe',
  '🏹': 'bow', '🎯': 'target', '💥': 'burst', '💢': 'nova', '🔥': 'flame', '❄️': 'ice', '⚡': 'bolt', '☄️': 'comet',
  '🌀': 'spiral', '🌊': 'wave', '🌑': 'moon', '🌙': 'moon', '✨': 'sparkle', '🌟': 'star', '⭐': 'star', '✦': 'sparkle',
  // itens / economia
  '💰': 'gold_pile', '🪙': 'coin', '🦅': 'wing', '💉': 'blood', '💨': 'wind', '🍂': 'leaf_red', '⚗️': 'potion', '🔗': 'chain', '⚠️': 'skull_red', '💎': 'crystal', '💠': 'diamond', '🔷': 'shield_blue', '🔶': 'shield_gold', '🔵': 'orb', '💜': 'amethyst', '💚': 'emerald',
  '❤️': 'heart', '🔮': 'orb', '🧪': 'potion', '🍖': 'meat', '🌿': 'herb', '🌳': 'tree', '📿': 'amulet', '🔩': 'gear', '⚙️': 'gear',
  '🔋': 'elixir', '🧲': 'ring', '🧭': 'compass', '🔭': 'lantern', '⏱️': 'clock', '🔁': 'spiral', '🔱': 'staff', '🔰': 'shield', '🔯': 'rune',
  '🪨': 'rock', '🗿': 'stone_face', '🪞': 'mirror', '🛡': 'shield', '🛡️': 'shield', '🪬': 'amulet', '🪤': 'chain', '🩺': 'elixir', '🩹': 'heart',
  '🧬': 'rune', '🥁': 'drum', '🎵': 'note', '🎲': 'dice', '🃏': 'sparkle', '🚩': 'flag', '🏴': 'banner', '🏰': 'castle', '👻': 'ghost',
  '👑': 'crown', '📜': 'scroll', '📖': 'book', '📚': 'tome', '💪': 'armor', '⚰️': 'tomb', '⚖️': 'scales', '⚕': 'elixir', '🏆': 'trophy',
  // conquistas (achievements.ts)
  '🐉': 'flame', '🧛': 'blood', '🧘': 'candle_lit', '🛒': 'bag', '🚀': 'bolt', '😈': 'skull_red', '🔧': 'hammer', '💸': 'coins',
  '💫': 'sparkle', '💔': 'heart_dark', '👥': 'banner', '👊': 'gauntlet', '👁️': 'eye', '👁': 'eye', '🐂': 'helm_red', '🏪': 'chest',
  '🏅': 'star_gold', '🎰': 'dice2', '🎉': 'gift', '🌠': 'star', '🌅': 'sun', '♾️': 'spiral', '♾': 'spiral', '⏩': 'hourglass', '🔒': 'lock',
  // forja (forge.ts)
  '🍀': 'leaf', '📣': 'horn', '🪦': 'gravestone',
  // nomes de Sigil usados como icone de carta
  blade: 'sword', swords: 'swords', wall: 'castle', vault: 'chest', star: 'star', skull: 'skull', scroll: 'scroll',
  note: 'note', monolith: 'stone_face', leaf: 'leaf', heart: 'heart', gem: 'gem', gear: 'gear', fast: 'bolt', eye: 'orb',
  bow: 'bow', banner: 'banner', anvil: 'anvil', tome: 'tome', crown: 'crown', flame: 'flame', frost: 'ice', coin: 'coin',
  shield: 'shield', potion: 'potion', comet: 'comet', trophy: 'trophy', lock: 'lock', check: 'check', cross: 'cross',
  arcane: 'orb', moon: 'moon', flask: 'potion', blood: 'blood', fang: 'skull_red', dice: 'dice', sun: 'star', ghost: 'ghost',
  bolt: 'bolt', beads: 'amulet', key: 'key', reroll: 'spiral', stone: 'rock',
};

/** Sigils que ficam como estao (icones de interface pequenos, nao "arte de carta"). */
export const SIGIL_KEEP = new Set(['chevronL', 'chevronR', 'check', 'cross', 'lock']);

export const pixelIconFor = (icon: string): string | null => EMOJI_TO_PIXEL[icon] ?? EMOJI_TO_PIXEL[icon.replace(/️/g, '')] ?? null;

/** Tira emojis de um texto (descricoes de carta comecam com emoji; na carta pixel o icone ja esta na janela). */
export const semEmoji = (txt: string): string => txt.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]+\s*/gu, '').trim();
