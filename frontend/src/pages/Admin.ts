import { api } from '../utils/api';
import { Product } from '../types';
import { t } from '../utils/i18n';

export async function renderAdmin(): Promise<string> {
  const locale = t();
  const products = await api.get<Product[]>('/products');

  const rows = products.map((p) => `
    <tr data-id="${p.id}">
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>${p.price} руб.</td>
      <td>${p.category}</td>
      <td>${p.available ? '✅' : '❌'}</td>
      <td>${p.stock}</td>
      <td>
        <button class="btn-sm btn-edit" data-id="${p.id}">${locale.admin.edit}</button>
        <button class="btn-sm btn-danger btn-delete" data-id="${p.id}">${locale.admin.delete}</button>
      </td>
    </tr>
  `).join('');

  return `
    <div class="page">
      <h2>${locale.admin.title}</h2>
      <button class="btn" id="btn-add-product" style="margin-bottom:16px">${locale.admin.addProduct}</button>

      <div id="product-form" style="display:none;background:#f7fafc;border-radius:12px;padding:20px;margin-bottom:24px">
        <h3 id="form-title">${locale.admin.addProduct}</h3>
        <input id="f-name" type="text" placeholder="${locale.admin.name}" class="filter-input" style="width:100%;margin-bottom:8px" />
        <input id="f-description" type="text" placeholder="${locale.admin.description}" class="filter-input" style="width:100%;margin-bottom:8px" />
        <input id="f-price" type="number" placeholder="${locale.admin.price}" class="filter-input" style="width:100%;margin-bottom:8px" />
        <input id="f-category" type="text" placeholder="${locale.admin.category}" class="filter-input" style="width:100%;margin-bottom:8px" />
        <input id="f-stock" type="number" placeholder="${locale.admin.stock}" class="filter-input" style="width:100%;margin-bottom:8px" />
        <input id="f-imageUrl" type="text" placeholder="${locale.admin.imageUrl}" class="filter-input" style="width:100%;margin-bottom:8px" />
        <input id="f-tags" type="text" placeholder="${locale.admin.tags}" class="filter-input" style="width:100%;margin-bottom:8px" />
        <label style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
          <input id="f-available" type="checkbox" checked /> ${locale.admin.available}
        </label>
        <input type="hidden" id="f-edit-id" value="" />
        <div style="display:flex;gap:8px">
          <button class="btn" id="btn-save-product">${locale.admin.save}</button>
          <button class="btn-sm" id="btn-cancel-product">${locale.admin.cancel}</button>
        </div>
      </div>

      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse" id="products-table">
          <thead>
            <tr style="background:#edf2f7">
              <th style="padding:8px;text-align:left">ID</th>
              <th style="padding:8px;text-align:left">${locale.admin.name}</th>
              <th style="padding:8px;text-align:left">${locale.admin.price}</th>
              <th style="padding:8px;text-align:left">${locale.admin.category}</th>
              <th style="padding:8px;text-align:left">${locale.admin.available}</th>
              <th style="padding:8px;text-align:left">${locale.admin.stock}</th>
              <th style="padding:8px;text-align:left"></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

export function bindAdminEvents(reload: () => Promise<void>): void {
  const locale = t();
  const form = document.getElementById('product-form') as HTMLElement;

  document.getElementById('btn-add-product')?.addEventListener('click', () => {
    clearForm();
    (document.getElementById('form-title') as HTMLElement).textContent = locale.admin.addProduct;
    form.style.display = 'block';
  });

  document.getElementById('btn-cancel-product')?.addEventListener('click', () => {
    form.style.display = 'none';
  });

  document.getElementById('btn-save-product')?.addEventListener('click', async () => {
    const editId = (document.getElementById('f-edit-id') as HTMLInputElement).value;
    const body = {
      name: (document.getElementById('f-name') as HTMLInputElement).value,
      description: (document.getElementById('f-description') as HTMLInputElement).value,
      price: Number((document.getElementById('f-price') as HTMLInputElement).value),
      category: (document.getElementById('f-category') as HTMLInputElement).value,
      stock: Number((document.getElementById('f-stock') as HTMLInputElement).value),
      imageUrl: (document.getElementById('f-imageUrl') as HTMLInputElement).value || 'https://via.placeholder.com/300x200?text=Product',
      tags: (document.getElementById('f-tags') as HTMLInputElement).value.split(',').map((s) => s.trim()).filter(Boolean),
      available: (document.getElementById('f-available') as HTMLInputElement).checked,
    };

    try {
      if (editId) {
        await api.put(`/products/${editId}`, body);
      } else {
        await api.post('/products', body);
      }
      form.style.display = 'none';
      await reload();
    } catch (err) {
      alert((err as Error).message);
    }
  });

  document.getElementById('products-table')?.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;

    const editBtn = target.closest('.btn-edit') as HTMLElement | null;
    if (editBtn) {
      const id = editBtn.getAttribute('data-id') as string;
      const product = await api.get<Product>(`/products/${id}`);
      (document.getElementById('f-edit-id') as HTMLInputElement).value = id;
      (document.getElementById('f-name') as HTMLInputElement).value = product.name;
      (document.getElementById('f-description') as HTMLInputElement).value = product.description;
      (document.getElementById('f-price') as HTMLInputElement).value = String(product.price);
      (document.getElementById('f-category') as HTMLInputElement).value = product.category;
      (document.getElementById('f-stock') as HTMLInputElement).value = String(product.stock);
      (document.getElementById('f-imageUrl') as HTMLInputElement).value = product.imageUrl;
      (document.getElementById('f-tags') as HTMLInputElement).value = (product.tags || []).join(', ');
      (document.getElementById('f-available') as HTMLInputElement).checked = product.available;
      (document.getElementById('form-title') as HTMLElement).textContent = locale.admin.edit;
      form.style.display = 'block';
      return;
    }

    const delBtn = target.closest('.btn-delete') as HTMLElement | null;
    if (delBtn) {
      const id = delBtn.getAttribute('data-id') as string;
      if (!confirm(locale.admin.confirmDelete)) return;
      try {
        await api.delete(`/products/${id}`);
        await reload();
      } catch (err) {
        alert((err as Error).message);
      }
    }
  });
}

function clearForm(): void {
  ['f-edit-id', 'f-name', 'f-description', 'f-price', 'f-category', 'f-stock', 'f-imageUrl', 'f-tags'].forEach((id) => {
    (document.getElementById(id) as HTMLInputElement).value = '';
  });
  (document.getElementById('f-available') as HTMLInputElement).checked = true;
}
