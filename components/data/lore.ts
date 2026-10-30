// ═══════════════════════════════════════════════════════════════════════════
// lore.ts — espinha do universo de Grimhold, por herói.
//
// Fonte de verdade humana: docs/LORE.md (este arquivo deve bater com ela).
// Textos ficam no i18n:
//   lore.faccao.<f>.nome / .desc        lore.papel.<p>        lore.lugar.<l>
//   lore.laco.tipo.<t>                  lore.laco.<chave>     (frase do laço)
//   lore.<tipo>.faccaoTexto             (parágrafo novo, origem + facção)
//   lore.<tipo>.bomEm.<i>               lore.<tipo>.sofreCom.<i>
// Nenhuma facção dá bônus mecânico — é só eixo de leitura e de filtro.
// ═══════════════════════════════════════════════════════════════════════════

export type Faccao   = 'igreja' | 'colegiado' | 'mata' | 'sombras' | 'abismo' | 'grimhold';
export type Papel    = 'vanguarda' | 'dano' | 'controle' | 'suporte' | 'invocador';
export type TipoLaco = 'amor' | 'sangue' | 'rivalidade' | 'mestre' | 'divida';
export type Lugar    = 'colegiado' | 'mata' | 'floresta_antiga' | 'velmorath' | 'velarath' | 'ashfen'
                     | 'cais' | 'cruzamento' | 'mosteiro' | 'igreja' | 'fenda' | 'terras_baixas'
                     | 'norte' | 'desconhecido';

export interface Laco {
  com: string;        // tipo do outro herói (AllyType)
  tipo: TipoLaco;
  chave: string;      // i18n: lore.laco.<chave>
}

export interface LoreHeroi {
  faccao: Faccao;
  origem: Lugar;      // i18n: lore.lugar.<origem>
  papel: Papel;
  bomEm: number;      // quantas frases em lore.<tipo>.bomEm.<i>
  sofreCom: number;   // idem lore.<tipo>.sofreCom.<i>
  lacos: Laco[];
}

export const FACCOES: Faccao[] = ['igreja', 'colegiado', 'mata', 'sombras', 'abismo', 'grimhold'];
export const PAPEIS:  Papel[]  = ['vanguarda', 'dano', 'controle', 'suporte', 'invocador'];

// Cor de selo por facção (só visual; segue a paleta pixel do jogo)
export const FACCAO_COR: Record<Faccao, string> = {
  igreja:    '#e8d9a0',
  colegiado: '#8fb4e8',
  mata:      '#8fce7a',
  sombras:   '#b48fe0',
  abismo:    '#e07a7a',
  grimhold:  '#d9c1b6',
};

export const LACO_ICONE: Record<TipoLaco, string> = {
  amor: '♥', sangue: '⚜', rivalidade: '⚔', mestre: '✎', divida: '⚖',
};

// Laços são simétricos: declarados uma vez aqui e espelhados em LORE abaixo.
const LACOS: Array<[string, string, TipoLaco, string]> = [
  ['archer',       'sylvanite',      'amor',       'ifigenia_aelindra'],
  ['paladin',      'cleric',         'divida',     'hellel_alva'],
  ['inquisitor',   'warlock',        'rivalidade', 'valdric_sibilus'],
  ['frost_warden', 'ixara',          'rivalidade', 'serafyne_ixara'],
  ['morrigan',     'necromancer',    'mestre',     'morrigan_ikan'],
  ['yue',          'billy',          'rivalidade', 'yue_billy'],
  ['jester',       'bard',           'divida',     'ming_sonetto'],
  ['runesmith',    'mage',           'mestre',     'veltharion_krash'],
  ['zylvara',      'vex',            'rivalidade', 'zylvara_vex'],
  ['dreadlord',    'malachar_human', 'rivalidade', 'kaelvor_malachar'],
  ['berserker',    'paladin',        'divida',     'gorak_hellel'],
  ['sylvanite',    'druid',          'mestre',     'aelindra_vindimia'],
];

