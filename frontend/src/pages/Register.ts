import { api } from '../utils/api';
import { navigate } from '../utils/router';
import { User } from '../types';

export function renderRegister(): string {
  return `
    <div class="page auth-page">
      <h2>Регистрация</h2>
      <form data-registration class="auth-form" id="register-form">
        <input type="text" id="reg-name" placeholder="Имя" class="form-input" required />
        <input type="email" id="reg-email" placeholder="Email" class="form-input" required />
        <input type="tel" id="reg-phone" placeholder="Телефон" class="form-input" required />
        <input type="password" id="reg-password" placeholder="Пароль" class="form-input" required />
        <button type="submit" class="btn">Зарегистрироваться</button>
      </form>
      <p>Уже есть аккаунт? <span data-nav="/login" class="link-btn">Войти</span></p>
    </div>
  `;
}

export function bindRegisterEvents(onLogin: (user: User) => void): void {
  document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = (document.getElementById('reg-name') as HTMLInputElement).value;
    const email = (document.getElementById('reg-email') as HTMLInputElement).value;
    const phone = (document.getElementById('reg-phone') as HTMLInputElement).value;
    const password = (document.getElementById('reg-password') as HTMLInputElement).value;

    try {
      const user = await api.post<User>('/users/register', { name, email, phone, password });
      onLogin(user);
      navigate('/');
    } catch (e) {
      alert((e as Error).message);
    }
  });

  document.querySelector('[data-nav="/login"]')?.addEventListener('click', () => navigate('/login'));
}
