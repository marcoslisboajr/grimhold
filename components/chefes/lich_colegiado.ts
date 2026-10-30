// Lich do Colegiado (Ato V refeito, onda 25): a cada 10 s chama 2 magos do Colegiado (por timer: sem
// recompensa). Nao fala.
import { invocacaoPorTimer } from './invocacao_timer';

export const LICH_CADA = 10000, LICH_N = 2;
export const lichColegiado = invocacaoPorTimer(['mago_colegiado', 'mago_colegiado_b'], LICH_N, LICH_CADA, '✦', '#a78bfa');
