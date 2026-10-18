import type { Agency, OrderInput } from '@/shared/types';
import { MockHttpError } from './db';
import { getProduct, listProducts } from './handlers/products';
import { createOrder } from './handlers/orders';
import { getAgencySettings, getAgencySummary, getPublicAgency, updateAgencySettings } from './handlers/agency';

export { MockHttpError };

/** Routes a request to the in-browser mock backend. */
export function mockRequest(method: string, url: string, body: unknown): unknown {
  const { pathname, searchParams: q } = new URL(url, 'http://mock');
  const path = pathname.replace(/^.*?\/api/, '');
  const seg = path.split('/').filter(Boolean);
  const route = `${method} ${path.replace(/\/\d+(?=\/|$)/g, '/:id')}`;

  if (method === 'GET' && seg[0] === 'agencies' && seg.length === 2) return getPublicAgency(seg[1]);

  switch (route) {
    case 'GET /products': return listProducts(q);
    case 'GET /products/:id': return getProduct(Number(seg[1]));
    case 'POST /orders': return createOrder(body as OrderInput);
    case 'GET /agency/summary': return getAgencySummary();
    case 'GET /agency/settings': return getAgencySettings();
    case 'PATCH /agency/settings': return updateAgencySettings(body as Partial<Agency>);
  }
  throw new MockHttpError(404, `No mock for ${method} ${path}`);
}
