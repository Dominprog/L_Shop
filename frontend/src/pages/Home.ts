import { api } from '../utils/api';
import { Product } from '../types';
import { renderProductCard } from '../components/ProductCard';
import { navigate } from '../utils/router';

export async function renderHome(isAuth: boolean): Promise<string> {
  const products = await api.get<Product[]>('/products');
  const categories = await api.get<string[]>('/products/categories');
  const cards = products.map(renderProductCard).join('');

  return `
    <div class="page">
      <div class="filters">
        <input type="text" id="search-input" placeholder="Поиск товара..." class="filter-input" />
        <select id="category-select" class="filter-select">
          <option value="">Все категории</option>
          ${categories.map((c) => `<option value="${c}">${c}</option>`).join('')}
        </select>
        <select id="sort-select" class="filter-select">
          <option value="">Без сортировки</option>
          <option value="price_asc">Цена ↑</option>
          <option value="price_desc">Цена ↓</option>
        </select>
        <label class="filter-label">
          <input type="checkbox" id="available-check" /> Только в наличии
        </label>
        <button id="apply-filters" class="btn">Применить</button>
      </div>
      <div class="products-grid" id="products-grid">
        ${cards}
      </div>
    </div>
  `;
}

export function bindHomeEvents(isAuth: boolean, onCartChange: () => Promise<void>): void {
  document.getElementById('apply-filters')?.addEventListener('click', async () => {
    const search = (document.getElementById('search-input') as HTMLInputElement).value;
    const category = (document.getElementById('category-select') as HTMLSelectElement).value;
    const sort = (document.getElementById('sort-select') as HTMLSelectElement).value;
    const available = (document.getElementById('available-check') as HTMLInputElement).checked;

    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort);
    if (available) params.set('available', 'true');

    const products = await api.get<Product[]>(`/products?${params.toString()}`);
    const grid = document.getElementById('products-grid');
    if (grid) {
      grid.innerHTML = products.map(renderProductCard).join('');
      bindCartGrid(isAuth, onCartChange);
    }
  });

  bindCartGrid(isAuth, onCartChange);
}

function bindCartGrid(isAuth: boolean, onCartChange: () => Promise<void>): void {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  const newGrid = grid.cloneNode(true) as HTMLElement;
  grid.parentNode?.replaceChild(newGrid, grid);

  newGrid.addEventListener('click', async (e) => {
    const btn = (e.target as HTMLElement).closest('.add-to-cart-btn') as HTMLElement | null;
    if (!btn) return;
    if (!isAuth) { navigate('/login'); return; }

    const productId = btn.getAttribute('data-product-id') as string;
    const qtyInput = newGrid.querySelector(`.qty-input[data-product-id="${productId}"]`) as HTMLInputElement;
    const quantity = parseInt(qtyInput?.value || '1');

    (btn as HTMLButtonElement).disabled = true;
    try {
      await api.post('/cart', { productId, quantity });
      showToast('Товар добавлен в корзину!');
      await onCartChange();
    } catch (err) {
      showToast((err as Error).message, true);
    } finally {
      (btn as HTMLButtonElement).disabled = false;
    }
  });
}

function showToast(message: string, isError = false): void {
  const existing = document.getElementById('toast-msg');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'toast-msg';
  toast.textContent = message;
  toast.style.cssText = `
    position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
    background:${isError ? '#e53e3e' : '#38a169'};color:#fff;
    padding:10px 24px;border-radius:8px;font-size:14px;
    z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,.2);
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}