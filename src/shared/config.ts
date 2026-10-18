export const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

export const imageFallback = 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=1000';
// No storage backend: uploaded images are kept inline as data URLs.

/** Admin portal (separate app); override with VITE_ADMIN_URL */
export const ADMIN_URL = import.meta.env.VITE_ADMIN_URL ?? 'https://mevi-shop-admin.vercel.app/';
