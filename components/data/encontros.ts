// ══════════════════════════════════════════════════════════════════════
// components/data/encontros.ts — Encontros entre ondas
//
// Um encontro e uma cena curta com 2–3 escolhas, mostrada entre uma onda e
// outra (o jogo para em GameStatus.ENCOUNTER). Cada opcao pode exigir um
// personagem no time (`requer`), cobrar ouro/HP da muralha e aplicar uma lista
// de efeitos declarativos que o GameCanvas interpreta (aplicarEfeitoEncontro).
//
// Textos: i18n `encontro.<id>.titulo`, `encontro.<id>.texto`,
//         `encontro.<id>.op.<opcao>` (rotulo do botao, ja com custo/efeito).
// Regras de sorteio (GameCanvas): a partir da onda 3, ~25% por onda, nunca antes
// de chefe, no minimo 3 ondas entre dois, cada encontro no maximo 1x por run.
// Numeros aqui sao de balanceamento: ajustar depois de jogar.
// ══════════════════════════════════════════════════════════════════════

export type EfeitoEncontro =
  | { tipo: 'ouro'; n: number }
  | { tipo: 'muralha'; hp?: number; max?: number; curar?: boolean }
  | { tipo: 'dano'; pct: number; alvo: 'todos' | 'heroi' | 'distancia' | string }   // string = tipo de aliado
  | { tipo: 'aliado'; personagem?: string; nivel?: number }                        // sem personagem = comum aleatorio
  | { tipo: 'removerMaisFraco' }
  | { tipo: 'fortalecerAleatorio'; pct: number }                                    // +dano e +HP num aliado (nao-heroi) aleatorio
  | { tipo: 'curarTodos' }
  | { tipo: 'slot' }
  | { tipo: 'raridade'; r: 'rare' | 'legendary' }
  | { tipo: 'proximaOnda'; hpInimigos?: number; velInimigos?: number; maisInimigos?: number; ouroDobro?: boolean; eliteEsqueleto?: boolean; cota?: { abates: number; ganha: number; perde: number } }
  | { tipo: 'chefeHp'; pct: number }
  | { tipo: 'drenoMuralha'; porOnda: number }
  | { tipo: 'desertor' }
  | { tipo: 'duelo' }
  | { tipo: 'ferreiroCego' }
  | { tipo: 'covaAbrir' };

export interface OpcaoEncontro {
  id: string;
  requer?: string[];        // qualquer um destes tipos no time
  custoOuro?: number;
  custoMuralha?: number;
  efeitos: EfeitoEncontro[];
}

export interface Encontro {
  id: string;
  atoMin?: number;          // 1..5 (so nos modos de ato)
  opcoes: OpcaoEncontro[];
}

