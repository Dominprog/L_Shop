import { api } from '../utils/api';
import { Product, Comment } from '../types';
import { renderProductCard } from '../components/ProductCard';
import { navigate } from '../utils/router';
import { t } from '../utils/i18n';

export async function renderHome(isAuth: boolean): Promise<string> {
  const locale = t();
  const [products, categories] = await Promise.all([
    api.get<Product[]>('/products'),
    api.get<string[]>('/products/categories'),
  ]);

  let likedIds: string[] = [];
  let allComments: Comment[] = [];

  if (isAuth) {
    try {
      const likesRes = await api.get<{ likes: string[] }>('/products/likes');
      likedIds = likesRes.likes;
    } catch {}
  }

  try {
    const results = await Promise.all(products.map((p) => api.get<Comment[]>(`/comments/${p.id}`)));
    allComments = results.flat();
  } catch {}

  const likedProducts = products.filter((p) => likedIds.includes(p.id));

  const recSection = likedProducts.length > 0 ? `
    <div class="recommendations" id="rec-section">
      <h2>${locale.home.recommended}</h2>
      <div class="products-grid recommended-grid" id="rec-grid">
        ${likedProducts.map((p) => renderProductCard(p, likedIds, allComments)).join('')}
      </div>
    </div>
  ` : '';

  const cards = products.map((p) => renderProductCard(p, likedIds, allComments)).join('');

  return `
    <div class="page">
      ${recSection}
      <div class="filters">
        <input type="text" id="search-input" placeholder="${locale.home.search}" class="filter-input" />
        <select id="category-select" class="filter-select">
          <option value="">${locale.home.allCategories}</option>
          ${categories.map((c) => `<option value="${c}">${c}</option>`).join('')}
        </select>
        <select id="sort-select" class="filter-select">
          <option value="">${locale.home.sortNone}</option>
          <option value="price_asc">${locale.home.sortAsc}</option>
          <option value="price_desc">${locale.home.sortDesc}</option>
        </select>
        <label class="filter-label">
          <input type="checkbox" id="available-check" /> ${locale.home.availableOnly}
        </label>
        <button id="apply-filters" class="btn">${locale.home.applyFilters}</button>
      </div>
      <div class="products-grid" id="products-grid">${cards}</div>
    </div>

    <div id="comments-modal" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9000;overflow:auto;">
      <div style="background:#fff;max-width:500px;margin:60px auto;border-radius:12px;padding:24px;">
        <div id="comments-content"></div>
        <button class="btn" id="close-comments" style="margin-top:16px;">${locale.comments.close}</button>
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
    let likedIds: string[] = [];
    if (isAuth) {
      try { likedIds = (await api.get<{ likes: string[] }>('/products/likes')).likes; } catch {}
    }
    const grid = document.getElementById('products-grid');
    if (grid) {
      grid.innerHTML = products.map((p) => renderProductCard(p, likedIds)).join('');
      bindMainGrid(isAuth, onCartChange);
    }
  });

  document.getElementById('close-comments')?.addEventListener('click', () => {
    const modal = document.getElementById('comments-modal');
    if (modal) modal.style.display = 'none';
  });

  bindMainGrid(isAuth, onCartChange);
  bindRecGrid(isAuth, onCartChange);
}

function handleLikeClick(likeBtn: HTMLElement, isAuth: boolean, isInRecGrid: boolean): void {
  if (!isAuth) { navigate('/login'); return; }
  const productId = likeBtn.getAttribute('data-like-id') as string;

  api.post<{ liked: boolean }>(`/products/${productId}/like`, {}).then((res) => {
    const locale = t();

    // Обновить кнопку в основной сетке
    const mainBtn = document.querySelector(`#products-grid .btn-like[data-like-id="${productId}"]`) as HTMLElement | null;
    if (mainBtn) {
      mainBtn.textContent = res.liked ? locale.home.liked : locale.home.like;
      mainBtn.classList.toggle('liked', res.liked);
    }

    // Обновить или удалить из блока рекомендаций
    const recGrid = document.getElementById('rec-grid');
    const recSection = document.getElementById('rec-section');
    if (recGrid) {
      const recBtn = recGrid.querySelector(`.btn-like[data-like-id="${productId}"]`) as HTMLElement | null;
      if (res.liked) {
        if (recBtn) {
          recBtn.textContent = locale.home.liked;
          recBtn.classList.add('liked');
        }
      } else {
        // убрали лайк — удаляем карточку из рекомендаций
        const card = recGrid.querySelector(`.product-card[data-id="${productId}"]`) as HTMLElement | null;
        card?.remove();
        if (recGrid.querySelectorAll('.product-card').length === 0) {
          recSection?.remove();
        }
      }
    }

    // Обновить саму кнопку если клик был в основной сетке
    if (!isInRecGrid) {
      likeBtn.textContent = res.liked ? locale.home.liked : locale.home.like;
      likeBtn.classList.toggle('liked', res.liked);

      // Добавить карточку в рекомендации если лайкнули
      if (res.liked) {
        const card = document.querySelector(`#products-grid .product-card[data-id="${productId}"]`);
        if (card && recGrid) {
          const clone = card.cloneNode(true) as HTMLElement;
          recGrid.appendChild(clone);
          bindRecGrid(true, async () => {});
        } else if (card && !recGrid) {
          // Создать блок рекомендаций
          const locale2 = t();
          const page = document.querySelector('.page');
          if (page) {
            const recDiv = document.createElement('div');
            recDiv.className = 'recommendations';
            recDiv.id = 'rec-section';
            const clone = card.cloneNode(true) as HTMLElement;
            recDiv.innerHTML = `<h2>${locale2.home.recommended}</h2><div class="products-grid recommended-grid" id="rec-grid"></div>`;
            (recDiv.querySelector('#rec-grid') as HTMLElement).appendChild(clone);
            page.prepend(recDiv);
            bindRecGrid(true, async () => {});
          }
        }
      }
    }
  }).catch(() => {});
}

