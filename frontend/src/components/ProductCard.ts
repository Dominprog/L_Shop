import { Product } from '../types';

export function renderProductCard(product: Product): string {
  return `
    <div class="product-card" data-id="${product.id}">
      <img src="${product.imageUrl}" alt="${product.name}" class="product-img" />
      <div class="product-info">
        <h3 data-title class="product-name">${product.name}</h3>
        <p class="product-desc">${product.description}</p>
        <p data-price class="product-price">${product.price} руб.</p>
        <p class="product-category">${product.category}</p>
        <p class="product-availability">${product.available ? '✅ В наличии' : '❌ Нет в наличии'}</p>
        ${product.available ? `
          <div class="cart-controls">
            <input type="number" class="qty-input" value="1" min="1" max="${product.stock}" data-product-id="${product.id}" />
            <button class="btn add-to-cart-btn" data-product-id="${product.id}">В корзину</button>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

