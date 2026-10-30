// ══════════════════════════════════════════════════════════════════════
// components/EntitySprites.tsx
// Extracted from GameCanvas.tsx — animated enemy and projectile sprites.
// Componentes puramente apresentacionais, sem estado do jogo.
// ══════════════════════════════════════════════════════════════════════

import React from 'react';
import { Sigil, resolveSigil } from './Sigil';
import { PROJECTILE_SPRITES } from './data/projectileSprites';
import { SPRITE_ATO6, SPRITE_ATO7, SPRITE_ATO8, SPRITE_ATO9, SPRITE_ATO5R, SPRITE_ATO10, HEROIS_CORROMPIVEIS } from './chefes/lista';

// ---------------------------------------------------------------------------
// Animation constants (defined outside components to avoid recreation)
// ---------------------------------------------------------------------------

/** Enemies that have a 4-frame spritesheet (_1.png … _4.png) */
export const ANIMATED_ENEMIES = new Set<string>([
  // Ato 1 — Goblins
  'goblin', 'goblin_archer', 'goblin_assassin', 'goblin_mage', 'goblin_shaman', 'goblin_king',
  // Ato 1 — Orcs
  'orc', 'orc_spearman', 'orc_warrior', 'orc_berserker', 'orc_leader', 'orc_warlord',
  // Ato 1 — Mortos-vivos
  'skeleton', 'skeleton_warrior', 'lich', 'grim_reaper', 'mummy', 'ghoul', 'ghost',   // ghost_1..4: folha de feriados do Time Fantasy (2017patronbundle), linha 'esquerda'
  // Act 1 — Dwarves & Elves
  'dwarf', 'dwarf_soldier', 'dwarf_guard', 'dwarf_geomancer',
  'elf', 'elf_scout', 'elf_arcanist', 'elf_champion',
  // Ato 1 — Minotauros
  'minotaur', 'minotaur_archer', 'minotaur_warrior', 'minotaur_guard', 'minotaur_king',
  // Ato 1 — Filhos das Ruínas (deserto) + chefe Medusa + Dragão de Fogo
  'centaur', 'centaur_archer', 'harpy', 'stone_guardian', 'medusa', 'fire_dragon',
  // Act 1 — Dragons
  'dragon', 'wyvern', 'frost_dragon', 'dragon_lord', 'mini_dragon',
  // Act 1 — Cyclops & Ogres + Special Elementals
  'cyclops', 'cyclops_stonehurler', 'ogre', 'ogre_berserker', 'half_brother_ogre', 'half_brother_cyclops',
  'slime', 'golem',
  // Ato 1 — Vampiros
  'vampire', 'dhampir', 'dhampir_ballister', 'dhampir_mage', 'vampire_lord', 'troll',
  // Act 1 — Demons
  'fire_devil', 'demon_skeleton', 'imp', 'devil', 'demon',
  'lesser_demon', 'lord_demon', 'demon_eyes', 'void_stalker', 'malachar',
  // Ato 2 — Elementais & Arcano
  'fire_elemental', 'earth_elemental', 'ice_witch', 'pixie', 'banshee',
  'warlock_shade', 'flux_anomaly', 'infernatil',
  // Ato 2 — Profundezas
  'deepling_scout', 'deepling_warrior', 'hydra',
  // Ato 2 — Beholders & Mente
  'beholder', 'mind_flayer',
  // Ato 2 — Mortos-vivos & Sombras
  'wight', 'wraith', 'death_knight', 'bonelord', 'shadow_beast', 'ghazbaran', 'velshade',
  // Ato 2 — Pesadelos & Serafins
  'nightstalker', 'nightmare', 'fallen_seraph', 'corrupt_paladin', 'void_herald', 'zathroth',
  // Ato 6 — A Outra Margem
  'cultista_vermelho', 'cultista_vermelho_b', 'cultista_branco', 'cultista_branco_b', 'cultista_verde', 'cultista_verde_b', 'cultista_negro', 'cultista_azul', 'lanterna', 'lanterna_b',
  'anjo', 'anjo_rubro', 'anjo_sombrio', 'anjo_sem_asas', 'anjo_sem_asas_rubro', 'anjo_sem_asas_sombrio', 'morcego', 'morcego_rubro', 'acaro_azul', 'acaro_vermelho', 'acaro_prata', 'acaro_amarelo',
  'lich6', 'lich6_rubro', 'lich6_dourado', 'cavaleiro_caido', 'cavaleiro_caido_b', 'esqueleto6', 'esqueleto6_lanca', 'esqueleto6_escudo', 'fenix', 'fenix_do_caos',
  // Ato 7 — A Ravina dos Xamas (totem_xama e parado: fora daqui, arquivo unico)
  'sapo', 'sapo_b', 'sapo_c', 'sapo_xama', 'sapo_xama_b', 'rato', 'rato_b', 'rato_c', 'rato_d', 'inseto', 'inseto_b', 'inseto_c', 'vespa', 'vespa_b', 'vespa_c', 'lagarto', 'lagarto_b', 'lagarto_tribo', 'lagarto_tribo_b', 'lobo', 'lobo_b', 'javali', 'javali_b', 'raptor', 'raptor_b', 'tribo_lobo', 'tribo_lobo_b', 'tribo_lobo_c', 'tribo_raposa', 'tribo_raposa_b', 'tribo_raposa_c', 'tribo_ave', 'tribo_ave_b', 'tribo_ave_c', 'tribo_peixe', 'tribo_peixe_b', 'tribo_peixe_c', 'kwazul', 'xiphra', 'ossoth',
  // Ato 8 — O Mar Sem Fundo (mae_das_aguas, rei_caranguejo e serpente_ancia: SPRITE_ATO8)
  'afogado', 'afogado_b', 'afogado_c', 'afogado_d', 'cardume', 'cardume_b', 'cardume_c', 'agua_viva', 'agua_viva_b', 'agua_viva_c', 'agua_viva_d', 'caranguejo', 'caranguejo_b', 'caranguejo_c', 'tartaruga', 'tartaruga_b', 'tartaruga_c', 'serpente_mar', 'serpente_mar_b', 'serpente_mar_c', 'serpente_mar_d', 'afogado_veterano', 'capitao_afogado', 'garuda', 'kraken',
  // Ato 9 — Os Guardioes (general_ossos, cranio_ancestral e cerbero_alfa: SPRITE_ATO9)
  'legiao', 'legiao_b', 'legiao_c', 'legiao_d', 'legiao_e', 'cranio', 'cranio_b', 'cranio_c', 'cranio_d', 'mumia', 'mumia_b', 'estatua_lamina', 'estatua_lamina_b', 'estatua_lamina_c', 'beholder9', 'beholder9_b', 'cerbero', 'cerbero_b', 'aranha', 'aranha_b', 'drider', 'estatua_leste', 'estatua_oeste', 'quimera',
  // Ato 5 refeito — A Queda de Grimhold (sargento_ashfen, chefe_saqueador e lich_colegiado: SPRITE_ATO5R)
  'soldado_ashfen', 'soldado_ashfen_b', 'soldado_ashfen_c', 'soldado_ashfen_d', 'capanga', 'capanga_b', 'capanga_c', 'cavaleiro_negro', 'cavaleiro_negro_b', 'saqueador', 'saqueador_lanca', 'saqueador_martelo', 'saqueador_espada', 'lich5', 'lich5_b', 'mago_colegiado', 'mago_colegiado_b', 'runa_hostil', 'runa_hostil_b', 'tesoureiro', 'capitao_ashfen', 'reitor',
  // Ato 10 — O Ventre
  'celula', 'celula_b', 'celula_c', 'celula_d', 'tentaculo', 'tentaculo_b', 'slime_grande', 'slime_grande_b', 'bolha', 'bolha_b', 'fome_ponto', 'fome_coracao',   // luta final (3b)
  // Herois Corrompidos (onda 30 do X): corrupted_<heroi>_1..4 de scripts/sprites-corrompidos.py
  ...HEROIS_CORROMPIVEIS.map(h => `corrupted_${h}`),
]);

