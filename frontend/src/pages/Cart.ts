import { api } from '../utils/api';
import { CartItemWithProduct } from '../types';
import { navigate } from '../utils/router';

export async function renderCart(): Promise<string> {
  const items = await api.get<CartItemWithProduct[]>('/cart');

  if (items.length === 0) {
    return `<div class="page"><h2>Корзина пуста</h2><button class="btn" id="go-home">К товарам</button></div>`;
  }

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const rows = items.map((item) => `
    <div class="cart-item">
      <img src="${item.product.imageUrl}" class="cart-img" alt="${item.product.name}" />
      <div class="cart-item-info">
        <h3>${item.product.name}</h3>
        <p>${item.product.price} руб. × ${item.quantity} = ${item.product.price * item.quantity} руб.</p>
      </div>
      <div class="cart-item-controls">
        <button class="btn-sm" data-decrease="${item.productId}">−</button>
        <span>${item.quantity}</span>
        <button class="btn-sm" data-increase="${item.productId}">+</button>
        <button class="btn-sm btn-danger" data-remove="${item.productId}">✕</button>
      </div>
    </div>
  `).join('');

  return `
    <div class="page">
      <h2>Корзина</h2>
      ${rows}
      <div class="cart-total"><strong>Итого: ${total} руб.</strong></div>
      <div style="display:flex;gap:12px;margin-top:16px;">
        <button class="btn" id="go-home">← Продолжить покупки</button>
        <button class="btn" id="go-delivery">Оформить доставку →</button>
      </div>
    </div>
  `;
}

export function bindCartEvents(reload: () => Promise<void>): void {
  document.getElementById('go-home')?.addEventListener('click', () => navigate('/'));
  document.getElementById('go-delivery')?.addEventListener('click', () => navigate('/delivery'));

  const page = document.querySelector('.page');
  if (!page) return;

  page.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;
    const inc = target.closest('[data-increase]') as HTMLElement | null;
    const dec = target.closest('[data-decrease]') as HTMLElement | null;
    const rem = target.closest('[data-remove]') as HTMLElement | null;
    if (!inc && !dec && !rem) return;

    const allBtns = page.querySelectorAll('button');
    allBtns.forEach((b) => ((b as HTMLButtonElement).disabled = true));

    try {
      if (inc) {
        const productId = inc.getAttribute('data-increase') as string;
        const items = await api.get<CartItemWithProduct[]>('/cart');
        const item = items.find((i) => i.productId === productId);
        if (item) await api.put(`/cart/${productId}`, { quantity: item.quantity + 1 });
      } else if (dec) {
        const productId = dec.getAttribute('data-decrease') as string;
        const items = await api.get<CartItemWithProduct[]>('/cart');
        const item = items.find((i) => i.productId === productId);
        if (item) {
          if (item.quantity > 1) await api.put(`/cart/${productId}`, { quantity: item.quantity - 1 });
          else await api.delete(`/cart/${productId}`);
        }
      } else if (rem) {
        const productId = rem.getAttribute('data-remove') as string;
        await api.delete(`/cart/${productId}`);
      }
      await reload();
    } catch (err) {
      alert((err as Error).message);
      allBtns.forEach((b) => ((b as HTMLButtonElement).disabled = false));
    }
  });
}

