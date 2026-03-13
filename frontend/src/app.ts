import { addRoute, handleRoute, navigate } from './utils/router';
import { api } from './utils/api';
import { renderHeader, bindHeaderEvents, updateCartCountInHeader } from './components/Header';
import { renderHome, bindHomeEvents } from './pages/Home';
import { renderRegister, bindRegisterEvents } from './pages/Register';
import { renderLogin, bindLoginEvents } from './pages/Login';
import { renderCart, bindCartEvents } from './pages/Cart';
import { renderDeliveryForm, bindDeliveryEvents } from './pages/Delivery';
import { renderAdmin, bindAdminEvents } from './pages/Admin';
import { renderLangBanner, bindLangBanner } from './components/LangBanner';
import { User, CartItemWithProduct } from './types';

let currentUser: User | null = null;

async function getCartCount(): Promise<number> {
  if (!currentUser) return 0;
  try {
    const items = await api.get<CartItemWithProduct[]>('/cart');
    return items.reduce((sum, i) => sum + i.quantity, 0);
  } catch {
    return 0;
  }
}

async function mount(content: string): Promise<void> {
  const cartCount = await getCartCount();
  const app = document.getElementById('app') as HTMLElement;
  app.innerHTML = renderHeader(currentUser, cartCount) + content + renderLangBanner();
  bindHeaderEvents(() => { currentUser = null; navigate('/'); });
  bindLangBanner(() => window.location.reload());
}

async function refreshCartCount(): Promise<void> {
  const count = await getCartCount();
  updateCartCountInHeader(count);
}

async function refreshCartCount(): Promise<void> {
  const count = await getCartCount();
  const link = document.getElementById('cart-nav-link');
  if (link) link.textContent = `Корзина (${count})`;
}

async function tryRestoreSession(): Promise<void> {
  try {
    currentUser = await api.get<User>('/users/me');
  } catch {
    currentUser = null;
  }
}

addRoute('/', async () => {
  const content = await renderHome(currentUser !== null);
  await mount(content);
  bindHomeEvents(currentUser !== null, refreshCartCount);
});

addRoute('/register', async () => {
  const content = renderRegister();
  await mount(content);
  bindRegisterEvents((user) => { currentUser = user as User; navigate('/'); });
});

addRoute('/login', async () => {
  const content = renderLogin();
  await mount(content);
  bindLoginEvents((user) => { currentUser = user as User; navigate('/'); });
});

addRoute('/cart', async () => {
  if (!currentUser) { navigate('/login'); return; }
  async function reloadCart(): Promise<void> {
    const content = await renderCart();
    await mount(content);
    bindCartEvents(reloadCart);
  }
  await reloadCart();
});

addRoute('/delivery', async () => {
  if (!currentUser) { navigate('/login'); return; }
  const content = renderDeliveryForm();
  await mount(content);
  bindDeliveryEvents(() => {});
});

addRoute('/admin', async () => {
  if (!currentUser || currentUser.role !== 'admin') { navigate('/'); return; }
  async function reloadAdmin(): Promise<void> {
    const content = await renderAdmin();
    await mount(content);
    bindAdminEvents(reloadAdmin);
  }
  await reloadAdmin();
});

(async () => {
  await tryRestoreSession();
  handleRoute();
})();