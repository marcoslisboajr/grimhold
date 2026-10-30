// Heroi Corrompido (Etapa 3b; docs/HEROI_CORROMPIDO.md). Quem vence o Ato X (Coracao morto) fica na
// porta: na run seguinte o chefe final do X (onda 31) e esse heroi, corrompido, com os numeros do Malachar
// da ficha (o x1,5 de chefe final ja vem da ultima onda). Regras:
//  1. vitoria no X com o heroi inicial X -> grava grimhold_corrompido = X (storage poe o prefixo demo_)
//  2. proxima run no X: onda 31 = corrupted_X (em vez do Malachar)
//  3. vencer o corrompido X com Y: Y passa a ser o corrompido; se Y == X, X "resistiu" -> apaga (Malachar)
//  4. primeira vitoria de todas: Malachar (chave ausente)
//  5. heroi sem habilidade pronta: chefe generico com o sprite dele
// Habilidades (lote 1, decisao do Marcos): Krash (mage), Clerigo (cleric), Paladino, Arqueira, Jester,
// Yue. A mesma funcao serve ao chefe da onda 31 e a Fome a cada 20 s (fome.ts).
import type { Enemy, Ally } from '../../types';
import type { CtxChefe, ModuloChefe } from './tipos';
import { centro, instalarReducao } from './util';
import { registrarChefe } from './index';
import { HEROIS_CORROMPIVEIS } from './lista';

export const CHAVE_CORROMPIDO = 'grimhold_corrompido';
interface Guarda { get(k: string): string | null; set(k: string, v: string): void; remove(k: string): void }

export function lerCorrompido(s: Guarda): string | undefined {
  const v = s.get(CHAVE_CORROMPIDO);
  return v && (HEROIS_CORROMPIVEIS as readonly string[]).includes(v) ? v : undefined;
}
// Regras 1 e 3: chamado no fim da campanha do X. derrotado = o corrompido desta run (ou undefined)
export function gravarVitoria(s: Guarda, vencedor: string, derrotado: string | undefined): 'gravou' | 'resistiu' {
  if (derrotado && derrotado === vencedor) { s.remove(CHAVE_CORROMPIDO); return 'resistiu'; }
  s.set(CHAVE_CORROMPIDO, vencedor);
  return 'gravou';
}
// Regra 2/4/5: tipo do chefe final do X (onda 31; undefined = Malachar). Nome antigo, de quando era a 30
export function chefeDaOnda30(corrompido: string | undefined): string | undefined {
  return corrompido && (HEROIS_CORROMPIVEIS as readonly string[]).includes(corrompido) ? `corrupted_${corrompido}` : undefined;
}
export const heroiDoChefe = (tipo: string): string | undefined => tipo.startsWith('corrupted_') ? tipo.slice('corrupted_'.length) : undefined;

// ── Egide Negra: escudo que absorve os N proximos acertos (conta acertos pela reducao, nunca cura depois) ──
export const EGIDE_ACERTOS = 3;
export function consumirEgide(e: Enemy): number {
  const x = e as any;
  if ((x._egide ?? 0) > 0) { x._egide--; return 0; }
  return 1;
}

export interface HabilidadeCorrompida { cada: number; usar: (ctx: CtxChefe, fonte: Enemy) => void }
const vivos = (ctx: CtxChefe) => ctx.aliados.filter(a => a.hp > 0);
const sorteia = <T,>(l: T[]) => l[Math.floor(Math.random() * l.length)];
const efeitoEm = (ctx: CtxChefe, a: Ally, txt: string, cor: string) => { const p = ctx.posAliado(a); ctx.efeito(p.x, p.y - 30, txt, cor, 40); };
export const DANO = { SOBRECARGA: 0.12, FLECHA: 0.06, CARTA: 0.10 } as const;
export const GRACA_CURA = 0.30, ENCANTO_MS = 3000, CARTA_ATORDOA = 1000, FLECHAS = 5;