/** Animation speed by enemy type (ms per frame, lower = faster) */
export const ENEMY_FRAME_SPEED: Record<string, number> = {
  imp: 100,
  goblin_assassin: 110,
  dhampir: 110,
  goblin: 150,
  goblin_archer: 150,
  orc_berserker: 130,
  harpy: 110,
  centaur: 120,
  stone_guardian: 220,
  // Ato 6: morcegos e acaros batem asa/perna rapido
  morcego: 100,
  morcego_rubro: 100,
  acaro_azul: 100,
  acaro_vermelho: 100,
  acaro_prata: 100,
  acaro_amarelo: 100,
  // Ato 7: vespas e ratos
  rato: 100,
  rato_b: 100,
  rato_c: 100,
  rato_d: 100,
  vespa: 100,
  vespa_b: 100,
  vespa_c: 100,
  // Ato 8: cardumes
  cardume: 100,
  cardume_b: 100,
  cardume_c: 100,
  // Ato 9: crias da Drider
  aranha: 100,
  aranha_b: 100,
  default: 160,
};

// ---------------------------------------------------------------------------
// EnemySprite
// ---------------------------------------------------------------------------

type StatusEffect = 'freeze' | 'root' | 'bleed' | 'charm' | 'none';

/**
 * Elite types — each with its own color, filter and icon.
 *
 * warrior   → Blindado: -30% dano de projetil          (ELITE_ARMOR_RED, GameCanvas)
 * arcane    → Arcano: atira magia, 2 projeteis por vez   (ELITE_ARCANE_*)
 * berserker → Furioso: ate +60% velocidade ao perder HP  (ELITE_FURY_MAX)
 * shadow    → Sombrio: 25% esquiva de projetil           (ELITE_DODGE)
 * frozen    → Gelido: aura esfria aliados (atk speed /2) (ELITE_CHILL_PX)
 * Todos: +60% HP, +35% dano, ouro e XP x2. Nomes em i18n ui.elite.*
 */
export type EliteType = 'warrior' | 'arcane' | 'berserker' | 'shadow' | 'frozen';

