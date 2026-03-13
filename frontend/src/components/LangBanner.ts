import { getLang, setLang, isLangSet, t } from '../utils/i18n';

export function renderLangBanner(): string {
  if (isLangSet()) return '';
  const currentLang = navigator.language || 'ru';
  const isForeign = !currentLang.startsWith('ru');
  if (!isForeign) return '';

  const locale = t();
  return `
    <div id="lang-banner" style="
      position:fixed;bottom:0;left:0;right:0;
      background:#1a202c;color:#fff;
      padding:12px 24px;
      display:flex;align-items:center;justify-content:center;gap:16px;
      z-index:10000;font-size:14px;
    ">
      <span>${locale.lang.banner}</span>
      <button id="lang-yes" style="background:#4299e8;color:#fff;border:none;padding:6px 16px;border-radius:6px;cursor:pointer;">
        ${locale.lang.yes}
      </button>
      <button id="lang-no" style="background:#718096;color:#fff;border:none;padding:6px 16px;border-radius:6px;cursor:pointer;">
        ${locale.lang.no}
      </button>
    </div>
  `;
}

export function bindLangBanner(onLangChange: () => void): void {
  document.getElementById('lang-yes')?.addEventListener('click', () => {
    const newLang = getLang() === 'ru' ? 'en' : 'ru';
    setLang(newLang);
    document.getElementById('lang-banner')?.remove();
    onLangChange();
  });

  document.getElementById('lang-no')?.addEventListener('click', () => {
    setLang(getLang());
    document.getElementById('lang-banner')?.remove();
  });
}
