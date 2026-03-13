import { ru, Locale } from '../locales/ru';
import { en } from '../locales/en';

const locales: Record<string, Locale> = { ru, en };

export function getLang(): string {
  return getCookie('lang') || 'ru';
}

export function setLang(lang: string): void {
  // Session cookie — no maxAge/expires, dies when browser closes
  document.cookie = `lang=${lang}; path=/`;
}

export function t(): Locale {
  const lang = getLang();
  return locales[lang] || ru;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

export function isLangSet(): boolean {
  return getCookie('lang') !== null;
}
