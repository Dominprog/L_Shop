import { api } from '../utils/api';
import { Delivery } from '../types';
import { navigate } from '../utils/router';

export function renderDeliveryForm(): string {
  return `
    <div class="page">
      <h2>Оформление доставки</h2>
      <form data-delivery class="delivery-form" id="delivery-form">
        <input type="text" id="del-address" placeholder="Адрес доставки" class="form-input" required />
        <input type="tel" id="del-phone" placeholder="Телефон" class="form-input" required />
        <input type="email" id="del-email" placeholder="Email" class="form-input" required />
        <select id="del-payment" class="filter-select" required>
          <option value="">Способ оплаты</option>
          <option value="card">Карта</option>
          <option value="cash">Наличные</option>
          <option value="online">Онлайн</option>
        </select>
        <button type="submit" class="btn">Оформить</button>
      </form>
    </div>
  `;
}

export function bindDeliveryEvents(onSuccess: () => void): void {
  document.getElementById('delivery-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const address = (document.getElementById('del-address') as HTMLInputElement).value;
    const phone = (document.getElementById('del-phone') as HTMLInputElement).value;
    const email = (document.getElementById('del-email') as HTMLInputElement).value;
    const paymentMethod = (document.getElementById('del-payment') as HTMLSelectElement).value;

    try {
      await api.post<Delivery>('/delivery', { address, phone, email, paymentMethod });
      alert('Доставка оформлена! Корзина очищена.');
      onSuccess();
      navigate('/');
    } catch (e) {
      alert((e as Error).message);
    }
  });
}

