import { User } from '../types';
import { navigate } from '../utils/router';
import { api } from '../utils/api';
import { t, getLang, setLang } from '../utils/i18n';

export function renderHeader(user: User | null, cartCount: number): string {
  const locale = t();
  const lang = getLang();
  const otherLang = lang === 'ru' ? 'EN' : 'RU';

  return `
    <header class="header">
      <div class="header-logo" id="nav-home" style="cursor:pointer;">L_Shop</div>
      <nav class="header-nav">
        <a href="#" id="nav-home-link">${locale.nav.home}</a>
        ${user ? `<a href="#" id="nav-cart-link" id="cart-nav-link">
          ${locale.nav.cart} (${cartCount})
        </a>` : ''}
        ${user?.role === 'admin' ? `<a href="#" id="nav-admin-link">${locale.nav.admin}</a>` : ''}
        ${user
          ? `<span class="header-user">👤 ${user.name}</span>
             <button class="btn-sm" id="btn-logout">${locale.nav.logout}</button>`
          : `<a href="#" id="nav-login-link">${locale.nav.login}</a>
             <a href="#" id="nav-register-link">${locale.nav.register}</a>`
        }
        <button class="btn-sm" id="btn-lang">${otherLang}</button>
      </nav>
    </header>
  `;
}

export function updateCartCountInHeader(count: number): void {
  const link = document.getElementById('nav-cart-link');
  if (link) {
    const locale = t();
    link.textContent = `${locale.nav.cart} (${count})`;
  }
}

export function bindHeaderEvents(onLogout: () => void): void {
  document.getElementById('nav-home')?.addEventListener('click', () => navigate('/'));
  document.getElementById('nav-home-link')?.addEventListener('click', (e) => { e.preventDefault(); navigate('/'); });
  document.getElementById('nav-cart-link')?.addEventListener('click', (e) => { e.preventDefault(); navigate('/cart'); });
  document.getElementById('nav-admin-link')?.addEventListener('click', (e) => { e.preventDefault(); navigate('/admin'); });
  document.getElementById('nav-login-link')?.addEventListener('click', (e) => { e.preventDefault(); navigate('/login'); });
  document.getElementById('nav-register-link')?.addEventListener('click', (e) => { e.preventDefault(); navigate('/register'); });

  document.getElementById('btn-logout')?.addEventListener('click', async () => {
    await api.post('/users/logout', {});
    onLogout();
  });

  document.getElementById('btn-lang')?.addEventListener('click', () => {
    const newLang = getLang() === 'ru' ? 'en' : 'ru';
    setLang(newLang);
    window.location.reload();
  });
}
