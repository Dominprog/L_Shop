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
        <h3 data-title="basket">${item.product.name}</h3>
        <p data-price="basket">${item.product.price} руб. × ${item.quantity} = ${item.product.price * item.quantity} руб.</p>
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
      <div class="cart-total">
        <strong>Итого: ${total} руб.</strong>
      </div>
      <button class="btn" id="go-delivery">Оформить доставку</button>
    </div>
  `;
}

export function bindCartEvents(reload: () => void): void {
  document.getElementById('go-home')?.addEventListener('click', () => navigate('/'));
  document.getElementById('go-delivery')?.addEventListener('click', () => navigate('/delivery'));

  document.querySelectorAll('[data-increase]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const productId = btn.getAttribute('data-increase') as string;
      const items = await api.get<CartItemWithProduct[]>('/cart');
      const item = items.find((i) => i.productId === productId);
      if (item) {
        await api.put(`/cart/${productId}`, { quantity: item.quantity + 1 });
        reload();
      }
    });
  });

  document.querySelectorAll('[data-decrease]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const productId = btn.getAttribute('data-decrease') as string;
      const items = await api.get<CartItemWithProduct[]>('/cart');
      const item = items.find((i) => i.productId === productId);
      if (item && item.quantity > 1) {
        await api.put(`/cart/${productId}`, { quantity: item.quantity - 1 });
        reload();
      } else {
        await api.delete(`/cart/${productId}`);
        reload();
      }
    });
  });

  document.querySelectorAll('[data-remove]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const productId = btn.getAttribute('data-remove') as string;
      await api.delete(`/cart/${productId}`);
      reload();
    });
  });
}
