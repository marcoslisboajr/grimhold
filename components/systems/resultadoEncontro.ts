// ══════════════════════════════════════════════════════════════════════
// components/systems/resultadoEncontro.ts
// Monta as linhas da notificacao "o que aconteceu" depois de uma escolha num
// encontro. O GameCanvas registra os EVENTOS reais enquanto aplica os efeitos
// (quem ganhou dano, se sobrou espaco, resultado de sorteios) e esta funcao
// pura traduz evento -> linha { chave i18n, vars, tom }. Sem React, sem t().
// ══════════════════════════════════════════════════════════════════════

import type { OpcaoEncontro } from '../data/encontros';

export type EventoEncontro =
  | { k: 'ouro'; n: number }
  | { k: 'muralhaMax'; n: number }
  | { k: 'muralhaCurada' }
  | { k: 'muralhaHp'; n: number }
  | { k: 'dano'; pct: number; alvo: string }            // 'todos' | 'heroi' | 'distancia' | tipo
  | { k: 'aliado'; tipo: string; nivel: number }
  | { k: 'semEspaco'; n: number }                       // aliado/vaga virou ouro
  | { k: 'removido'; tipo: string }
  | { k: 'fortalecido'; tipo: string; pct: number }
  | { k: 'curarTodos' }
  | { k: 'slot' }
  | { k: 'raridade'; r: 'rare' | 'legendary' }
  | { k: 'ondaHp'; pct: number }
  | { k: 'ondaVel'; pct: number }
  | { k: 'ondaMais'; pct: number }
  | { k: 'ondaOuroDobro' }
  | { k: 'ondaElite' }
  | { k: 'cota'; abates: number; ganha: number; perde: number }
  | { k: 'chefeHp'; pct: number }
  | { k: 'dreno'; n: number }
  | { k: 'desertor'; tipo: string }
  | { k: 'duelo'; ferido: string; forte: string }
  | { k: 'dueloSemPar'; tipo: string }
  | { k: 'ferreiro'; bom: string; ruim?: string }
  | { k: 'covaOuro'; n: number }
  | { k: 'covaVazia' };

export type TomLinha = 'ouro' | 'bom' | 'ruim' | 'neutro';
export interface LinhaResultado { chave: string; vars?: Record<string, string | number>; tom: TomLinha; }

const P = 'ui.encontro.res.';

export function linhasResultadoEncontro(op: Pick<OpcaoEncontro, 'custoOuro' | 'custoMuralha'>, eventos: EventoEncontro[],
  nome: (tipo: string) => string): LinhaResultado[] {
  const L: LinhaResultado[] = [];
  if (op.custoOuro) L.push({ chave: P + 'custoOuro', vars: { n: op.custoOuro }, tom: 'ruim' });
  if (op.custoMuralha) L.push({ chave: P + 'custoMuralha', vars: { n: op.custoMuralha }, tom: 'ruim' });
  for (const e of eventos) {
    switch (e.k) {
      case 'ouro': L.push(e.n >= 0 ? { chave: P + 'ouro', vars: { n: e.n }, tom: 'ouro' } : { chave: P + 'perdeOuro', vars: { n: -e.n }, tom: 'ruim' }); break;
      case 'muralhaMax': L.push({ chave: P + 'muralhaMax', vars: { n: e.n }, tom: 'bom' }); break;
      case 'muralhaCurada': L.push({ chave: P + 'muralhaCurada', tom: 'bom' }); break;
      case 'muralhaHp': L.push({ chave: P + 'muralhaHp', vars: { n: e.n }, tom: 'bom' }); break;
      case 'dano': {
        const tom: TomLinha = e.pct >= 0 ? 'bom' : 'ruim';
        if (e.alvo === 'todos' || e.alvo === 'heroi' || e.alvo === 'distancia') L.push({ chave: P + 'dano.' + e.alvo, vars: { n: e.pct }, tom });
        else L.push({ chave: P + 'dano.nome', vars: { n: e.pct, nome: nome(e.alvo) }, tom });
        break;
      }
      case 'aliado': L.push({ chave: P + 'aliado', vars: { nome: nome(e.tipo), n: e.nivel }, tom: 'bom' }); break;
      case 'semEspaco': L.push({ chave: P + 'semEspaco', vars: { n: e.n }, tom: 'ouro' }); break;
      case 'removido': L.push({ chave: P + 'removido', vars: { nome: nome(e.tipo) }, tom: 'ruim' }); break;
      case 'fortalecido': L.push({ chave: P + 'fortalecido', vars: { nome: nome(e.tipo), n: e.pct }, tom: 'bom' }); break;
      case 'curarTodos': L.push({ chave: P + 'curarTodos', tom: 'bom' }); break;
      case 'slot': L.push({ chave: P + 'slot', tom: 'bom' }); break;
      case 'raridade': L.push({ chave: P + (e.r === 'legendary' ? 'lendaria' : 'rara'), tom: 'ouro' }); break;
      case 'ondaHp': L.push({ chave: P + (e.pct >= 0 ? 'ondaHpMais' : 'ondaHpMenos'), vars: { n: Math.abs(e.pct) }, tom: e.pct >= 0 ? 'ruim' : 'bom' }); break;
      case 'ondaVel': L.push({ chave: P + 'ondaVel', vars: { n: e.pct }, tom: 'ruim' }); break;
      case 'ondaMais': L.push({ chave: P + 'ondaMais', vars: { n: e.pct }, tom: 'ruim' }); break;
      case 'ondaOuroDobro': L.push({ chave: P + 'ondaOuroDobro', tom: 'ouro' }); break;
      case 'ondaElite': L.push({ chave: P + 'ondaElite', tom: 'ruim' }); break;
      case 'cota': L.push({ chave: P + 'cota', vars: { n: e.abates, ganha: e.ganha, perde: e.perde }, tom: 'neutro' }); break;
      case 'chefeHp': L.push({ chave: P + 'chefeHp', vars: { n: e.pct }, tom: 'ruim' }); break;
      case 'dreno': L.push({ chave: P + 'dreno', vars: { n: e.n }, tom: 'ruim' }); break;
      case 'desertor': L.push({ chave: P + 'desertor', vars: { nome: nome(e.tipo) }, tom: 'bom' }); break;
      case 'duelo':
        L.push({ chave: P + 'dueloFerido', vars: { nome: nome(e.ferido) }, tom: 'ruim' });
        L.push({ chave: P + 'dano.nome', vars: { n: 25, nome: nome(e.forte) }, tom: 'bom' });
        break;
      case 'dueloSemPar': L.push({ chave: P + 'dueloSemPar', vars: { nome: nome(e.tipo) }, tom: 'bom' }); break;
      case 'ferreiro':
        L.push({ chave: P + 'ferreiroBom', vars: { nome: nome(e.bom) }, tom: 'bom' });
        if (e.ruim) L.push({ chave: P + 'ferreiroRuim', vars: { nome: nome(e.ruim) }, tom: 'ruim' });
        break;
      case 'covaOuro': L.push({ chave: P + 'covaOuro', vars: { n: e.n }, tom: 'ouro' }); break;
      case 'covaVazia': L.push({ chave: P + 'covaVazia', tom: 'ruim' }); break;
    }
  }
  if (!L.length) L.push({ chave: P + 'nada', tom: 'neutro' });
  return L;
}
