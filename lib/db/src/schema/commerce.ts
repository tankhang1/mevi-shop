import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const agenciesTable = pgTable("mevi_agencies", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  displayName: text("display_name").notNull(),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").notNull().default("#587A3E"),
  contactName: text("contact_name").notNull().default(""),
  contactPhone: text("contact_phone").notNull().default(""),
  contactEmail: text("contact_email").notNull().default(""),
  active: boolean("active").notNull().default(true),
  clerkUserId: text("clerk_user_id").unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const productsTable = pgTable("mevi_products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  category: text("category").notNull(),
  description: text("description").notNull().default(""),
  origin: text("origin").notNull().default(""),
  packageSize: text("package_size").notNull().default(""),
  shelfLife: text("shelf_life").notNull().default(""),
  storageInstructions: text("storage_instructions").notNull().default(""),
  imageUrls: text("image_urls")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  price: integer("price").notNull(),
  salePrice: integer("sale_price"),
  status: text("status", { enum: ["pending", "approved", "rejected"] })
    .notNull()
    .default("approved"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const ordersTable = pgTable("mevi_orders", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  province: text("province").notNull(),
  district: text("district").notNull(),
  note: text("note"),
  total: integer("total").notNull(),
  status: text("status", {
    enum: [
      "new",
      "confirmed",
      "processing",
      "shipped",
      "completed",
      "cancelled",
    ],
  })
    .notNull()
    .default("new"),
  agencyId: integer("agency_id").references(() => agenciesTable.id, {
    onDelete: "set null",
  }),
  agencySlug: text("agency_slug"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const orderItemsTable = pgTable("mevi_order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => ordersTable.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(),
  lineTotal: integer("line_total").notNull(),
});

export type Product = typeof productsTable.$inferSelect;
export type NewProduct = typeof productsTable.$inferInsert;
export type Agency = typeof agenciesTable.$inferSelect;
export type NewAgency = typeof agenciesTable.$inferInsert;
export type Order = typeof ordersTable.$inferSelect;
export type OrderItem = typeof orderItemsTable.$inferSelect;
