type RouteHandler = () => void;

const routes: Record<string, RouteHandler> = {};

export function addRoute(path: string, handler: RouteHandler): void {
  routes[path] = handler;
}

export function navigate(path: string): void {
  window.history.pushState({}, '', path);
  handleRoute();
}

export function handleRoute(): void {
  const path = window.location.pathname;
  const handler = routes[path] || routes['/'];
  if (handler) handler();
}

window.addEventListener('popstate', handleRoute);
