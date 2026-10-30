// ══════════════════════════════════════════════════════════════════════
// i18n/useLanguage.ts — ponte React do i18n.
//
// Serve pra dois casos:
//   1) componentes que precisam do idioma atual / do seletor;
//   2) forçar re-render da árvore quando o idioma muda, pra que os
//      getters dos arquivos de dados sejam lidos de novo (troca em
//      tempo real, sem recarregar o jogo).
// ══════════════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import {
  LANGUAGES,
  type LanguageCode,
  getLanguage,
  setLanguage,
  onLanguageChange,
} from './index';

export interface UseLanguage {
  /** Idioma ativo agora. */
  lang: LanguageCode;
  /** Troca e persiste a escolha do jogador. */
  setLang: (code: LanguageCode) => void;
  /** Lista pra montar seletores. */
  languages: typeof LANGUAGES;
}

export function useLanguage(): UseLanguage {
  const [lang, setLang] = useState<LanguageCode>(getLanguage);

  useEffect(() => onLanguageChange(setLang), []);

  return { lang, setLang: setLanguage, languages: LANGUAGES };
}