function bindMainGrid(isAuth: boolean, onCartChange: () => Promise<void>): void {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  const newGrid = grid.cloneNode(true) as HTMLElement;
  newGrid.id = 'products-grid';
  grid.parentNode?.replaceChild(newGrid, grid);

  newGrid.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;

    const addBtn = target.closest('.add-to-cart-btn') as HTMLElement | null;
    if (addBtn) {
      if (!isAuth) { navigate('/login'); return; }
      const productId = addBtn.getAttribute('data-product-id') as string;
      const qtyInput = newGrid.querySelector(`.qty-input[data-product-id="${productId}"]`) as HTMLInputElement;
      const quantity = parseInt(qtyInput?.value || '1');
      (addBtn as HTMLButtonElement).disabled = true;
      try {
        await api.post('/cart', { productId, quantity });
        showToast('Товар добавлен!');
        await onCartChange();
      } catch (err) {
        showToast((err as Error).message, true);
      } finally {
        (addBtn as HTMLButtonElement).disabled = false;
      }
      return;
    }

    const likeBtn = target.closest('.btn-like') as HTMLElement | null;
    if (likeBtn) { handleLikeClick(likeBtn, isAuth, false); return; }

    const commentsBtn = target.closest('.btn-comments') as HTMLElement | null;
    if (commentsBtn) {
      await openCommentsModal(commentsBtn.getAttribute('data-comments-id') as string, isAuth);
    }
  });
}

