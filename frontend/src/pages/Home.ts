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

export function bindHomeEvents(isAuth: boolean): void {
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
      bindAddToCartEvents(isAuth);
    }
  });

  bindAddToCartEvents(isAuth);
}

function bindAddToCartEvents(isAuth: boolean): void {
  document.querySelectorAll('.add-to-cart-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!isAuth) {
        navigate('/login');
        return;
      }
      const productId = btn.getAttribute('data-product-id') as string;
      const qtyInput = document.querySelector(`.qty-input[data-product-id="${productId}"]`) as HTMLInputElement;
      const quantity = parseInt(qtyInput?.value || '1');
      try {
        await api.post('/cart', { productId, quantity });
        alert('Товар добавлен в корзину!');
      } catch (e) {
        alert((e as Error).message);
      }
    });
  });
}
