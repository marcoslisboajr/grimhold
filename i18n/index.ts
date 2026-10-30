// ══════════════════════════════════════════════════════════════════════
// i18n/index.ts — núcleo de internacionalização do Grimhold
//
// Regras (ver plano/I18N_PLANO.md):
//   • Inglês é a FONTE DA VERDADE e o fallback. Nada muda pra quem joga
//     em inglês.
//   • Chave sem tradução (ausente OU string vazia) cai automaticamente
//     no inglês — dá pra traduzir aos poucos sem quebrar o jogo.
//   • As chaves do JSON são PLANAS ('bestiary.goblin.name'), por isso
//     keySeparator/nsSeparator ficam desligados.
//   • Troca de idioma em tempo real: os arquivos de dados resolvem t()
//     em getters, não no load do módulo.
// ══════════════════════════════════════════════════════════════════════

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import { getSteamLanguage } from '../components/systems/steam';

import en from './locales/en.json';
import ptBR from './locales/pt-BR.json';
import zhCN from './locales/zh-CN.json';

// ─── Idiomas suportados ───────────────────────────────────────────────
export const LANGUAGES = [
  { code: 'en',    label: 'English',              native: 'English'   },
  { code: 'pt-BR', label: 'Portuguese (Brazil)',  native: 'Português' },
  { code: 'zh-CN', label: 'Chinese (Simplified)', native: '简体中文'   },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

const CODES = LANGUAGES.map(l => l.code) as readonly string[];

/** Chave do localStorage — segue o padrão de save do jogo (Steam Cloud). */
const STORAGE_KEY = 'grimhold.lang';

// ─── Normalização de códigos ──────────────────────────────────────────
// Aceita o que vier (navegador, Steam, save antigo) e devolve um código
// suportado, ou null se não der pra mapear.
export function normalizeLanguage(raw: string | null | undefined): LanguageCode | null {
  if (!raw) return null;
  const v = String(raw).trim().toLowerCase();
  if (!v) return null;

  // Nomes da Steam (GetCurrentGameLanguage devolve 'brazilian', 'schinese'...)
  const steamMap: Record<string, LanguageCode> = {
    english:    'en',
    brazilian:  'pt-BR',
    portuguese: 'pt-BR',   // pt-PT ainda não existe; cai no pt-BR
    schinese:   'zh-CN',
  };
  if (steamMap[v]) return steamMap[v];

  // Códigos BCP-47: 'pt-br', 'pt', 'zh-Hans-CN', 'zh', 'en-US'...
  if (v === 'en' || v.startsWith('en-')) return 'en';
  if (v === 'pt' || v.startsWith('pt-')) return 'pt-BR';
  if (v === 'zh' || v.startsWith('zh-')) {
    // Só chinês simplificado é suportado; tradicional cai no inglês.
    if (v.includes('hant') || v.includes('-tw') || v.includes('-hk') || v.includes('-mo')) return null;
    return 'zh-CN';
  }
  return CODES.includes(v) ? (v as LanguageCode) : null;
}

// ─── Preferência salva ────────────────────────────────────────────────
/** Idioma escolhido explicitamente pelo jogador (null = nunca escolheu). */
export function getSavedLanguage(): LanguageCode | null {
  try {
    return normalizeLanguage(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null; // localStorage bloqueado — segue sem persistir
  }
}

function saveLanguage(code: LanguageCode): void {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* ignore */
  }
}

/** Idioma inicial SÍNCRONO: escolha salva → navegador → inglês.
 *  (A Steam é assíncrona e entra depois, em detectSteamLanguage.) */
function initialLanguage(): LanguageCode {
  return (
    getSavedLanguage() ??
    (typeof navigator !== 'undefined'
      ? normalizeLanguage(navigator.language) ??
        normalizeLanguage(navigator.languages?.[0])
      : null) ??
    DEFAULT_LANGUAGE
  );
}

// ─── Init ─────────────────────────────────────────────────────────────
// Sem backend HTTP: os JSONs vão no bundle e o init é síncrono, então
// t() já funciona logo depois deste import.
i18next.use(initReactI18next).init({
  resources: {
    'en':    { translation: en },
    'pt-BR': { translation: ptBR },
    'zh-CN': { translation: zhCN },
  },
  lng: initialLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: CODES as string[],
  load: 'currentOnly',        // não degrada 'pt-BR' pra 'pt' (que não existe)
  keySeparator: false,        // chaves PLANAS: 'bestiary.goblin.name'
  nsSeparator: false,         // ':' pode aparecer no texto
  returnEmptyString: false,   // valor "" = não traduzido → cai no inglês
  interpolation: { escapeValue: false }, // React já escapa
  react: { useSuspense: false },
});

export { i18next };

// ─── API de tradução ──────────────────────────────────────────────────
const EN_KEYS = en as Record<string, string>;

/**
 * Traduz uma chave. Resolve no MOMENTO DA CHAMADA — use dentro de
 * getters/render, nunca guarde o resultado em constante de módulo.
 *
 * Segundo argumento aceita duas coisas:
 *   • string  → texto de emergência se a chave não existir nem no inglês;
 *   • objeto  → valores de interpolação, para chave com {{placeholder}}.
 *     Ex.: t('ui.runHistory.noFiltered', { filter: 'victory' })
 *          com "No {{filter}} runs" no en.json.
 */
export function t(key: string, fallbackOrVars?: string | Record<string, unknown>): string {
  const padrao = EN_KEYS[key] ?? key;
  const opts = typeof fallbackOrVars === 'string'
    ? { defaultValue: fallbackOrVars }
    : { ...(fallbackOrVars ?? {}), defaultValue: padrao };
  const value = i18next.t(key, opts);
  return typeof value === 'string' ? value : String(value);
}

/**
 * Traduz uma lista indexada ('x.ability.0', 'x.ability.1', ...).
 * O tamanho vem do en.json (fonte da verdade), então uma tradução
 * incompleta nunca encurta a lista — os itens que faltam saem em inglês.
 */
export function tList(baseKey: string): string[] {
  const out: string[] = [];
  for (let i = 0; ; i++) {
    const key = `${baseKey}.${i}`;
    if (!(key in EN_KEYS)) break;
    out.push(t(key));
  }
  return out;
}

/** true se a chave existe no en.json (útil em scripts de verificação). */
export function hasKey(key: string): boolean {
  return key in EN_KEYS;
}

// ─── Troca de idioma ──────────────────────────────────────────────────
export function getLanguage(): LanguageCode {
  return (normalizeLanguage(i18next.resolvedLanguage ?? i18next.language) ?? DEFAULT_LANGUAGE);
}

/** Troca o idioma e persiste a escolha (vira preferência explícita). */
export function setLanguage(code: LanguageCode): void {
  if (!CODES.includes(code)) return;
  saveLanguage(code);
  void i18next.changeLanguage(code);
}

/** Assina mudanças de idioma. Devolve a função de cancelamento. */
export function onLanguageChange(handler: (code: LanguageCode) => void): () => void {
  const wrapped = (lng: string) => handler(normalizeLanguage(lng) ?? DEFAULT_LANGUAGE);
  i18next.on('languageChanged', wrapped);
  return () => i18next.off('languageChanged', wrapped);
}

// ─── Detecção via Steam (assíncrona) ──────────────────────────────────
/**
 * Se o jogador NUNCA escolheu idioma na mão, adota o idioma configurado
 * pra este jogo na Steam. Roda depois do init porque a ponte IPC é async.
 * Fora do Electron/Steam é no-op silencioso.
 */
export async function detectSteamLanguage(): Promise<void> {
  if (getSavedLanguage()) return; // escolha do jogador manda
  try {
    const code = normalizeLanguage(await getSteamLanguage());
    if (code && code !== getLanguage()) {
      await i18next.changeLanguage(code); // NÃO salva: não foi escolha explícita
    }
  } catch {
    /* ignore — jogo segue no idioma detectado pelo navegador */
  }
}
