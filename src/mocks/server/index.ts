import type { Agency, AgencyInput, Order, OrderInput, Product, ProductInput, ProductModeration } from '@/shared/types';
import * as admin from './handlers/admin';
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
  const id = Number(seg[2]);
  const status = q.get('status') ?? 'all';
  const route = `${method} ${path.replace(/\/\d+(?=\/|$)/g, '/:id')}`;

  if (method === 'GET' && seg[0] === 'agencies' && seg.length === 2) return getPublicAgency(seg[1]);

  switch (route) {
    case 'GET /products': return listProducts(q);
    case 'GET /products/:id': return getProduct(Number(seg[1]));
    case 'POST /orders': return createOrder(body as OrderInput);
    case 'GET /agency/summary': return getAgencySummary();
    case 'GET /agency/settings': return getAgencySettings();
    case 'PATCH /agency/settings': return updateAgencySettings(body as Partial<Agency>);

    case 'GET /admin/summary': return admin.getSummary();
    case 'GET /admin/products': return admin.listProducts(status);
    case 'POST /admin/products': return admin.createProduct(body as ProductInput);
    case 'PATCH /admin/products/:id': return admin.updateProduct(id, body as Partial<Product>);
    case 'DELETE /admin/products/:id': return admin.deleteProduct(id);
    case 'POST /admin/products/:id/approval': return admin.moderateProduct(id, body as ProductModeration);
    case 'GET /admin/orders': return admin.listOrders(status);
    case 'PATCH /admin/orders/:id': return admin.updateOrderStatus(id, (body as { status: Order['status'] }).status);
    case 'GET /admin/agencies': return admin.listAgencies();
    case 'POST /admin/agencies': return admin.createAgency(body as AgencyInput);
    case 'GET /admin/agencies/:id': return admin.getAgency(id);
    case 'PATCH /admin/agencies/:id': return admin.updateAgency(id, body as Partial<Agency>);
    case 'GET /admin/agencies/:id/orders': return admin.listAgencyOrders(id, status);
  }
  throw new MockHttpError(404, `No mock for ${method} ${path}`);
}
