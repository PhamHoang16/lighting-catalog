import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq, desc, and, ilike, count as sqlCount } from "drizzle-orm";
import type { Order, OrderInsert, OrderUpdate, OrderStatus } from "@/lib/types/database";
import type { DBOrder } from "@/lib/db/types";

function normalizeOrder(row: DBOrder): Order {
    return {
        ...row,
        total_amount: Number(row.total_amount),
        created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    };
}

// ── Read ─────────────────────────────────────────────────────────

interface OrdersFilter {
    status?: OrderStatus | "";
    searchTerm?: string;
    page?: number;
    pageSize?: number;
}

export async function getOrders(filter: OrdersFilter = {}): Promise<{ data: Order[]; count: number }> {
    const { status, searchTerm, page = 0, pageSize = 20 } = filter;

    const conditions = [];
    if (status) conditions.push(eq(orders.status, status));
    if (searchTerm) conditions.push(ilike(orders.customer_name, `%${searchTerm}%`));

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = page * pageSize;

    const [rows, countResult] = await Promise.all([
        db.select().from(orders).where(where).orderBy(desc(orders.created_at)).limit(pageSize).offset(offset),
        db.select({ count: sqlCount() }).from(orders).where(where),
    ]);

    return {
        data: rows.map(normalizeOrder),
        count: Number(countResult[0]?.count ?? 0),
    };
}

export async function getOrderById(id: string): Promise<Order | null> {
    const row = await db.query.orders.findFirst({
        where: eq(orders.id, id),
    });
    if (!row) return null;
    return normalizeOrder(row);
}

// ── Write ─────────────────────────────────────────────────────────

export async function createOrder(data: OrderInsert): Promise<Order> {
    const { created_at: _, ...rest } = data;
    const rows = await db
        .insert(orders)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .values({ ...(rest as any), total_amount: String(data.total_amount ?? 0) })
        .returning();
    return normalizeOrder(rows[0]!);
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
    await db.update(orders).set({ status }).where(eq(orders.id, id));
}

export async function updateOrder(id: string, data: OrderUpdate): Promise<void> {
    const { created_at: _, ...rest } = data;
    const values: Record<string, unknown> = { ...rest };
    if (data.total_amount !== undefined) values.total_amount = String(data.total_amount);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.update(orders).set(values as any).where(eq(orders.id, id));
}
