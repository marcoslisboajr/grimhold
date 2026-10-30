// ══════════════════════════════════════════════════════════════════════
// components/systems/build.ts
// Qual build é este. Fonte única — nada de ler import.meta.env espalhado.
//
// Full  : npm run build          (padrão)
// Demo  : npm run build:demo     (--mode demo, lê o .env.demo)
//
// A demo do Steam é um APP SEPARADO, com App ID próprio — não é uma flag
// dentro do app cheio. Por isso o corte é feito no build, não em runtime:
// o jogador da demo não deve nem ter os Atos II–V no bundle de save.
// ══════════════════════════════════════════════════════════════════════

// O i18n-verify empacota os arquivos de dados e roda em NODE, onde
// `import.meta.env` não existe — ler direto derruba a verificação inteira.
// Por isso o acesso é defensivo: fora do Vite, vale o padrão (jogo completo).
const env: Record<string, string | undefined> =
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};

/** true so no `vite` (servidor de desenvolvimento); false em qualquer build (producao e demo) e nos testes. */
export const IS_DEV = String(env.DEV) === 'true';

/** true no build da demo do Steam Next Fest. */
export const IS_DEMO = env.VITE_GRIMHOLD_DEMO === '1';

/**
 * Prefixo das chaves de save. A demo grava em espaço próprio para que:
 *   1. quem já joga a 0.7 não tenha o save mexido ao abrir a demo;
 *   2. o progresso da demo NÃO migre para o jogo completo (decisão do
 *      Marcos — o jogador recomeça).
 * Mexer nisto invalida todos os saves de demo existentes.
 */
export const SAVE_PREFIX = IS_DEMO ? 'demo_' : '';

/**
 * Herois liberados na demo (alem dos 3 gratuitos do jogo cheio: mage, archer, paladin).
 * Yue = controle na vanguarda e o heroi novo; Hyo = suporte, pra composicao fechar.
 * O save da demo nao migra, entao dar herois raros aqui nao vaza pro jogo cheio.
 */
export const DEMO_HEROIS_EXTRA = ['yue', 'priest'] as const;

/**
 * Modos liberados na demo. O corte é "Ato I completo": o jogador joga as
 * 30 ondas e vê a tela de vitória do ato.
 *
 * Infinito/Pacifista/Cursed/Randomizador ficam de fora porque eles PULAM
 * a seleção de ato (ver startGameWithCharacter) — deixá-los abertos
 * daria acesso a conteúdo sem limite e furaria o corte.
 */
export const DEMO_MODES = ['standard', 'act2', 'tutorial'] as const;   // Ato II entrou na demo em 20/09 (exige vencer o Ato I, como no jogo cheio)

export const modoLiberado = (mode: string): boolean =>
  !IS_DEMO || (DEMO_MODES as readonly string[]).includes(mode);

/**
 * Dificuldades liberadas na demo.
 *
 * Dificil e Infernal sao recompensa de quem comprou o jogo. A Infernal ainda
 * carrega a promessa "vença o jogo primeiro" — que na demo viraria mentira,
 * porque o gatilho de destravar (setInfernalUnlocked) dispara na vitoria de
 * QUALQUER ato, e o Ato I a demo joga inteiro.
 */
export const DEMO_DIFICULDADES = ['easy', 'normal'] as const;

export const dificuldadeLiberada = (diff: string): boolean =>
  !IS_DEMO || (DEMO_DIFICULDADES as readonly string[]).includes(diff);
