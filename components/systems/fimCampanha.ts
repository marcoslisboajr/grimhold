// Fim de campanha (ato final): um lugar so para os dois caminhos do GameCanvas (fim da ultima onda do ato e morte
// do chefe final). Puro: o GameCanvas passa as funcoes do jogo (deps) e os testes passam espioes.
// Sem lutaFinal (V legado): exatamente as chamadas de antes da Etapa 3b. Com lutaFinal (X): as
// conquistas de final tambem saem aqui (so com a Fome morta) e o Heroi Corrompido e gravado.
import type { Ato } from '../data/atos';

export interface DepsFimCampanha {
  gravar: (chave: string, valor: string) => void;            // storage.set
  desbloquearMalachar: () => void;                           // perfil + tipos + titulos
  conquista: (id: string, atraso?: number) => void;          // unlockAchievement (atraso em ms)
  toastMalachar: () => void;                                 // toast "Malachar (Redeemed)" por 6 s
  epilogo: () => void;                                       // pendingAct5Victory + GAME_OVER + tela de epilogos
  aoFecharLutaFinal?: () => void;                            // X: grava o Heroi Corrompido (T4)
}

export function fecharCampanha(ato: Pick<Ato, 'lutaFinal' | 'conquista'>, comEpilogo: boolean, d: DepsFimCampanha) {
  try { d.gravar('grimhold_malachar_unlocked', 'true'); } catch { /* storage cheio/bloqueado */ }
  d.desbloquearMalachar();
  if (comEpilogo) d.conquista('conquest_malachar_human', 100);
  d.toastMalachar();
  if (ato.lutaFinal) {
    if (ato.conquista) d.conquista(ato.conquista);
    d.conquista('secret_true_ending');
    d.conquista('all_acts_complete');
    d.aoFecharLutaFinal?.();
  }
  if (comEpilogo) d.epilogo();
}
