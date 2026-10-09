import { desc, eq, inArray } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  CreateAgencyBody,
  CreateAgencyResponse,
  CreateProductBody,
  CreateProductResponse,
  DeleteProductParams,
  GetAdminSummaryResponse,
  ListAdminOrdersQueryParams,
  ListAdminOrdersResponse,
  ListAdminProductsQueryParams,
  ListAdminProductsResponse,
  ListAgenciesResponse,
  ModerateProductBody,
  ModerateProductParams,
  ModerateProductResponse,
  UpdateAgencyBody,
  UpdateAgencyParams,
  UpdateAgencyResponse,
  UpdateOrderStatusBody,
  UpdateOrderStatusParams,
  UpdateOrderStatusResponse,
  UpdateProductBody,
  UpdateProductParams,
  UpdateProductResponse,
} from "@workspace/api-zod";
import {
  agenciesTable,
  db,
  orderItemsTable,
  ordersTable,
  productsTable,
} from "@workspace/db";
import { requireRole } from "../lib/auth";

const router: IRouter = Router();
const adminOnly = requireRole("admin");

function apiProduct(product: typeof productsTable.$inferSelect) {
  return { ...product, createdAt: product.createdAt.toISOString() };
}

async function apiOrders(rows: (typeof ordersTable.$inferSelect)[]) {
  if (rows.length === 0) return [];
  const items = await db
    .select()
    .from(orderItemsTable)
    .where(inArray(orderItemsTable.orderId, rows.map((row) => row.id)));
  const itemsByOrder = new Map<number, typeof items>();
  for (const item of items) {
    const group = itemsByOrder.get(item.orderId) ?? [];
    group.push(item);
    itemsByOrder.set(item.orderId, group);
  }
  return rows.map((order) => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
    items: itemsByOrder.get(order.id) ?? [],
  }));
}

router.get("/admin/summary", adminOnly, async (_req, res): Promise<void> => {
  const [products, orders] = await Promise.all([
    db.select().from(productsTable),
    db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)),
  ]);
  const newOrders = orders.filter((order) => order.status === "new").length;
  const totalRevenue = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.total, 0);
  const response = {
    productCount: products.length,
    pendingProducts: products.filter((product) => product.status === "pending")
      .length,
    orderCount: orders.length,
    newOrders,
    totalRevenue,
    recentOrders: await apiOrders(orders.slice(0, 6)),
  };
  res.json(GetAdminSummaryResponse.parse(response));
});

router.get("/admin/products", adminOnly, async (req, res): Promise<void> => {
  const parsed = ListAdminProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const rows =
    !parsed.data.status || parsed.data.status === "all"
      ? await db.select().from(productsTable).orderBy(desc(productsTable.createdAt))
      : await db
          .select()
          .from(productsTable)
          .where(eq(productsTable.status, parsed.data.status))
          .orderBy(desc(productsTable.createdAt));
  res.json(ListAdminProductsResponse.parse(rows.map(apiProduct)));
});

router.post("/admin/products", adminOnly, async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [product] = await db
    .insert(productsTable)
    .values({ ...parsed.data, status: "pending", rejectionReason: null })
    .returning();
  res.status(201).json(CreateProductResponse.parse(apiProduct(product)));
});

router.patch(
  "/admin/products/:id",
  adminOnly,
  async (req, res): Promise<void> => {
    const params = UpdateProductParams.safeParse(req.params);
    const body = UpdateProductBody.safeParse(req.body);
    if (!params.success || !body.success) {
      res.status(400).json({
        error: !params.success
          ? params.error.message
          : (body.error?.message ?? "Invalid request body"),
      });
      return;
    }
    const [product] = await db
      .update(productsTable)
      .set({ ...body.data, status: "pending", rejectionReason: null })
      .where(eq(productsTable.id, params.data.id))
      .returning();
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(UpdateProductResponse.parse(apiProduct(product)));
  },
);

router.delete(
  "/admin/products/:id",
  adminOnly,
  async (req, res): Promise<void> => {
    const params = DeleteProductParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const [product] = await db
      .delete(productsTable)
      .where(eq(productsTable.id, params.data.id))
      .returning();
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.sendStatus(204);
  },
);

router.post(
  "/admin/products/:id/approval",
  adminOnly,
  async (req, res): Promise<void> => {
    const params = ModerateProductParams.safeParse(req.params);
    const body = ModerateProductBody.safeParse(req.body);
    if (!params.success || !body.success) {
      res.status(400).json({
        error: !params.success
          ? params.error.message
          : (body.error?.message ?? "Invalid request body"),
      });
      return;
    }
    if (body.data.status === "rejected" && !body.data.rejectionReason?.trim()) {
      res.status(400).json({ error: "A rejection reason is required" });
      return;
    }
    const [product] = await db
      .update(productsTable)
      .set({
        status: body.data.status,
        rejectionReason:
          body.data.status === "rejected"
            ? body.data.rejectionReason!.trim()
            : null,
      })
      .where(eq(productsTable.id, params.data.id))
      .returning();
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(ModerateProductResponse.parse(apiProduct(product)));
  },
);

router.get("/admin/orders", adminOnly, async (req, res): Promise<void> => {
  const parsed = ListAdminOrdersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const rows =
    !parsed.data.status || parsed.data.status === "all"
      ? await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt))
      : await db
          .select()
          .from(ordersTable)
          .where(eq(ordersTable.status, parsed.data.status))
          .orderBy(desc(ordersTable.createdAt));
  const response = await apiOrders(rows);
  res.json(ListAdminOrdersResponse.parse(response));
});

router.patch(
  "/admin/orders/:id",
  adminOnly,
  async (req, res): Promise<void> => {
    const params = UpdateOrderStatusParams.safeParse(req.params);
    const body = UpdateOrderStatusBody.safeParse(req.body);
    if (!params.success || !body.success) {
      res.status(400).json({
        error: !params.success
          ? params.error.message
          : (body.error?.message ?? "Invalid request body"),
      });
      return;
    }
    const [order] = await db
      .update(ordersTable)
      .set({ status: body.data.status })
      .where(eq(ordersTable.id, params.data.id))
      .returning();
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    const items = await db
      .select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.orderId, order.id));
    res.json(
      UpdateOrderStatusResponse.parse({
        ...order,
        createdAt: order.createdAt.toISOString(),
        items,
      }),
    );
  },
);

router.get("/admin/agencies", adminOnly, async (_req, res): Promise<void> => {
  const agencies = await db
    .select()
    .from(agenciesTable)
    .orderBy(desc(agenciesTable.createdAt));
  res.json(ListAgenciesResponse.parse(agencies));
});

router.post("/admin/agencies", adminOnly, async (req, res): Promise<void> => {
  const parsed = CreateAgencyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [agency] = await db
    .insert(agenciesTable)
    .values(parsed.data)
    .returning();
  res.status(201).json(CreateAgencyResponse.parse(agency));
});

router.patch(
  "/admin/agencies/:id",
  adminOnly,
  async (req, res): Promise<void> => {
    const params = UpdateAgencyParams.safeParse(req.params);
    const body = UpdateAgencyBody.safeParse(req.body);
    if (!params.success || !body.success) {
      res.status(400).json({
        error: !params.success
          ? params.error.message
          : (body.error?.message ?? "Invalid request body"),
      });
      return;
    }
    const [agency] = await db
      .update(agenciesTable)
      .set(body.data)
      .where(eq(agenciesTable.id, params.data.id))
      .returning();
    if (!agency) {
      res.status(404).json({ error: "Agency not found" });
      return;
    }
    res.json(UpdateAgencyResponse.parse(agency));
  },
);

export default router;
