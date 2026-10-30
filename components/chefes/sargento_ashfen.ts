// Sargento de Ashfen (Ato V refeito, onda 5): a cada 12 s chama 3 soldados de Ashfen (por timer: sem
// recompensa). Nao fala.
import { invocacaoPorTimer } from './invocacao_timer';

export const SARGENTO_CADA = 12000, SARGENTO_N = 3;
export const sargentoAshfen = invocacaoPorTimer(['soldado_ashfen'], SARGENTO_N, SARGENTO_CADA, '⚔', '#d6d3d1');