export const HABILIDADES_CORROMPIDAS: Record<string, HabilidadeCorrompida> = {
  // Krash — Sobrecarga Invertida: explosao arcana numa fileira de herois
  mage: { cada: 6000, usar(ctx) {
    const row = Math.floor(Math.random() * ctx.grade.rows);
    for (const a of vivos(ctx)) if (a.gridPosition.row === row) { ctx.ferirAliado(a, a.maxHp * DANO.SOBRECARGA, '#a855f7'); efeitoEm(ctx, a, '✸', '#a855f7'); }
  } },
  // Clerigo — Graca Profana: cura os outros inimigos em campo (30% da vida); nunca a si nem a Fome
  cleric: { cada: 10000, usar(ctx, fonte) {
    for (const e of ctx.inimigos) {
      const t = e.type as string;
      if (e === fonte || e.hp <= 0 || t.startsWith('fome_') || t.startsWith('corrupted_')) continue;
      e.hp = Math.min(e.maxHp, e.hp + e.maxHp * GRACA_CURA);
    }
    const c = centro(fonte); ctx.efeito(c.x, c.y - fonte.height / 2 - 10, '✚', '#a855f7', 40);
  } },
  // Paladino — Egide Negra: absorve os 3 proximos acertos
  paladin: { cada: 8000, usar(ctx, fonte) {
    instalarReducao(fonte, consumirEgide);   // sem efeito se ja houver reducao (Pontos: fome.ts consulta a egide)
    (fonte as any)._egide = EGIDE_ACERTOS;
    const c = centro(fonte); ctx.efeito(c.x, c.y - fonte.height / 2 - 10, '⛨', '#7c3aed', 40);
  } },
  // Arqueira — Chuva de Flechas: 5 flechas em herois aleatorios
  archer: { cada: 7000, usar(ctx) {
    for (let k = 0; k < FLECHAS; k++) { const vs = vivos(ctx); if (!vs.length) return; const a = sorteia(vs); ctx.ferirAliado(a, a.maxHp * DANO.FLECHA, '#a855f7'); efeitoEm(ctx, a, '➶', '#c084fc'); }
  } },
  // Jester — Carta Marcada: um heroi toma 10% da vida e fica atordoado 1 s
  jester: { cada: 7000, usar(ctx) {
    const vs = vivos(ctx); if (!vs.length) return;
    const a = sorteia(vs);
    ctx.ferirAliado(a, a.maxHp * DANO.CARTA, '#a855f7');
    ctx.atordoarAliado(a, ctx.agora + CARTA_ATORDOA);
    efeitoEm(ctx, a, '🃏', '#e879f9');
  } },
  // Yue — Encanto Sombrio: encanta 1 heroi por 3 s (para de atacar)
  yue: { cada: 9000, usar(ctx) {
    const vs = vivos(ctx); if (!vs.length) return;
    const a = sorteia(vs);
    ctx.atordoarAliado(a, ctx.agora + ENCANTO_MS);
    efeitoEm(ctx, a, '♥', '#f0abfc');
  } },
};

// Chefe corrompido na ultima onda: depois de chegar ao campo, usa a habilidade a cada 'cada' ms
export function moduloCorrompido(heroi: string): ModuloChefe {
  const h = HABILIDADES_CORROMPIDAS[heroi];
  if (!h) return {};   // regra 5: generico
  return {
    aCadaQuadro(ctx, chefe, dt) {
      const x = chefe as any;
      if (chefe.hp <= 0 || chefe.position.x >= ctx.chegadaX) return;
      x._habT = (x._habT ?? 0) + dt;
      if (x._habT < h.cada) return;
      x._habT -= h.cada;
      h.usar(ctx, chefe);
    },
  };
}
for (const heroi of HEROIS_CORROMPIVEIS) registrarChefe(`corrupted_${heroi}`, moduloCorrompido(heroi));
