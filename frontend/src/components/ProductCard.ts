import { Product, Comment } from '../types';
import { t } from '../utils/i18n';

export function renderProductCard(product: Product, likedIds: string[] = [], comments: Comment[] = []): string {
  const locale = t();
  const isLiked = likedIds.includes(product.id);
  const productComments = comments.filter((c) => c.productId === product.id);
  const avgRating = productComments.length > 0
    ? (productComments.reduce((s, c) => s + c.rating, 0) / productComments.length).toFixed(1)
    : null;

  return `
    <div class="product-card" data-id="${product.id}">
      <img src="${product.imageUrl}" alt="${product.name}" class="product-img" />
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-desc">${product.description}</p>
        <p class="product-price">${product.price} руб.</p>
        <p class="product-category">${product.category}</p>
        ${avgRating ? `<p class="product-rating">⭐ ${avgRating} (${productComments.length})</p>` : ''}
        <p class="product-availability">${product.available ? locale.home.inStock : locale.home.outOfStock}</p>
        ${product.available ? `
          <div class="cart-controls">
            <input type="number" class="qty-input" value="1" min="1" max="${product.stock}" data-product-id="${product.id}" />
            <button class="btn add-to-cart-btn" data-product-id="${product.id}">${locale.home.addToCart}</button>
          </div>
        ` : ''}
        <div class="product-actions">
          <button class="btn-like ${isLiked ? 'liked' : ''}" data-like-id="${product.id}" title="Нравится">
            ${isLiked ? locale.home.liked : locale.home.like}
          </button>
          <button class="btn-sm btn-comments" data-comments-id="${product.id}">${locale.comments.showComments} (${productComments.length})</button>
        </div>
      </div>
    </div>
  `;
}
