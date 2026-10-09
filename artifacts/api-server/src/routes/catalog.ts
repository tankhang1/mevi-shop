import { and, asc, desc, eq, gte, ilike, inArray, lte, or } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  CreateOrderBody,
  CreateOrderResponse,
  GetPublicAgencyParams,
  GetPublicAgencyResponse,
  GetProductParams,
  GetProductResponse,
  ListProductsQueryParams,
  ListProductsResponse,
} from "@workspace/api-zod";
import {
  agenciesTable,
  db,
  orderItemsTable,
  ordersTable,
  productsTable,
} from "@workspace/db";
import { randomUUID } from "node:crypto";

const router: IRouter = Router();

function apiProduct(product: typeof productsTable.$inferSelect) {
  return {
    ...product,
    createdAt: product.createdAt.toISOString(),
  };
}

function apiOrder(
  order: typeof ordersTable.$inferSelect,
  items: (typeof orderItemsTable.$inferSelect)[],
) {
  return {
    ...order,
    createdAt: order.createdAt.toISOString(),
    items,
  };
}

router.get("/products", async (req, res): Promise<void> => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { q, category, minPrice, maxPrice, sort } = parsed.data;
  const conditions = [eq(productsTable.status, "approved")];
  if (category) conditions.push(eq(productsTable.category, category));
  if (minPrice !== undefined) conditions.push(gte(productsTable.price, minPrice));
  if (maxPrice !== undefined) conditions.push(lte(productsTable.price, maxPrice));
  if (q?.trim()) {
    const term = `%${q.trim()}%`;
    const matching = or(
      ilike(productsTable.name, term),
      ilike(productsTable.category, term),
      ilike(productsTable.origin, term),
      ilike(productsTable.description, term),
    );
    if (matching) conditions.push(matching);
  }

  const orderBy =
    sort === "price-asc"
      ? asc(productsTable.price)
      : sort === "price-desc"
        ? desc(productsTable.price)
        : desc(productsTable.createdAt);
  const products = await db
    .select()
    .from(productsTable)
    .where(and(...conditions))
    .orderBy(orderBy);

  res.json(ListProductsResponse.parse(products.map(apiProduct)));
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const parsed = GetProductParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [product] = await db
    .select()
    .from(productsTable)
    .where(
      and(
        eq(productsTable.id, parsed.data.id),
        eq(productsTable.status, "approved"),
      ),
    )
    .limit(1);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(GetProductResponse.parse(apiProduct(product)));
});

router.get("/agencies/:slug", async (req, res): Promise<void> => {
  const parsed = GetPublicAgencyParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [agency] = await db
    .select()
    .from(agenciesTable)
    .where(
      and(
        eq(agenciesTable.slug, parsed.data.slug),
        eq(agenciesTable.active, true),
      ),
    )
    .limit(1);
  if (!agency) {
    res.status(404).json({ error: "Agency store not found" });
    return;
  }
  res.json(GetPublicAgencyResponse.parse(agency));
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const requestedIds = [...new Set(parsed.data.items.map((item) => item.productId))];
  const products = await db
    .select()
    .from(productsTable)
    .where(
      and(
        inArray(productsTable.id, requestedIds),
        eq(productsTable.status, "approved"),
      ),
    );
  const productsById = new Map(products.map((product) => [product.id, product]));
  if (productsById.size !== requestedIds.length) {
    res.status(400).json({ error: "One or more products are unavailable" });
    return;
  }

  const agencySlug = parsed.data.agencySlug;
  const [agency] = agencySlug
    ? await db
        .select()
        .from(agenciesTable)
        .where(and(eq(agenciesTable.slug, agencySlug), eq(agenciesTable.active, true)))
        .limit(1)
    : [];

  const orderLines = parsed.data.items.map((item) => {
    const product = productsById.get(item.productId)!;
    const unitPrice = product.salePrice ?? product.price;
    return {
      productId: product.id,
      productName: product.name,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
    };
  });
  const total = orderLines.reduce((sum, line) => sum + line.lineTotal, 0);
  const code = `MV-${new Date().toISOString().slice(2, 10).replaceAll("-", "")}-${randomUUID().slice(0, 6).toUpperCase()}`;

  const order = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(ordersTable)
      .values({
        code,
        customerName: parsed.data.customerName,
        phone: parsed.data.phone,
        address: parsed.data.address,
        province: parsed.data.province,
        district: parsed.data.district,
        note: parsed.data.note ?? null,
        total,
        status: "new",
        agencyId: agency?.id ?? null,
        agencySlug: agency?.slug ?? null,
      })
      .returning();
    const items = await tx
      .insert(orderItemsTable)
      .values(orderLines.map((line) => ({ orderId: created.id, ...line })))
      .returning();
    return apiOrder(created, items);
  });

  res.status(201).json(CreateOrderResponse.parse(order));
});

export default router;
