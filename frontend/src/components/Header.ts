import { navigate } from '../utils/router';
import { api } from '../utils/api';
import { User } from '../types';

export function renderHeader(user: User | null, cartCount: number): string {
  return `
    <header class="header">
      <div class="logo" data-nav="/">🛒 L_Shop</div>
      <nav class="nav">
        <span data-nav="/" class="nav-link">Товары</span>
        ${user ? `
          <span data-nav="/cart" class="nav-link">Корзина (${cartCount})</span>
          <span data-nav="/delivery" class="nav-link">Доставки</span>
          <span id="logout-btn" class="nav-link">Выйти (${user.name})</span>
        ` : `
          <span data-nav="/login" class="nav-link">Войти</span>
          <span data-nav="/register" class="nav-link">Регистрация</span>
        `}
      </nav>
    </header>
  `;
}

export function bindHeaderEvents(onLogout: () => void): void {
  document.querySelectorAll('[data-nav]').forEach((el) => {
    el.addEventListener('click', () => {
      const path = el.getAttribute('data-nav') as string;
      navigate(path);
    });
  });

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await api.post('/users/logout', {});
      onLogout();
    });
  }
}