function bindRecGrid(isAuth: boolean, onCartChange: () => Promise<void>): void {
  const recGrid = document.getElementById('rec-grid');
  if (!recGrid) return;
  const newGrid = recGrid.cloneNode(true) as HTMLElement;
  newGrid.id = 'rec-grid';
  recGrid.parentNode?.replaceChild(newGrid, recGrid);

  newGrid.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;

    const addBtn = target.closest('.add-to-cart-btn') as HTMLElement | null;
    if (addBtn) {
      if (!isAuth) { navigate('/login'); return; }
      const productId = addBtn.getAttribute('data-product-id') as string;
      const qtyInput = newGrid.querySelector(`.qty-input[data-product-id="${productId}"]`) as HTMLInputElement;
      const quantity = parseInt(qtyInput?.value || '1');
      try {
        await api.post('/cart', { productId, quantity });
        showToast('Товар добавлен!');
        await onCartChange();
      } catch (err) { showToast((err as Error).message, true); }
      return;
    }

    const likeBtn = target.closest('.btn-like') as HTMLElement | null;
    if (likeBtn) { handleLikeClick(likeBtn, isAuth, true); return; }

    const commentsBtn = target.closest('.btn-comments') as HTMLElement | null;
    if (commentsBtn) {
      await openCommentsModal(commentsBtn.getAttribute('data-comments-id') as string, isAuth);
    }
  });
}

async function openCommentsModal(productId: string, isAuth: boolean): Promise<void> {
  const locale = t();
  const modal = document.getElementById('comments-modal');
  const content = document.getElementById('comments-content');
  if (!modal || !content) return;

  let comments: Comment[] = [];
  try { comments = await api.get<Comment[]>(`/comments/${productId}`); } catch {}

  const stars = (r: number) => '⭐'.repeat(r);
  const commentsList = comments.length === 0
    ? `<p style="color:#888">${locale.comments.noComments}</p>`
    : comments.map((c) => `
      <div style="border-bottom:1px solid #eee;padding:8px 0">
        <strong>${c.userName}</strong> ${stars(c.rating)}
        <p style="margin:4px 0">${c.text}</p>
        <small style="color:#888">${new Date(c.createdAt).toLocaleDateString('ru-RU')}</small>
      </div>
    `).join('');

  const addForm = isAuth ? `
    <div style="margin-top:16px">
      <h4>${locale.comments.addTitle}</h4>
      <select id="comment-rating" style="width:100%;padding:6px;margin-bottom:8px;border-radius:6px;border:1px solid #ddd">
        <option value="5">⭐⭐⭐⭐⭐</option>
        <option value="4">⭐⭐⭐⭐</option>
        <option value="3">⭐⭐⭐</option>
        <option value="2">⭐⭐</option>
        <option value="1">⭐</option>
      </select>
      <textarea id="comment-text" placeholder="${locale.comments.textPlaceholder}"
        style="width:100%;min-height:80px;padding:8px;border-radius:6px;border:1px solid #ddd;box-sizing:border-box"></textarea>
      <button class="btn" id="submit-comment" style="margin-top:8px">${locale.comments.submit}</button>
    </div>
  ` : `<p style="color:#888;margin-top:12px">${locale.comments.loginRequired}</p>`;

  content.innerHTML = `<h3>${locale.comments.title}</h3>${commentsList}${addForm}`;
  modal.style.display = 'block';

  document.getElementById('submit-comment')?.addEventListener('click', async () => {
    const text = (document.getElementById('comment-text') as HTMLTextAreaElement).value.trim();
    const rating = parseInt((document.getElementById('comment-rating') as HTMLSelectElement).value);
    if (!text) return;
    try {
      await api.post(`/comments/${productId}`, { text, rating });
      showToast('Отзыв добавлен!');
      await openCommentsModal(productId, isAuth);
    } catch (err) { showToast((err as Error).message, true); }
  });
}

function showToast(message: string, isError = false): void {
  const existing = document.getElementById('toast-msg');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'toast-msg';
  toast.textContent = message;
  toast.style.cssText = `
    position:fixed;bottom:80px;left:50%;transform:translateX(-50%);
    background:${isError ? '#e53e3e' : '#38a169'};color:#fff;
    padding:10px 24px;border-radius:8px;font-size:14px;
    z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,.2);
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}