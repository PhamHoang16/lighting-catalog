// ── Drizzle schema cho lighting-catalog ─────────────────────────
// Tương ứng 1-1 với schema Supabase trước đây (sql/*.sql).
// Bảng admin_users là mới, thay thế Supabase Auth.

import {
    pgTable,
    uuid,
    text,
    boolean,
    integer,
    timestamp,
    jsonb,
    numeric,
    varchar,
    index,
    AnyPgColumn,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type {
    SpecItem,
    VariantsData,
    OrderItem,
} from "@/lib/types/database";

// ── banners ─────────────────────────────────────────────────────
export const banners = pgTable("banners", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }),
    image_url: text("image_url").notNull(),
    link_url: text("link_url"),
    is_active: boolean("is_active").default(true).notNull(),
    sort_order: integer("sort_order").default(0).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── categories (đa cấp qua parent_id) ───────────────────────────
export const categories = pgTable(
    "categories",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        name: text("name").notNull(),
        slug: text("slug").notNull().unique(),
        // Self-reference: parent category
        parent_id: uuid("parent_id").references((): AnyPgColumn => categories.id, {
            onDelete: "set null",
        }),
        image_url: text("image_url"),
        description: text("description"),
        sort_order: integer("sort_order").default(0).notNull(),
        created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (t) => [
        index("idx_categories_parent_id").on(t.parent_id),
        index("idx_categories_sort_order").on(t.sort_order),
    ]
);

// ── brands ──────────────────────────────────────────────────────
export const brands = pgTable("brands", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    logo_url: text("logo_url"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── products ────────────────────────────────────────────────────
export const products = pgTable(
    "products",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        name: text("name").notNull(),
        slug: text("slug").notNull().unique(),
        // numeric → string ở Drizzle. Chuyển sang number ở query layer.
        price: numeric("price", { precision: 12, scale: 0 }).notNull(),
        image_url: text("image_url"),
        gallery: text("gallery").array(),
        description: text("description"),
        specs: jsonb("specs").$type<SpecItem[]>(),
        variants: jsonb("variants").$type<VariantsData>(),
        category_id: uuid("category_id")
            .notNull()
            .references(() => categories.id, { onDelete: "restrict" }),
        brand_id: uuid("brand_id").references(() => brands.id, { onDelete: "set null" }),
        is_best_seller: boolean("is_best_seller").default(false).notNull(),
        sort_order: integer("sort_order").default(0).notNull(),
        created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (t) => [
        index("idx_products_brand_id").on(t.brand_id),
        index("idx_products_best_seller").on(t.is_best_seller),
        index("idx_products_sort_order_created").on(t.sort_order, t.created_at),
    ]
);

// ── orders ──────────────────────────────────────────────────────
// status: 'pending' | 'processing' | 'completed' | 'cancelled' (trùng với OrderStatus type)
export const orders = pgTable("orders", {
    id: uuid("id").primaryKey().defaultRandom(),
    customer_name: text("customer_name").notNull(),
    phone: text("phone").notNull(),
    title: varchar("title", { length: 10 }).default("anh"),
    message: text("message"),
    delivery_method: varchar("delivery_method", { length: 20 }).default("delivery").notNull(),
    address: text("address"),
    card_at_home: boolean("card_at_home").default(false).notNull(),
    invoice_company: boolean("invoice_company").default(false).notNull(),
    total_amount: numeric("total_amount", { precision: 12, scale: 0 }).default("0").notNull(),
    status: text("status").default("pending").notNull(),
    items: jsonb("items").$type<OrderItem[]>().notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── posts ───────────────────────────────────────────────────────
export const posts = pgTable(
    "posts",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        title: text("title").notNull(),
        slug: text("slug").notNull().unique(),
        thumbnail_url: text("thumbnail_url"),
        summary: text("summary"),
        content: text("content"),
        is_published: boolean("is_published").default(false).notNull(),
        is_featured: boolean("is_featured").default(false).notNull(),
        is_popular: boolean("is_popular").default(false).notNull(),
        created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (t) => [
        index("idx_posts_slug").on(t.slug),
        index("idx_posts_created_at").on(t.created_at.desc()),
    ]
);

// ── admin_users (thay Supabase Auth) ────────────────────────────
export const admin_users = pgTable("admin_users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    password_hash: text("password_hash").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── relations ───────────────────────────────────────────────────
// Drizzle relations cho phép query `with: { categories: true }` style.
export const productsRelations = relations(products, ({ one }) => ({
    categories: one(categories, {
        fields: [products.category_id],
        references: [categories.id],
    }),
    brands: one(brands, {
        fields: [products.brand_id],
        references: [brands.id],
    }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
    parent: one(categories, {
        fields: [categories.parent_id],
        references: [categories.id],
        relationName: "category_parent",
    }),
    children: many(categories, { relationName: "category_parent" }),
    products: many(products),
}));

export const brandsRelations = relations(brands, ({ many }) => ({
    products: many(products),
}));