const base: Record<string, Omit<LoreHeroi, 'lacos'>> = {
  // ── A Igreja ─────────────────────────────────────────────────────────────
  cleric:         { faccao: 'igreja',    origem: 'velmorath',       papel: 'vanguarda', bomEm: 3, sofreCom: 2 },
  paladin:        { faccao: 'igreja',    origem: 'igreja',          papel: 'vanguarda', bomEm: 3, sofreCom: 2 },
  inquisitor:     { faccao: 'igreja',    origem: 'igreja',          papel: 'dano',      bomEm: 3, sofreCom: 2 },
  priest:         { faccao: 'igreja',    origem: 'mosteiro',        papel: 'suporte',   bomEm: 3, sofreCom: 2 },
  // ── Colegiado Arcano ─────────────────────────────────────────────────────
  mage:           { faccao: 'colegiado', origem: 'colegiado',       papel: 'dano',      bomEm: 3, sofreCom: 2 },
  runesmith:      { faccao: 'colegiado', origem: 'colegiado',       papel: 'invocador', bomEm: 3, sofreCom: 2 },
  // ── A Mata ───────────────────────────────────────────────────────────────
  archer:         { faccao: 'mata',      origem: 'mata',            papel: 'dano',      bomEm: 3, sofreCom: 2 },
  druid:          { faccao: 'mata',      origem: 'mata',            papel: 'controle',  bomEm: 3, sofreCom: 2 },
  sylvanite:      { faccao: 'mata',      origem: 'floresta_antiga', papel: 'suporte',   bomEm: 3, sofreCom: 2 },
  // ── As Sombras ───────────────────────────────────────────────────────────
  warlock:        { faccao: 'sombras',   origem: 'cruzamento',      papel: 'dano',      bomEm: 3, sofreCom: 2 },
  necromancer:    { faccao: 'sombras',   origem: 'desconhecido',    papel: 'invocador', bomEm: 3, sofreCom: 2 },
  zylvara:        { faccao: 'sombras',   origem: 'velarath',        papel: 'dano',      bomEm: 3, sofreCom: 2 },
  vex:            { faccao: 'sombras',   origem: 'desconhecido',    papel: 'dano',      bomEm: 3, sofreCom: 2 },
  morrigan:       { faccao: 'sombras',   origem: 'desconhecido',    papel: 'dano',      bomEm: 3, sofreCom: 2 },
  // ── O Abismo ─────────────────────────────────────────────────────────────
  dreadlord:      { faccao: 'abismo',    origem: 'desconhecido',    papel: 'vanguarda', bomEm: 3, sofreCom: 2 },
  ixara:          { faccao: 'abismo',    origem: 'fenda',           papel: 'vanguarda', bomEm: 3, sofreCom: 2 },
  malachar_human: { faccao: 'abismo',    origem: 'fenda',           papel: 'dano',      bomEm: 3, sofreCom: 2 },
  // ── Gente de Grimhold ────────────────────────────────────────────────────
  jester:         { faccao: 'grimhold',  origem: 'desconhecido',    papel: 'controle',  bomEm: 3, sofreCom: 2 },
  bard:           { faccao: 'grimhold',  origem: 'terras_baixas',   papel: 'suporte',   bomEm: 3, sofreCom: 2 },
  berserker:      { faccao: 'grimhold',  origem: 'ashfen',          papel: 'vanguarda', bomEm: 3, sofreCom: 2 },
  frost_warden:   { faccao: 'grimhold',  origem: 'norte',           papel: 'controle',  bomEm: 3, sofreCom: 2 },
  yue:            { faccao: 'grimhold',  origem: 'cais',            papel: 'vanguarda', bomEm: 3, sofreCom: 2 },
  billy:          { faccao: 'grimhold',  origem: 'norte',           papel: 'dano',      bomEm: 3, sofreCom: 2 },
};

export const LORE: Record<string, LoreHeroi> = Object.fromEntries(
  Object.entries(base).map(([tipo, b]) => [tipo, {
    ...b,
    lacos: LACOS
      .filter(([a, c]) => a === tipo || c === tipo)
      .map(([a, c, t, chave]) => ({ com: a === tipo ? c : a, tipo: t, chave })),
  }]),
);

export const HEROIS_DA_FACCAO = (f: Faccao): string[] =>
  Object.keys(LORE).filter(tipo => LORE[tipo].faccao === f);
