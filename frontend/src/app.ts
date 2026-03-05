import { addRoute, handleRoute, navigate } from './utils/router';
import { api } from './utils/api';
import { renderHeader, bindHeaderEvents } from './components/Header';
import { renderHome, bindHomeEvents } from './pages/Home';
import { renderRegister, bindRegisterEvents } from './pages/Register';
import { renderLogin, bindLoginEvents } from './pages/Login';
import { renderCart, bindCartEvents } from './pages/Cart';
import { renderDeliveryForm, bindDeliveryEvents } from './pages/Delivery';
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
  app.innerHTML = renderHeader(currentUser, cartCount) + content;
  bindHeaderEvents(() => {
    currentUser = null;
    navigate('/');
  });
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
  bindHomeEvents(currentUser !== null);
});

addRoute('/register', async () => {
  const content = renderRegister();
  await mount(content);
  bindRegisterEvents((user) => { currentUser = user; });
});

addRoute('/login', async () => {
  const content = renderLogin();
  await mount(content);
  bindLoginEvents((user) => { currentUser = user; });
});

addRoute('/cart', async () => {
  if (!currentUser) { navigate('/login'); return; }
  const content = await renderCart();
  await mount(content);
  bindCartEvents(async () => {
    const content = await renderCart();
    await mount(content);
    bindCartEvents(() => {});
  });
});

addRoute('/delivery', async () => {
  if (!currentUser) { navigate('/login'); return; }
  const content = renderDeliveryForm();
  await mount(content);
  bindDeliveryEvents(() => {});
});

(async () => {
  await tryRestoreSession();
  handleRoute();
})();
