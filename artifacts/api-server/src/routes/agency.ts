import { and, desc, eq, inArray } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  GetAgencySettingsResponse,
  GetAgencySummaryResponse,
  UpdateMyAgencyBody,
  UpdateMyAgencyResponse,
} from "@workspace/api-zod";
import {
  agenciesTable,
  db,
  orderItemsTable,
  ordersTable,
} from "@workspace/db";
import { currentAuthContext, requireRole } from "../lib/auth";

const router: IRouter = Router();
const agencyOnly = requireRole("agency");

async function findMyAgency(agencySlug: string | null) {
  if (!agencySlug) return null;
  const [agency] = await db
    .select()
    .from(agenciesTable)
    .where(and(eq(agenciesTable.slug, agencySlug), eq(agenciesTable.active, true)))
    .limit(1);
  return agency ?? null;
}

async function orderRows(rows: (typeof ordersTable.$inferSelect)[]) {
  if (!rows.length) return [];
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

router.get(
  "/agency/settings",
  agencyOnly,
  async (_req, res): Promise<void> => {
    const auth = currentAuthContext(res);
    const agency = await findMyAgency(auth.agencySlug);
    if (!agency) {
      res.status(404).json({ error: "Agency profile not found" });
      return;
    }
    res.json(GetAgencySettingsResponse.parse(agency));
  },
);

router.patch(
  "/agency/settings",
  agencyOnly,
  async (req, res): Promise<void> => {
    const auth = currentAuthContext(res);
    const parsed = UpdateMyAgencyBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const agency = await findMyAgency(auth.agencySlug);
    if (!agency) {
      res.status(404).json({ error: "Agency profile not found" });
      return;
    }
    const [updated] = await db
      .update(agenciesTable)
      .set(parsed.data)
      .where(eq(agenciesTable.id, agency.id))
      .returning();
    res.json(UpdateMyAgencyResponse.parse(updated));
  },
);

router.get(
  "/agency/summary",
  agencyOnly,
  async (_req, res): Promise<void> => {
    const auth = currentAuthContext(res);
    const agency = await findMyAgency(auth.agencySlug);
    if (!agency) {
      res.status(404).json({ error: "Agency profile not found" });
      return;
    }
    const orders = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.agencyId, agency.id))
      .orderBy(desc(ordersTable.createdAt));
    const response = {
      orderCount: orders.length,
      openOrders: orders.filter(
        (order) => !["completed", "cancelled"].includes(order.status),
      ).length,
      totalRevenue: orders
        .filter((order) => order.status !== "cancelled")
        .reduce((sum, order) => sum + order.total, 0),
      recentOrders: await orderRows(orders.slice(0, 8)),
    };
    res.json(GetAgencySummaryResponse.parse(response));
  },
);

export default router;