export const ENCONTROS: Encontro[] = [
  { id: 'desertor', opcoes: [
    { id: 'aceitar', efeitos: [{ tipo: 'desertor' }] },
    { id: 'recusar', efeitos: [] },
    { id: 'interrogar', requer: ['inquisitor'], efeitos: [{ tipo: 'ouro', n: 60 }, { tipo: 'aliado' }] },
  ] },
  { id: 'reliquia', opcoes: [
    { id: 'aceitar', efeitos: [{ tipo: 'dano', pct: 25, alvo: 'todos' }, { tipo: 'drenoMuralha', porOnda: 10 }] },
    { id: 'vender', efeitos: [{ tipo: 'ouro', n: 120 }] },
    { id: 'quebrar', requer: ['cleric', 'priest'], efeitos: [{ tipo: 'dano', pct: 15, alvo: 'todos' }] },
  ] },
  { id: 'padre', opcoes: [
    { id: 'pagar', custoOuro: 80, efeitos: [{ tipo: 'muralha', max: 150 }] },
    { id: 'oferecer', efeitos: [{ tipo: 'removerMaisFraco' }, { tipo: 'muralha', max: 300, curar: true }] },
    { id: 'recusar', efeitos: [] },
  ] },
  { id: 'mercador', opcoes: [
    { id: 'pocao', custoOuro: 50, efeitos: [{ tipo: 'raridade', r: 'rare' }] },
    { id: 'elixir', custoOuro: 120, efeitos: [{ tipo: 'raridade', r: 'legendary' }] },
    { id: 'denunciar', requer: ['inquisitor', 'paladin'], efeitos: [{ tipo: 'ouro', n: 80 }] },
  ] },
  { id: 'crianca', opcoes: [
    { id: 'acolher', efeitos: [{ tipo: 'fortalecerAleatorio', pct: 15 }] },
    { id: 'vila', efeitos: [{ tipo: 'ouro', n: 40 }] },
    { id: 'bola', requer: ['jester'], efeitos: [{ tipo: 'slot' }] },
  ] },
  { id: 'tocha', opcoes: [
    { id: 'reacender', custoOuro: 30, efeitos: [] },
    { id: 'apagada', efeitos: [{ tipo: 'proximaOnda', hpInimigos: 30, ouroDobro: true }] },
    { id: 'escuro', requer: ['zylvara'], efeitos: [{ tipo: 'proximaOnda', hpInimigos: 30, ouroDobro: true }, { tipo: 'dano', pct: 20, alvo: 'zylvara' }] },
  ] },
  { id: 'estranho', opcoes: [
    { id: 'deixar', efeitos: [{ tipo: 'raridade', r: 'legendary' }] },
    { id: 'expulsar', efeitos: [{ tipo: 'ouro', n: 20 }] },
    { id: 'perguntar', requer: ['malachar_human'], efeitos: [{ tipo: 'dano', pct: 15, alvo: 'malachar_human' }] },
  ] },
  { id: 'sino', opcoes: [
    { id: 'consertar', custoOuro: 60, efeitos: [{ tipo: 'curarTodos' }, { tipo: 'dano', pct: 5, alvo: 'todos' }] },
    { id: 'fundir', custoMuralha: 50, efeitos: [{ tipo: 'dano', pct: 15, alvo: 'distancia' }] },
  ] },
  { id: 'cova', opcoes: [
    { id: 'abrir', efeitos: [{ tipo: 'covaAbrir' }] },
    { id: 'respeitar', efeitos: [] },
    { id: 'acordar', requer: ['necromancer', 'morrigan'], efeitos: [{ tipo: 'aliado', personagem: 'necromancer', nivel: 3 }] },
  ] },
  { id: 'duelo', opcoes: [
    { id: 'deixar', efeitos: [{ tipo: 'duelo' }] },
    { id: 'separar', efeitos: [] },
    { id: 'tocar', requer: ['bard'], efeitos: [{ tipo: 'dano', pct: 10, alvo: 'todos' }] },
  ] },
  { id: 'carta', opcoes: [
    { id: 'aceitar', efeitos: [{ tipo: 'proximaOnda', cota: { abates: 15, ganha: 200, perde: 100 } }] },
    { id: 'rasgar', efeitos: [] },
  ] },
  { id: 'ferreiro', opcoes: [
    { id: 'deixar', efeitos: [{ tipo: 'ferreiroCego' }] },
    { id: 'pagar', custoOuro: 100, efeitos: [{ tipo: 'dano', pct: 15, alvo: 'todos' }] },
  ] },
  { id: 'nevoa', opcoes: [
    { id: 'esperar', efeitos: [{ tipo: 'proximaOnda', maisInimigos: 20 }] },
    { id: 'avancar', efeitos: [{ tipo: 'proximaOnda', hpInimigos: -30, velInimigos: 30 }] },
  ] },
  { id: 'cavaleiro', opcoes: [
    { id: 'curar', custoMuralha: 100, efeitos: [{ tipo: 'aliado', personagem: 'paladin', nivel: 4 }] },
    { id: 'confissao', efeitos: [{ tipo: 'raridade', r: 'rare' }, { tipo: 'muralha', hp: 50 }] },
    { id: 'honrar', requer: ['paladin'], efeitos: [{ tipo: 'dano', pct: 20, alvo: 'paladin' }] },
  ] },
  { id: 'espelho', atoMin: 3, opcoes: [
    { id: 'olhar', efeitos: [{ tipo: 'dano', pct: 30, alvo: 'heroi' }, { tipo: 'chefeHp', pct: 25 }] },
    { id: 'cobrir', efeitos: [] },
    { id: 'quebrar', requer: ['ixara', 'dreadlord'], efeitos: [{ tipo: 'dano', pct: 15, alvo: 'heroi' }] },
  ] },
];

export const ENCONTRO_ONDA_MIN = 3;       // primeiro possivel depois de completar esta onda
export const ENCONTRO_CHANCE = 0.25;      // por fim de onda elegivel
export const ENCONTRO_INTERVALO = 3;      // ondas minimas entre dois encontros
