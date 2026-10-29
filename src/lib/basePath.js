// The site can live at the root of a domain (https://sound.co.za/) or in a
// GitHub Pages sub-folder (https://<user>.github.io/<repo>/). Vite sets
// BASE_URL from the `base` option at build time.
export const BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

// Turn an in-app path such as "/login" into a full URL path for this site.
export function appUrl(path = '/') {
  const clean = path.startsWith('/') ? path : '/' + path;
  return BASE + clean;
}

// Turn the browser's current path back into an in-app path.
export function stripBase(pathname) {
  if (BASE && pathname.startsWith(BASE)) return pathname.slice(BASE.length) || '/';
  return pathname || '/';
}
