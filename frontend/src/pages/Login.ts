import { api } from '../utils/api';
import { navigate } from '../utils/router';
import { User } from '../types';

export function renderLogin(): string {
  return `
    <div class="page auth-page">
      <h2>Вход</h2>
      <form class="auth-form" id="login-form">
        <input type="email" id="login-email" placeholder="Email" class="form-input" required />
        <input type="password" id="login-password" placeholder="Пароль" class="form-input" required />
        <button type="submit" class="btn">Войти</button>
      </form>
      <p>Нет аккаунта? <span data-nav="/register" class="link-btn">Зарегистрироваться</span></p>
    </div>
  `;
}

export function bindLoginEvents(onLogin: (user: User) => void): void {
  document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = (document.getElementById('login-email') as HTMLInputElement).value;
    const password = (document.getElementById('login-password') as HTMLInputElement).value;

    try {
      const user = await api.post<User>('/users/login', { email, password });
      onLogin(user);
      navigate('/');
    } catch (e) {
      alert((e as Error).message);
    }
  });

  document.querySelector('[data-nav="/register"]')?.addEventListener('click', () => navigate('/register'));
}