/** Visual configuration by elite type. sepia(1) primeiro normaliza o matiz do sprite,
 *  assim o hue-rotate da sempre a mesma cor (dourado/roxo/vermelho/indigo/ciano)
 *  em qualquer inimigo, em vez de depender da cor original. */
export const ELITE_CONFIG: Record<EliteType, {
  label: string;
  icon: string;
  cssFilter: string;
  glowColor: string;
  badgeBg: string;
  badgeColor: string;
  pulseColor: string;
}> = {
  warrior: {
    label: 'Armored',
    icon: '⚔️',
    cssFilter: 'sepia(1) saturate(2.5) brightness(1.2)',
    glowColor: 'rgba(171,141,84,0.85)',
    badgeBg: '#603f2f',
    badgeColor: '#d9c1b6',
    pulseColor: 'rgba(171,113,85,0.4)',
  },
  arcane: {
    label: 'Arcane',
    icon: '🔮',
    cssFilter: 'sepia(1) saturate(3) hue-rotate(230deg) brightness(1.1)',
    glowColor: 'rgba(198,185,204,0.85)',
    badgeBg: '#5a4860',
    badgeColor: '#dddbd4',
    pulseColor: 'rgba(175,155,183,0.4)',
  },
  berserker: {
    label: 'Frenzied',
    icon: '🔥',
    cssFilter: 'sepia(1) saturate(3.5) hue-rotate(320deg) brightness(1.05)',
    glowColor: 'rgba(188,128,119,0.85)',
    badgeBg: '#6b3b34',
    badgeColor: '#e2d0c7',
    pulseColor: 'rgba(172,97,86,0.4)',
  },
  shadow: {
    label: 'Shadowy',
    icon: '🌑',
    cssFilter: 'sepia(1) saturate(2) hue-rotate(200deg) brightness(0.75) contrast(1.3)',
    glowColor: 'rgba(157,175,183,0.85)',
    badgeBg: '#344045',
    badgeColor: '#dddbd4',
    pulseColor: 'rgba(133,156,166,0.4)',
  },
  frozen: {
    label: 'Frigid',
    icon: '❄️',
    cssFilter: 'sepia(1) saturate(3) hue-rotate(150deg) brightness(1.25)',
    glowColor: 'rgba(118,143,154,0.85)',
    badgeBg: '#344045',
    badgeColor: '#ced0cb',
    pulseColor: 'rgba(92,115,126,0.4)',
  },
};

/** Fallback emoji shown when a sprite image is missing */
const SPRITE_EMOJI_FALLBACK: Record<string, string> = {
  slime: '🟢',
  golem: '🪨',
  dragon: '🐉',
  mini_dragon: '🦎',
  wyvern: '🦕',
  frost_dragon: '❄️',
  fire_dragon: '🔥',
  centaur: '🐎',
  centaur_archer: '🏹',
  harpy: '🦅',
  stone_guardian: '🗿',
  medusa: '🐍',
  dragon_lord: '🐲',
  ghost: '👻',
  banshee: '👻',
  wraith: '💀',
  nightmare: '🌑',
  nightstalker: '🌑',
  hydra: '🐍',
  beholder: '👁️',
  mind_flayer: '🧠',
  void_stalker: '🌀',
  void_herald: '🌀',
  flux_anomaly: '⚡',
  fallen_seraph: '😇',
  corrupt_paladin: '⚔️',
  cyclops_stonehurler:'🗿',
  ogre_berserker: '💢',
  dhampir_ballister: '🏹',
  deepling_scout: '🐟',
  deepling_warrior: '🐟',
  bonelord: '💀',
  shadow_beast: '🌑',
  death_knight: '⚔️',
  infernatil: '😈',
  velshade: '👤',
  ghazbaran: '👿',
  zathroth: '💀',
};

interface EnemySpriteProps {
  type: string;
  variation: number;
  isFrozen?: boolean;
  statusEffect?: StatusEffect;
  className?: string;
  eliteType?: EliteType; // undefined = inimigo normal
}

