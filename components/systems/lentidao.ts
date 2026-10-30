// Lentidoes que antes escreviam enemy.speed = max(piso, _baseSpd * fator) e nunca voltavam.
// Agora nada escreve speed: cada lentidao fica registrada (campo de validade + fator + piso) e o passo do
// inimigo aplica a mais forte ativa. Assim uivos/buffs que mexem em speed nao brigam com um _baseSpd velho,
// e inimigo parado (speed 0: tentaculos, totens) continua parado.
//
// Campos de validade (um so lugar): quem cria lentidao nova com campo proprio acrescenta aqui.
export const CAMPOS_LENTIDAO = ['_slowUntil', '_sk_tundraSlowUntil', '_cm_wlock1_slow', '_cm_rune4_slow', '_cursedUntil'] as const;
export type CampoLentidao = typeof CAMPOS_LENTIDAO[number];

type Registro = { campo: CampoLentidao; fator: number; piso: number };

/** Registra a lentidao; a validade e o proprio campo (ex.: e._slowUntil), que quem chama ja preencheu. */
export function marcarLento(e: object, campo: CampoLentidao, fator: number, piso: number): void {
  const x = e as any;
  const lista: Registro[] = x._lentos ?? (x._lentos = []);
  const i = lista.findIndex(r => r.campo === campo);
  const r = { campo, fator, piso };
  if (i >= 0) lista[i] = r; else lista.push(r);
}

/** Maior validade entre os campos de lentidao (0 se nenhum). */
export function lentidaoAte(e: object): number {
  const x = e as any;
  let ate = 0;
  for (const c of CAMPOS_LENTIDAO) ate = Math.max(ate, x[c] ?? 0);
  return ate;
}

/** Velocidade efetiva com a lentidao mais forte ativa. Sem lentidao ativa (ou speed <= 0) devolve speed. */
export function velocidadeComLentidao(e: object, speed: number, agora: number): number {
  const x = e as any;
  const lista: Registro[] | undefined = x._lentos;
  if (!lista || lista.length === 0 || speed <= 0) return speed;
  let v = speed, ativa = false;
  for (let i = lista.length - 1; i >= 0; i--) {
    const r = lista[i];
    if ((x[r.campo] ?? 0) > agora) { ativa = true; v = Math.min(v, Math.max(Math.min(r.piso, speed), speed * r.fator)); }
    else lista.splice(i, 1);
  }
  return ativa ? v : speed;
}
