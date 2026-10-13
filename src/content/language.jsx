import { createContext, useContext, useEffect, useState } from 'react';
import { text } from './text.js';

const STORAGE_KEY = 'ghg-checker:language';
export const LANGUAGES = ['en', 'cy'];

// Use ?lang=cy from the link if there is one, otherwise the language chosen earlier in this session
function loadLanguage() {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('lang');
    if (LANGUAGES.includes(fromUrl)) return fromUrl;
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    return LANGUAGES.includes(stored) ? stored : 'en';
  } catch (e) {
    return 'en';
  }
}

function saveLanguage(lang) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, lang);
  } catch (e) {
    // Storage unavailable - language resets to English next visit
  }
}

// Look up 'heating.question' in the text for a language, falling back to English
function lookup(lang, path) {
  const find = (source) => path.split('.').reduce((node, key) => node?.[key], source);
  return find(text[lang]) ?? find(text.en) ?? path;
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(loadLanguage);

  // Screen readers use the page language to pick the right pronunciation
  useEffect(() => {
    document.documentElement.lang = lang;
    saveLanguage(lang);
  }, [lang]);

  // t('result.supportPercentage', { percentage: 75 }) fills in {percentage}
  const t = (path, values = {}) =>
    lookup(lang, path).replace(/\{(\w+)\}/g, (match, name) => (name in values ? values[name] : match));

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
