// ══════════════════════════════════════════════════════════════════════
// data/cardIcons.ts — icone pixel de CADA carta do compendio, por id.
//
// Antes o icone vinha do Sigil da carta (22 cartas dividiam "arcane" e
// viravam o mesmo orbe). Aqui cada carta tem o seu, escolhido pelo que ela
// faz. Nomes = public/ui/pixel/icons/<nome>.png (scripts/icones-pixel.py).
// Carta sem entrada cai no icone do Sigil/emoji, como antes.
//
// Curado a mao em 18/9/2026. Ao criar carta nova, acrescente aqui.
// ══════════════════════════════════════════════════════════════════════
export const CARD_ICON: Record<string, string> = {
  // ── globais ──
  'expand-slots': 'crown', 'dmg-boost': 'sword_fire', 'gold-cache': 'chest_gold', 'iron-discipline': 'shield_iron',
  'blood-price': 'blood', 'arcane-efficiency': 'hourglass', 'eagle-eye': 'eye', 'last-stand': 'flag',
  'overkill': 'axe_big', 'momentum': 'wind', 'glass-cannon': 'ice_shard', 'fortitude': 'heart',
  'shield-wall': 'shield_wood', 'second-wind': 'feather', 'gamblers-coin': 'coins', 'sacrifice': 'scythe',
  'cursed-strength': 'skull_red', 'dark-bargain': 'moon_dark', 'war-council': 'scroll', 'tactical-retreat': 'boots',
  'bulwark-formation': 'shield_gold', 'transmutation': 'crystal_ball', 'soul-link': 'chain',
  // ── arqueira ──
  'archer-thousandcuts': 'dagger', 'archer-explosive': 'bow_fire', 'archer-rain': 'arrow', 'archer-sniper': 'target',
  // ── mago ──
  'mage-surge': 'wand', 'mage-fireball-base': 'flame', 'mage-blink': 'sparkle', 'warlock-hex': 'rune',
  // ── bruxo ──
  'warlock-lightning': 'bolt', 'warlock-drain': 'blood', 'warlock-void': 'moon_dark',
  // ── druida ──
  'druid-roots': 'tree', 'druid-cycle': 'leaf', 'druid-eclipse': 'moon', 'druid-spore': 'mushroom',
  // ── necromante ──
  'necro-explosion': 'vial_green', 'necro-power': 'skull_bone', 'necro-raise': 'gravestone', 'necro-plague-mastery': 'poison',
  // ── bardo ──
  'bard-radius': 'horn', 'bard-hymn': 'drum', 'bard-anthem': 'lyre', 'bard-dirge': 'bell',
  // ── clériga ──
  'cleric-blessing': 'sun', 'cleric-sacred': 'candle_lit', 'cleric-battle-prayer': 'amulet', 'cleric-divine-shield': 'shield_blue',
  // ── paladino ──
  'paladin-will': 'armor', 'paladin-caldera': 'sword_fire', 'paladin-martyr': 'helm_red', 'paladin-holy-ground': 'stone_face',
  // ── sacerdote ──
  'priest-mending': 'elixir', 'priest-guard': 'shield', 'priest-res': 'star_gold', 'priest-mass-mending': 'potion',
  // ── vex ──
  'vex-hunger': 'claw', 'vex-blink': 'dagger', 'vex-veil': 'cloak', 'vex-deathmark': 'target',
  // ── zylvara ──
  'zylvara-poison': 'vial_green', 'zylvara-cloak': 'cloak', 'zylvara-extinct': 'skull_red', 'zylvara-widow': 'bow_ice',
  // ── morrigan ──
  'morrigan-ravenous': 'wing', 'morrigan-bitterharvest': 'leaf_red', 'morrigan-devourstorm': 'tornado', 'morrigan-soulecho': 'ghost',
  // ── ixara ──
  'ixara-rage': 'helm_red', 'ixara-ricochet': 'explosion', 'ixara-collapse': 'volcano', 'ixara-furysurge': 'sparks',
  // ── bobo ──
  'jester-chaos': 'gift', 'jester-pratfall': 'dice2', 'jester-roulette': 'dice', 'jester-tricks': 'pouch',
  // ── ferreiro rúnico ──
  'runesmith-resonance': 'rune', 'runesmith-volley': 'spear', 'runesmith-overload': 'bolt', 'runesmith-reach': 'map',
  // ── sylvanite ──
  'sylvanite-spore-burst': 'mushroom', 'sylvanite-toxin': 'poison', 'sylvanite-bloom': 'herb', 'sylvanite-roots': 'tree_pine',
  // ── senhor do pavor ──
  'dreadlord-edge': 'sword_dark', 'dreadlord-rupture': 'nova', 'dreadlord-harvest': 'skull',
  // ── berserker ──
  'berserker-iron-skin': 'armor', 'berserker-bloodrage': 'blood', 'berserker-warchief': 'drum', 'berserker-battlecry': 'horn',
  // ── guardiã do gelo ──
  'frost_warden-deep-freeze': 'ice', 'frost_warden-shatter': 'ice_shard', 'frost_warden-wall-mastery': 'shield_iron', 'frost_warden-coldsnap': 'sword_ice',
  // ── inquisidor ──
  'inquisitor-death-warrant': 'scroll', 'inquisitor-interrogation': 'chain', 'inquisitor-crusade': 'banner', 'inquisitor-holybrand': 'sun',
  // ── malachar ──
  'malachar-soulpact': 'ghost', 'malachar-voidstorm': 'comet', 'malachar-solitude': 'moon_dark', 'malachar-voidrift': 'spiral',
  // ── sinergias ──
  'sacred-trinity': 'sun', 'shadow-council': 'moon_dark', 'natures-wrath': 'tree', 'arcane-storm': 'bolt',
  'iron-bulwark': 'shield_iron', 'death-choir': 'bell', 'arcane-barrage': 'arrow',
  'soul-mending': 'heart', 'wild-hunt': 'bow', 'storm-forge': 'anvil', 'verdant-pact': 'herb',
  'dark-hunger': 'claw', 'life-forge': 'elixir', 'arcane-ruin': 'crystal_ball', 'umbral-brood': 'poison',
  'coven-pyre': 'flame', 'riot-engine': 'gear', 'hexbound-pact': 'rune', 'grave-contagion': 'gravestone',
  'shadow-execution': 'dagger', 'hunters-sigil': 'target', 'berserker-core': 'axe_big', 'war-anthem': 'drum',
  'blood-and-ice': 'sword_ice', 'divine-verdict': 'scales', 'iron-conviction': 'gauntlet', 'permafrost-ward': 'ice',
  'danse-macabre': 'skull', 'chaos-pact': 'spiral', 'pact-of-ruin': 'gravestone', 'void-forge': 'anvil',
  // ── loja (shopPools.ts) ──
  'shop-war-drum': 'drum', 'shop-steady-aim': 'bow', 'shop-speed-rune': 'gear', 'shop-whetstone': 'dagger',
  'shop-fury-scroll': 'scroll', 'shop-sharpening-stone': 'rock', 'shop-berserker-ring': 'ring', 'shop-armor-pierce': 'spear',
  'shop-executioner': 'axe_big', 'shop-twin-strike': 'sword', 'shop-void-pact': 'rune', 'shop-battle-std': 'banner',
  'shop-echo-strike': 'spiral', 'shop-gold-dmg': 'sword_fire', 'shop-cataclysm': 'comet', 'shop-overclock': 'bolt',
  'shop-war-banner': 'flag', 'shop-field-ration': 'meat', 'shop-barrier-rep': 'hammer', 'shop-warding-rune': 'orb',
  'shop-quick-repair': 'anvil', 'shop-caltrops': 'chain', 'shop-regen-tonic': 'potion', 'shop-minor-shield': 'elixir',
  'shop-vampiric-edge': 'blood', 'shop-shadow-cloak': 'cloak', 'shop-stone-skin': 'armor', 'shop-revive-charm': 'amulet',
  'shop-ward-of-fortune': 'star_gold', 'shop-soulbind': 'diamond', 'shop-hp-up': 'heart', 'shop-fortify': 'castle',
  'shop-recall-scroll': 'map', 'shop-titan-core': 'stone_face', 'shop-soul-harvest': 'ghost', 'shop-barrier-reinforce': 'shield_gold',
  'shop-vital-surge': 'gauntlet', 'shop-tempered-will': 'helm', 'shop-gold-finder': 'coins', 'shop-mana-shard': 'crystal',
  'shop-cursed-relic': 'skull_red', 'shop-tome-knowledge': 'tome', 'shop-mana-font': 'vial_blue', 'shop-gold-hoard': 'chest_gold',
  'shop-arcane-codex': 'book_red', 'shop-soul-compass': 'compass', 'shop-chaos-orb': 'dice', 'shop-lodestone': 'rock',
  'shop-ancient-tome': 'book', 'shop-blood-moon': 'moon_dark', 'shop-trident': 'staff', 'shop-rift-mirror': 'mirror',
  'shop-arcane-lens': 'crystal_ball', 'shop-starfall-shard': 'star', 'shop-elixir-mastery': 'vial_green',
  'shop-command-crest': 'crown', 'shop-giant-slayer': 'axe', 'shop-barrier-core': 'shield_iron', 'shop-purifying-flask': 'potion',
  'shop-chronos-hourglass': 'hourglass', 'shop-alchemist-stone': 'diamond',
  // ── pool de upgrades em run (ui.cardx.*) — ids diferentes do compendio ──
  'ranger-focus': 'target', 'storm-of-arrows': 'arrow', 'arcane-blink': 'sparkle', 'arcane-singularity': 'crystal_ball',
  'void-ascension': 'comet', 'venom-of-the-deep': 'vial_green', 'shadow-cloak': 'cloak', 'extinction-protocol': 'skull_red',
  'eternal-eclipse': 'moon', 'soul-echo': 'ghost', 'ravenous': 'wing', 'bitter-harvest': 'leaf_red', 'consuming-dark': 'moon_dark',
  'soul-plague': 'poison', 'fury-surge': 'sparks', 'rage-conduit': 'helm_red', 'horns-of-chaos': 'explosion', 'total-collapse': 'volcano',
  'primal-rage': 'claw', 'battle-cry': 'horn', 'blood-rage': 'blood', 'iron-skin': 'armor', 'eternal-fury': 'axe_big',
  'cold-snap': 'sword_ice', 'deep-freeze': 'ice', 'wall-mastery': 'shield_iron', 'shatter': 'ice_shard', 'absolute-zero': 'ice_shard',
  'holy-brand': 'sun', 'interrogation': 'chain', 'crusade': 'banner', 'death-warrant': 'scroll', 'final-judgment': 'scales',
  'void-rift': 'spiral', 'soul-pact': 'ghost', 'void-storm': 'comet', 'perfect-solitude': 'moon_dark', 'mythic-ascension': 'crown',
  'ancient-will': 'tome', 'death-lord': 'skull_red', 'crescendo': 'horn', 'anthem-of-ruin': 'lyre', 'dirge-of-doom': 'bell',
  'grand-finale': 'drum', 'sanctified-wrath': 'sword_fire', 'iron-will': 'armor', 'eternal-crusade': 'flag', 'mending-touch': 'elixir',
  'divine-covenant': 'amulet', 'extended-inscription': 'map', 'grand-rune': 'rune', 'world-tree': 'tree', 'death-mark': 'target',
  'hunger': 'claw', 'blink-strike': 'dagger', 'veil-of-shadow': 'cloak', 'shadow-death': 'scythe', 'void-eclipse': 'moon_dark',
  'void-persistence': 'hourglass', 'void-apotheosis': 'crystal', 'mage-fireball': 'flame', 'mage-echo': 'spiral',
  'berserker-wardrum': 'drum', 'runesmith-sigil': 'rune', 'sylvanite-root': 'tree_pine', 'sylvanite-rebirth': 'herb',
  'dreadlord-hunger': 'sword_dark', 'dreadlord-void': 'nova', 'dreadlord-harvest-cap': 'skull', 'jester-trick': 'pouch',
  'cleric-self': 'candle_lit', 'cleric-retribution': 'sun',
  // ── ids reais do pool de run (GameCanvas: options.push({ id: `<id>-${uid()}` })) — o slug do i18n (ui.cardx.*) nao e o id ──
  'dmh-goblin-spd': 'alma_goblin_spd', 'dmh-orc-dmg': 'alma_orc_dmg', 'dmh-undead-hp': 'alma_undead_hp', 'dmh-lich-range': 'alma_lich_range',
  'dmh-dragon': 'alma_dragon', 'dmh-elf-spd': 'alma_elf_spd', 'dmh-dwarf-hp': 'alma_dwarf_hp', 'dmh-demon': 'alma_demon',
  'dmh-vampire': 'alma_vampire', 'dmh-brute': 'alma_brute', 'dmh-gen-dmg': 'alma_gen_dmg', 'dmh-gen-spd': 'alma_gen_spd',
  'dmh-gen-hp': 'alma_gen_hp', 'archer-speed': 'target', 'archer-storm': 'arrow', 'mage-range': 'sparkle',
  'mage-singularity': 'crystal_ball', 'warlock-ascension': 'comet', 'zylvara-eclipse': 'moon', 'morri-soulecho': 'ghost',
  'morri-ravenous': 'wing', 'morri-bitterharvest': 'leaf_red', 'morri-consumingdark': 'moon_dark', 'morri-plague': 'poison',
  'ixara-primalrage': 'claw', 'berserker-bloodthreshold': 'blood', 'berserker-ironskin': 'armor', 'berserker-eternalfury': 'axe_big',
  'frost-coldsnap': 'sword_ice', 'frost-deepfreeze': 'ice', 'frost-wallmastery': 'shield_iron', 'frost-shatter': 'ice_shard',
  'frost-absolutezero': 'ice_shard', 'inq-holybrand': 'sun', 'inq-interrogation': 'chain', 'inq-crusade': 'banner',
  // ── yue / billy ──
  'yue-holofote': 'star_gold', 'yue-passo-duplo': 'boots', 'yue-camarim': 'mirror', 'yue-ritmo-vibrante': 'bell', 'yue-bis': 'sparkle',
  'billy-balas-marcadas': 'target', 'billy-recarga-rapida': 'hourglass', 'billy-cortina-final': 'banner', 'billy-tiro-certeiro': 'bow', 'billy-obra-prima': 'leaf_red',
  'inq-deathwarrant': 'scroll', 'inq-finaljudgment': 'scales', 'mal-voidrift': 'spiral', 'mal-soulpact': 'ghost',
  'mal-voidstorm': 'comet', 'mal-solitude': 'moon_dark', 'mal-ascensao': 'crown', 'druid-ancientwill': 'tome',
  'necro-death-lord': 'skull_red', 'bard-grandfinale': 'drum', 'cleric-sanctifiedwrath': 'sword_fire', 'paladin-hp': 'armor',
  'paladin-eternalcrusade': 'flag', 'priest-heal': 'elixir', 'priest-divinecovenant': 'amulet', 'runesmith-grandrune': 'rune',
  'sylvanite-worldtree': 'tree', 'vex-shadowdeath': 'scythe', 'dreadlord-eclipse': 'moon_dark', 'dreadlord-eternal': 'hourglass',
  'dreadlord-apotheosis': 'crystal', 'jester-deadmanshand': 'dice',
};

/** Icone da carta pelo id (as cartas dropadas em run tem sufixo "-<uid>"; casa pelo prefixo). */
export const cardIconFor = (id: string): string | null => {
  if (CARD_ICON[id]) return CARD_ICON[id];
  const base = Object.keys(CARD_ICON).find(k => id.startsWith(k + '-') || id.startsWith('new-' + k) || id === 'new-' + k);
  return base ? CARD_ICON[base] : null;
};