export const EnemySprite = React.memo(({
  type,
  isFrozen = false,
  statusEffect,
  className = '',
  eliteType,
}: EnemySpriteProps) => {
  const [frame, setFrame] = React.useState(1);

  React.useEffect(() => {
    if (isFrozen || !ANIMATED_ENEMIES.has(type)) return;
    const speed = ENEMY_FRAME_SPEED[type] ?? ENEMY_FRAME_SPEED.default;
    const interval = setInterval(() => {
      setFrame(f => f >= 4 ? 1 : f + 1);
    }, speed);
    return () => clearInterval(interval);
  }, [type, isFrozen]);

  // ── Filtros de status (freeze, root, bleed) ────────────────────────────────
  let statusFilter = '';
  if (statusEffect === 'freeze') statusFilter = 'brightness(1.5) contrast(1.25) saturate(0.5) hue-rotate(180deg)';
  if (statusEffect === 'root') statusFilter = 'sepia(1) brightness(0.9) saturate(1.5) hue-rotate(50deg)';
  if (statusEffect === 'bleed') statusFilter = 'sepia(0.5) hue-rotate(320deg) saturate(2)';
  if (statusEffect === 'charm') statusFilter = 'sepia(0.4) hue-rotate(290deg) saturate(1.8) brightness(1.15)';   // Encanto do Yue: rosa

  // ── Elite filters override status (elite has visual priority) ────────────
  const eliteCfg = eliteType ? ELITE_CONFIG[eliteType] : null;
  const eliteFilter = eliteCfg ? eliteCfg.cssFilter : '';

  // Status tem prioridade sobre elite quando congelado
  const finalFilter = isFrozen
    ? statusFilter
    : statusFilter
    ? statusFilter
    : eliteFilter;

  const currentFrame = isFrozen ? 1 : frame;
  // Types that reuse another enemy's sprites
  const SPRITE_REMAP: Record<string, string> = {
    mini_dragon: 'dragon',
    cyclops_stonehurler: 'cyclops',
    ogre_berserker: 'ogre',
    // dhampir_ballister and dhampir_mage use their own sprites
    orc_spearman: 'orc',
    goblin_shaman: 'goblin_mage',
    ...SPRITE_ATO6,   // chefes do Ato VI e membros do Coro (components/chefes/lista.ts)
    ...SPRITE_ATO7,   // chefes do Ato VII que reaproveitam sprite
    ...SPRITE_ATO8,   // chefes do Ato VIII que reaproveitam sprite
    ...SPRITE_ATO9,   // chefes do Ato IX que reaproveitam sprite
    ...SPRITE_ATO5R,  // chefes do Ato V refeito que reaproveitam sprite
    ...SPRITE_ATO10,  // Devorador Anciao (luta final do X)
  };
  const st = SPRITE_REMAP[type] ?? type;
  const src = ANIMATED_ENEMIES.has(st)
    ? `./sprites/enemies/${st}_${currentFrame}.png`
    : `./sprites/enemies/${st}.png`;

  const img = (
    <img
      src={src}
      draggable={false}
      style={{
        imageRendering: 'pixelated',
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        filter: finalFilter || undefined,
      }}
      onError={(e) => {
        const img = e.currentTarget as HTMLImageElement;
        const emoji = SPRITE_EMOJI_FALLBACK[type];
        if (emoji) {
          img.style.display = 'none';
          const parent = img.parentElement;
          if (parent && !parent.querySelector('.emoji-fallback')) {
            const span = document.createElement('span');
            span.className = 'emoji-fallback';
            span.style.cssText = 'font-size:24px;display:flex;align-items:center;justify-content:center;width:100%;height:100%;';
            span.textContent = emoji;
            parent.appendChild(span);
          }
        } else {
          img.style.visibility = 'hidden';
        }
      }}
    />
  );

  // Inimigo normal — retorna img direto (sem overhead de wrapper)
  if (!eliteCfg) {
    return (
      <div className={`drop-shadow-sm ${className} overflow-visible`.trim()}
        style={{ width: '100%', height: '100%' }}>
        {img}
      </div>
    );
  }

  // Inimigo elite — wrapper com glow + badge de tipo
  return (
    <div
      className={`relative overflow-visible ${className}`.trim()}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Glow pulsante ao redor do sprite */}
      <div
        style={{
          position: 'absolute',
          inset: '-3px',
          borderRadius: 0,
          boxShadow: `none`,
          animation: 'elitePulse 1.8s ease-in-out infinite',
          pointerEvents:'none',
        }}
      />

      {/* Sprite com filtro de cor */}
      {img}

      {/* Badge de tipo no canto superior direito */}
      <div
        style={{
          position: 'absolute',
          top: '-6px',
          right: '-6px',
          width: '18px',
          height: '18px',
          borderRadius: 0,
          background: eliteCfg.badgeBg,
          border: `1.5px solid ${eliteCfg.badgeColor}`,
          boxShadow: `none`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '9px',
          zIndex: 10,
          pointerEvents:'none',
        }}
        title={`Elite: ${eliteCfg.label}`}
      >
        <Sigil name={resolveSigil(eliteCfg.icon) ?? 'skull'} size={9} color={eliteCfg.badgeColor} />
      </div>

      {/* Inline CSS animation */}
      <style>{`
        @keyframes elitePulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
});

EnemySprite.displayName = 'EnemySprite';

// ---------------------------------------------------------------------------
// ProjectileSprite
// ---------------------------------------------------------------------------

type ProjectileType =
  | 'mage' | 'archer' | 'warlock' | 'druid' | 'necromancer'
  | 'cleric' | 'priest' | 'paladin' | 'runesmith' | 'sylvanite'
  | 'dreadlord' | 'bard' | 'jester'
  | 'enemy_bone' | 'enemy_bone_big' | 'enemy_magic' | 'enemy_nature'
  | 'boss' | 'enemy'
  | string; // extensível para novos tipos

interface ProjectileSpriteProps {
  type: ProjectileType;
  onHitEffect?: string;
  className?: string;
}

// ── Projeteis em sprite (tiras geradas por scripts/projeteis.py) ──────────
// Chave = efeito especial ('fx_<onHitEffect>') se houver tira pra ele, senao o
// tipo. Tem tira → desenha a tira animada por CSS (steps), centrada no
// hitbox e maior que ele. Nao tem → cai no SVG abaixo, como sempre foi.
const chaveProjetil = (type: string, onHitEffect?: string): string | null => {
  if (onHitEffect && onHitEffect !== 'none' && PROJECTILE_SPRITES['fx_' + onHitEffect]) return 'fx_' + onHitEffect;
  if (PROJECTILE_SPRITES[type]) return type;
  return null;
};

export const ProjectileSprite = React.memo(({
  type,
  onHitEffect,
  className = '',
}: ProjectileSpriteProps) => {

  const _chave = chaveProjetil(type as string, onHitEffect);
  if (_chave) {
    const sp = PROJECTILE_SPRITES[_chave];
    return (
      <div className={className} style={{ position: 'relative', overflow: 'visible' }}>
        <div style={{
          position: 'absolute', left: '50%', top: '50%', width: sp.w, height: sp.h,
          transform: 'translate(-50%, -50%)',
          backgroundImage: `url(./sprites/projectiles/${_chave}.png)`,
          backgroundSize: `${sp.n * 100}% 100%`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
          animation: `projTira 0.42s steps(${sp.n - 1}) infinite`,
        }} />
      </div>
    );
  }

  // ── Efeitos especiais ────────────────────────────────────────────────────
  if (onHitEffect === 'fireball') return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="8" fill="#ac7357" />
      <circle cx="12" cy="12" r="5" fill="#b98e79" className="animate-pulse" />
      <path d="M12 4L14 8L12 10L10 8L12 4Z" fill="#ac7357" className="animate-spin" />
    </svg>
  );

  if (onHitEffect === 'explosive-arrow') return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="6" fill="#bc8e78" />
      <circle cx="12" cy="12" r="3" fill="#d9c1b6" className="animate-ping" />
      <path d="M2 12L6 10M2 12L6 14" stroke="#b98e79" strokeWidth="2" />
      <line x1="2" y1="12" x2="22" y2="12" stroke="#b98e79" strokeWidth="2" />
    </svg>
  );

  if (onHitEffect === 'lightning') return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M12 2L6 14H12L10 22L18 8H12L14 2L12 2Z" fill="#af9bb1" stroke="#e1d7d5" strokeWidth="1" />
    </svg>
  );

  if (onHitEffect === 'poison-bolt') return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="8" fill="#000000" />
      <circle cx="12" cy="12" r="5" fill="#959e87" className="animate-pulse" />
      <path d="M12 2L15 8L18 5L14 12L18 18L12 14L6 18L10 12L6 5L9 8L12 2Z" fill="#30392a" className="animate-spin" />
    </svg>
  );

  if (onHitEffect === 'entangle') return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="6" fill="#603f2f" />
      <path d="M12 2L14 8L20 6L16 12L22 16L16 18L14 22L10 16L4 18L8 12L2 6L10 8L12 2Z" fill="#404c38" className="animate-spin-slow" />
    </svg>
  );

  // ── Jester ───────────────────────────────────────────────────────────────
  if (type === 'jester') {
    if (onHitEffect === 'jester-gold') return (
      <svg viewBox="0 0 24 24" className={className}>
        <circle cx="12" cy="12" r="9" fill="#bc8e78" stroke="#936149" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="5" fill="#b98e79" className="animate-pulse" />
        <text x="7" y="16" fontSize="10" fill="#603f2f">✦</text>
      </svg>
    );
    if (onHitEffect === 'jester-purple') return (
      <svg viewBox="0 0 24 24" className={className}>
        <circle cx="12" cy="12" r="9" fill="#9b82a2" stroke="#725b7b" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="5" fill="#c3b3bf" className="animate-pulse" />
        <text x="7.5" y="16" fontSize="10" fill="#dddbd4">?</text>
      </svg>
    );
    // Default red ball (slow)
    return (
      <svg viewBox="0 0 24 24" className={className}>
        <circle cx="12" cy="12" r="9" fill="#9f584e" stroke="#81483f" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="5" fill="#c59993" className="animate-pulse" />
        <text x="8" y="16" fontSize="10" fill="#e2d0c7">●</text>
      </svg>
    );
  }

  // ── Projéteis inimigos ───────────────────────────────────────────────────
  if (type === 'enemy_bone') return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M2 12C2 10 4 8 6 10L18 10C20 8 22 10 22 12C22 14 20 16 18 14L6 14C4 16 2 14 2 12Z" fill="#efe4df" stroke="#a0978d" strokeWidth="1" className="animate-spin" />
    </svg>
  );

  if (type === 'enemy_bone_big') return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M2 12C2 8 4 6 6 10L18 10C22 6 24 10 22 14C20 18 18 14 6 14C2 18 2 12 2 12Z" fill="#efe4df" stroke="#80776c" strokeWidth="1.5" className="animate-spin-slow" />
    </svg>
  );

  if (type === 'enemy_magic') return (
    <svg viewBox="0 0 12 12" className={className}>
      <circle cx="6" cy="6" r="4" fill="#9cabaf" />
      <circle cx="6" cy="6" r="2" fill="white" className="animate-ping" />
    </svg>
  );

  if (type === 'enemy_nature') return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M12 2C12 2 20 10 12 22C4 10 12 2 12 2Z" fill="#959e87" />
      <line x1="12" y1="4" x2="12" y2="18" stroke="#404c38" strokeWidth="1" />
    </svg>
  );

  // ── Projéteis por classe de aliado ───────────────────────────────────────
  switch (type) {

    case 'mage': return (
      <svg viewBox="0 0 16 16" className={className}>
        <circle cx="8" cy="8" r="3.5" fill="#6d8894" />
        <circle cx="8" cy="8" r="2" fill="#ced0cb" className="animate-pulse" />
        <circle cx="8" cy="8" r="1" fill="white" />
        <circle cx="8" cy="8" r="5" stroke="#9cabaf" strokeWidth="0.8" fill="none" strokeDasharray="2 2" className="animate-spin-slow" />
      </svg>
    );

    case 'archer': return (
      <svg viewBox="0 0 28 10" className={className}>
        <line x1="2" y1="5" x2="24" y2="5" stroke="#bc8e78" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M22 2L27 5L22 8" stroke="#e3d2c9" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 5L6 3M2 5L6 7" stroke="#7a503c" strokeWidth="1" strokeLinecap="round" />
        <circle cx="14" cy="5" r="0.8" fill="#d9c1b6" opacity="0.6" />
      </svg>
    );

    case 'warlock': return (
      <svg viewBox="0 0 14 14" className={className}>
        <circle cx="7" cy="7" r="6" fill="#423446" />
        <path d="M7 2L8 5.5L11.5 7L8 8.5L7 12L6 8.5L2.5 7L6 5.5Z" fill="#af9bb1" opacity="0.9" />
        <circle cx="7" cy="7" r="2" fill="#5a4860" />
        <circle cx="7" cy="7" r="1" fill="#e1d7d5" opacity="0.8" className="animate-pulse" />
      </svg>
    );

    case 'druid': return (
      <svg viewBox="0 0 14 18" className={className}>
        <path d="M7 1C7 1 13 7 7 17C1 7 7 1 7 1Z" fill="#617355" />
        <path d="M7 3C7 3 11 8 7 15C3 8 7 3 7 3Z" fill="#959e87" opacity="0.8" />
        <line x1="7" y1="3" x2="7" y2="14" stroke="#30392a" strokeWidth="0.8" />
        <circle cx="7" cy="9" r="1.2" fill="#dbd6cc" opacity="0.9" className="animate-pulse" />
      </svg>
    );

    case 'necromancer': return (
      <svg viewBox="0 0 10 20" className={className}>
        <path d="M5 1L7 7L9 14L5 19L1 14L3 7Z" fill="#ddd2cc" />
        <path d="M5 3L6.5 8L8 14L5 17L2 14L3.5 8Z" fill="#efe4df" />
        <circle cx="5" cy="8" r="1.5" fill="#cbcabc" opacity="0.9" className="animate-pulse" />
        <line x1="5" y1="4" x2="5" y2="15" stroke="#80776c" strokeWidth="0.5" />
      </svg>
    );

    case 'cleric': return (
      <svg viewBox="0 0 16 16" className={className}>
        <circle cx="8" cy="8" r="5" fill="#603f2f" fillOpacity="0.6" />
        <path d="M8 2V14M2 8H14" stroke="#bc8e78" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M8 4V12M4 8H12" stroke="#e3d2c9" strokeWidth="1" strokeLinecap="round" />
        <circle cx="8" cy="8" r="2" fill="#d9c1b6" opacity="0.7" className="animate-pulse" />
      </svg>
    );

    case 'priest': return (
      <svg viewBox="0 0 14 14" className={className}>
        <circle cx="7" cy="7" r="5.5" fill="#344045" fillOpacity="0.7" />
        <circle cx="7" cy="7" r="3.5" fill="#dddbd4" opacity="0.8" />
        <path d="M7 3V11M3 7H11" stroke="#dddbd4" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="7" cy="7" r="1.5" fill="white" opacity="0.9" className="animate-pulse" />
      </svg>
    );

    case 'paladin': return (
      <svg viewBox="0 0 18 14" className={className}>
        <path d="M2 7L7 3L16 5L16 9L7 11Z" fill="#603f2f" fillOpacity="0.7" />
        <path d="M3 7L7 4L15 6L15 8L7 10Z" fill="#e3d2c9" opacity="0.9" />
        <path d="M7 4V10" stroke="#ac7357" strokeWidth="1" strokeLinecap="round" />
        <circle cx="11" cy="7" r="2" fill="#bc8e78" className="animate-pulse" />
        <circle cx="11" cy="7" r="1" fill="white" opacity="0.8" />
      </svg>
    );

    case 'runesmith': return (
      <svg viewBox="0 0 14 14" className={className}>
        <path d="M7 1L13 7L7 13L1 7Z" fill="#47585f" />
        <path d="M7 3L11 7L7 11L3 7Z" fill="#344045" />
        <path d="M7 4L10 7L7 10L4 7Z" stroke="#6d8894" strokeWidth="1" fill="none" />
        <path d="M5 7H9M7 5V9" stroke="#b6bebe" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="7" cy="7" r="1" fill="#ced0cb" className="animate-pulse" />
      </svg>
    );

    case 'sylvanite': return (
      <svg viewBox="0 0 16 16" className={className}>
        <circle cx="8" cy="8" r="6" fill="#30392a" />
        <circle cx="8" cy="8" r="4" fill="#404c38" />
        <path d="M8 3C8 3 12 7 8 13C4 7 8 3 8 3Z" fill="#959e87" opacity="0.8" />
        <circle cx="8" cy="8" r="1.5" fill="#dbd6cc" className="animate-pulse" />
        <circle cx="5.5" cy="6.5" r="0.8" fill="#cbcabc" opacity="0.7" />
        <circle cx="10.5" cy="9.5" r="0.8" fill="#cbcabc" opacity="0.7" />
      </svg>
    );

    case 'dreadlord': return (
      <svg viewBox="0 0 12 20" className={className}>
        <path d="M6 1L10 8L8 12L6 19L4 12L2 8Z" fill="#2d1916" />
        <path d="M6 3L9 8L7.5 12L6 17L4.5 12L3 8Z" fill="#81483f" />
        <path d="M6 5L8 9L6 13L4 9Z" fill="#c59993" opacity="0.8" />
        <circle cx="6" cy="9" r="1.2" fill="#e2d0c7" className="animate-pulse" />
      </svg>
    );

    case 'bard': return (
      <svg viewBox="0 0 14 14" className={className}>
        <circle cx="7" cy="7" r="5.5" fill="#5a4860" />
        <circle cx="7" cy="7" r="3.5" fill="#5a4860" opacity="0.8" />
        <path d="M6 4.5V9.5M9 3.5V6" stroke="#e2d0c7" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="5" cy="9.5" r="1.5" fill="#e2d0c7" />
        <circle cx="8" cy="6" r="1.2" fill="#e2d0c7" />
        <path d="M6 4.5L9 3.5" stroke="#e2d0c7" strokeWidth="1" />
      </svg>
    );

    case 'jester': return (
      <svg viewBox="0 0 16 16" className={className}>
        <circle cx="8" cy="8" r="6" fill="#603f2f" />
        <path d="M8 2A6 6 0 0 1 14 8Z" fill="#9f584e" />
        <path d="M8 14A6 6 0 0 1 2 8Z" fill="#936149" />
        <path d="M8 2A6 6 0 0 0 2 8Z" fill="#a8745a" />
        <path d="M8 14A6 6 0 0 0 14 8Z" fill="#ac7357" />
        <circle cx="8" cy="8" r="2.5" fill="#d9c1b6" opacity="0.85" />
        <circle cx="8" cy="8" r="1" fill="white" className="animate-pulse" />
      </svg>
    );

    case 'vex': return (
      <svg viewBox="0 0 14 14" className={className}>
        <path d="M7 1L8.5 5.5L13 7L8.5 8.5L7 13L5.5 8.5L1 7L5.5 5.5Z" fill="#344045" />
        <path d="M7 3L8.2 5.8L11.5 7L8.2 8.2L7 11.5L5.8 8.2L2.5 7L5.8 5.8Z" fill="#9b82a2" opacity="0.9" />
        <circle cx="7" cy="7" r="1.5" fill="#dddbd4" className="animate-pulse" />
      </svg>
    );

    case 'zylvara': return (
      <svg viewBox="0 0 28 10" className={className}>
        <path d="M2 5L22 5" stroke="#47585f" strokeWidth="2" strokeLinecap="round" />
        <path d="M20 2L26 5L20 8" fill="#344045" stroke="#9cabaf" strokeWidth="0.8" strokeLinejoin="round" />
        <path d="M2 5L5 3.5M2 5L5 6.5" stroke="#6d8894" strokeWidth="1" strokeLinecap="round" />
        <circle cx="10" cy="6.5" r="0.9" fill="#959e87" opacity="0.9" className="animate-pulse" />
        <circle cx="15" cy="7" r="0.6" fill="#cbcabc" opacity="0.6" />
      </svg>
    );

    case 'morrigan': return (
      <svg viewBox="0 0 16 16" className={className}>
        <circle cx="8" cy="8" r="6" fill="#423446" />
        <circle cx="8" cy="8" r="4.5" fill="#5a4860" opacity="0.9" />
        <path d="M8 3C8 3 11 5 11 8C11 11 8 13 8 13C8 13 5 11 5 8C5 5 8 3 8 3Z" fill="#9b82a2" opacity="0.7" />
        <path d="M5 5C5 5 3 7 4 9" stroke="#c3b3bf" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        <path d="M11 5C11 5 13 7 12 9" stroke="#c3b3bf" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        <circle cx="8" cy="8" r="2" fill="#dddbd4" opacity="0.6" className="animate-pulse" />
        <circle cx="8" cy="8" r="1" fill="#dddbd4" opacity="0.9" />
      </svg>
    );

    case 'ixara': return (
      <svg viewBox="0 0 16 16" className={className}>
        <circle cx="8" cy="8" r="5.5" fill="#2e2530" />
        <path d="M8 2L9.5 5L12 3.5L10.5 6.5L14 7L10.5 8.5L13 11L9.5 10L8 14L6.5 10L3 11L5.5 8.5L2 7L5.5 6.5L4 3.5L6.5 5Z" fill="#8a6e96" opacity="0.9" />
        <circle cx="8" cy="8" r="2.5" fill="#d5cacd" opacity="0.8" className="animate-pulse" />
        <circle cx="8" cy="8" r="1.2" fill="#e1d7d5" />
      </svg>
    );

    case 'berserker': return (
      <svg viewBox="0 0 18 12" className={className}>
        <path d="M1 6L5 1L16 3L17 6L16 9L5 11Z" fill="#2d1916" />
        <path d="M2 6L5.5 2L15 4L16 6L15 8L5.5 10Z" fill="#6b3b34" />
        <path d="M3 6L6 3L14 5L14.5 6L14 7L6 9Z" fill="#81483f" opacity="0.8" />
        <circle cx="11" cy="6" r="1.2" fill="#e2d0c7" opacity="0.7" className="animate-pulse" />
      </svg>
    );

    case 'frost_warden': return (
      <svg viewBox="0 0 16 16" className={className}>
        <circle cx="8" cy="8" r="5.5" fill="#344045" opacity="0.8" />
        <line x1="8" y1="2" x2="8" y2="14" stroke="#b6bebe" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="2" y1="8" x2="14" y2="8" stroke="#b6bebe" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="3.5" y1="3.5" x2="12.5" y2="12.5" stroke="#b6bebe" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="12.5" y1="3.5" x2="3.5" y2="12.5" stroke="#b6bebe" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="8" cy="3" r="1" fill="#dddbd4" />
        <circle cx="8" cy="13" r="1" fill="#dddbd4" />
        <circle cx="3" cy="8" r="1" fill="#dddbd4" />
        <circle cx="13" cy="8" r="1" fill="#dddbd4" />
        <circle cx="8" cy="8" r="2" fill="#dddbd4" opacity="0.9" className="animate-pulse" />
      </svg>
    );

    case 'yue': return (
      <svg viewBox="0 0 16 16" className={className}>
        <circle cx="8" cy="8" r="6" fill="#5a2a4a" opacity="0.8" />
        {/* leque aberto */}
        <path d="M8 12 L3 5 Q8 2 13 5 Z" fill="#f0d9e8" opacity="0.95" />
        <path d="M8 12 L5.5 4.2 M8 12 L8 3.2 M8 12 L10.5 4.2" stroke="#b8477f" strokeWidth="0.8" />
        <circle cx="8" cy="12" r="1.2" fill="#b8477f" className="animate-pulse" />
      </svg>
    );

    case 'billy': return (
      <svg viewBox="0 0 16 16" className={className}>
        <circle cx="8" cy="8" r="6" fill="#2a2320" opacity="0.85" />
        {/* mira com quatro marcas — o quarto tiro */}
        <circle cx="8" cy="8" r="3.5" fill="none" stroke="#d9c1b6" strokeWidth="1.2" />
        <path d="M8 2.5V5M8 11V13.5M2.5 8H5M11 8H13.5" stroke="#d9c1b6" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="8" cy="8" r="1.2" fill="#e8b04a" className="animate-pulse" />
      </svg>
    );

    case 'inquisitor': return (
      <svg viewBox="0 0 16 16" className={className}>
        <circle cx="8" cy="8" r="6" fill="#603f2f" opacity="0.7" />
        <path d="M8 1L9 4.5L12.5 3L10.5 6L14.5 6.5L11.5 8.5L14 11.5L10.5 10L9.5 14L8 10.5L6.5 14L5.5 10L2 11.5L4.5 8.5L1.5 6.5L5.5 6L3.5 3L7 4.5Z" fill="#936149" opacity="0.8" />
        <path d="M8 4V12M4 8H12" stroke="#d9c1b6" strokeWidth="2" strokeLinecap="round" />
        <circle cx="8" cy="8" r="2" fill="#bc8e78" opacity="0.9" className="animate-pulse" />
        <circle cx="8" cy="8" r="1" fill="#e3d2c9" />
      </svg>
    );

    case 'malachar_human': return (
      <svg viewBox="0 0 16 16" className={className}>
        <circle cx="8" cy="8" r="6.5" fill="#151117" />
        <circle cx="8" cy="8" r="5" fill="#2e2530" />
        <ellipse cx="8" cy="8" rx="5.5" ry="2" stroke="#9b82a2" strokeWidth="0.8" fill="none" opacity="0.7" />
        <ellipse cx="8" cy="8" rx="2" ry="5" stroke="#8a6e96" strokeWidth="0.8" fill="none" opacity="0.5" />
        <circle cx="8" cy="8" r="2.5" fill="#344045" />
        <circle cx="8" cy="8" r="1.5" fill="#5a4860" opacity="0.9" className="animate-pulse" />
        <circle cx="8" cy="8" r="0.8" fill="#dddbd4" />
        <circle cx="5" cy="5" r="0.5" fill="#c3b3bf" opacity="0.8" />
        <circle cx="11" cy="11" r="0.5" fill="#c3b3bf" opacity="0.8" />
      </svg>
    );

    default:
      return <div className="w-2 h-2 bg-white " />;
  }
});

ProjectileSprite.displayName = 'ProjectileSprite';
