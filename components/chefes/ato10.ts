// Registro dos modulos do Ato X. Os chefes (legados do V antigo) mantem as habilidades que ja tem no
// GameCanvas; modulos novos: o tentaculo (3a) e, na luta final (3b), os Pontos Fracos e o Coracao da
// Fome (as regras da luta vivem em fome.ts). O GameCanvas importa este arquivo uma vez.
import type { Enemy } from '../../types';
import type { CtxChefe, ModuloChefe } from './tipos';
import { registrarChefe, MODULOS_CHEFE } from './index';
import { tentaculo, TENTACULOS } from './tentaculo';
import { coracaoMorreu } from './fome';
import { HEROIS_CORROMPIVEIS } from './lista';
import './corrompido';   // registra os corrompidos antes de embrulhar com a escolta
import { centro, invocar, semRecompensa } from './util';
import { INVOCADOS_MAX, invocadosVivos } from './invocacao_timer';

for (const t of TENTACULOS) registrarChefe(t, tentaculo);
registrarChefe('fome_coracao', { aoMorrer: (ctx) => coracaoMorreu(ctx) });

// ── Chefe final do X (onda 31: Malachar ou o Heroi Corrompido): o exercito da Fome ──────────
// O GameCanvas chama prepararChefeFinal so no chefe principal da ultima onda de um ato com luta final
// (so o X). Ele marca _escoltaFome; a escolta abaixo so age com a marca, entao o Malachar do V
// legado (mesmo tipo, sem marca) nao muda. So o Malachar cresce; o corrompido fica do tamanho dele.
export const ESCALA_MALACHAR = 1.6;
// A 31 so tem o chefe (sem mobs comuns): escolta maior e reforco mais frequente que na antiga 30 (5 / 12 s)
export const ESCOLTA_INICIAL = 8;
export const REFORCO_N = 3, REFORCO_CADA = 10000;
export const DEMONIOS_ESCOLTA = ['lesser_demon', 'lesser_demon', 'void_stalker', 'demon_eyes', 'lord_demon'] as const;

export function prepararChefeFinal(chefe: Enemy) {
  const x = chefe as any;
  if (x._escoltaFome) return;
  x._escoltaFome = true;
  if ((chefe.type as string) !== 'malachar') return;
  // cresce mantendo o centro: o sprite e a hitbox saem de width/height (os dois crescem juntos)
  const w = chefe.width * ESCALA_MALACHAR, h = chefe.height * ESCALA_MALACHAR;
  chefe.position = { x: chefe.position.x - (w - chefe.width) / 2, y: chefe.position.y - (h - chefe.height) / 2 };
  chefe.width = w; chefe.height = h;
}

// Invocacao propria do Malachar (GameCanvas, 2 lesser_demon a cada 15 s): marcado (Ato X) entra no
// mesmo teto e nao paga nada; sem marca (V legado) segue igual (n e nenhuma marca)
export const vagasMalachar = (chefe: Enemy, inimigos: Enemy[], n: number): number =>
  (chefe as any)._escoltaFome ? Math.max(0, Math.min(n, INVOCADOS_MAX - invocadosVivos(inimigos, chefe))) : n;
export function marcarInvocadoMalachar(chefe: Enemy, e: Enemy) {
  if (!(chefe as any)._escoltaFome) return;
  semRecompensa(e); (e as any)._invocadoPor = chefe;
}

// Base da escala dos demonios: o corrompido tem os numeros do Malachar da ficha (invocar escala pela
// linha da ficha do tipo do chefe, e corrupted_* nao tem linha)
const base = (chefe: Enemy): Enemy => (chefe.type as string) === 'malachar' ? chefe
  : { type: 'malachar', maxHp: chefe.maxHp, damage: chefe.damage, speed: chefe.speed, color: chefe.color, enemyLevel: (chefe as any).enemyLevel } as any;
function chamar(ctx: CtxChefe, chefe: Enemy, n: number, x: number, dys: number[]): number {
  const vagas = Math.min(n, INVOCADOS_MAX - invocadosVivos(ctx.inimigos, chefe));
  const c = centro(chefe), b = base(chefe);
  for (let k = 0; k < vagas; k++) {
    const tipo = DEMONIOS_ESCOLTA[Math.floor(Math.random() * DEMONIOS_ESCOLTA.length)];
    const e = semRecompensa(invocar(ctx, b, tipo, x, c.y + dys[k % dys.length]));
    (e as any)._invocadoPor = chefe;
    ctx.adicionarInimigo(e);
  }
  return Math.max(0, vagas);
}
const DY_ESCOLTA = [-175, 175, -125, 125, -75, 75, -25, 25];
export const escoltaDaFome: Required<Pick<ModuloChefe, 'aoNascer' | 'aCadaQuadro'>> = {
  aoNascer(ctx, chefe) {
    const x = chefe as any;
    if (!x._escoltaFome || x._escoltaFeita) return;
    x._escoltaFeita = true;
    const c = centro(chefe);
    chamar(ctx, chefe, ESCOLTA_INICIAL, c.x - chefe.width / 2 - 40, DY_ESCOLTA);   // em volta, um pouco a frente
  },
  aCadaQuadro(ctx, chefe, dt) {
    const x = chefe as any;
    if (!x._escoltaFome || chefe.hp <= 0 || chefe.position.x >= ctx.chegadaX) return;
    x._reforcoT = (x._reforcoT ?? 0) + dt;
    if (x._reforcoT < REFORCO_CADA) return;
    x._reforcoT -= REFORCO_CADA;
    const c = centro(chefe);
    // atras dele (a direita): parado na muralha, a frente seria do outro lado dela
    if (chamar(ctx, chefe, REFORCO_N, c.x + chefe.width / 2 + 40, [-110, 110, 0]) > 0) ctx.efeito(c.x, c.y - chefe.height / 2 - 10, '⛧', '#dc2626', 40);
  },
};
// Junta a escolta a um modulo que ja existe (os corrompidos tem habilidade propria)
export function comEscolta(m: ModuloChefe | undefined): ModuloChefe {
  return {
    ...m,
    aoNascer(ctx, e) { m?.aoNascer?.(ctx, e); escoltaDaFome.aoNascer(ctx, e); },
    aCadaQuadro(ctx, e, dt) { m?.aCadaQuadro?.(ctx, e, dt); escoltaDaFome.aCadaQuadro(ctx, e, dt); },
  };
}
registrarChefe('malachar', comEscolta(MODULOS_CHEFE['malachar']));
for (const h of HEROIS_CORROMPIVEIS) registrarChefe(`corrupted_${h}`, comEscolta(MODULOS_CHEFE[`corrupted_${h}`]));
