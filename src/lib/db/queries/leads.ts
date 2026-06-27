import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { eq, desc, count as sqlCount } from "drizzle-orm";
import type { Lead, LeadInsert, LeadStatus } from "@/lib/types/database";
import type { DBLead } from "@/lib/db/types";

function normalizeLead(row: DBLead): Lead {
    return {
        ...row,
        created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    };
}

// ── Read ─────────────────────────────────────────────────────────

interface LeadsFilter {
    page?: number;
    pageSize?: number;
}

export async function getLeads(filter: LeadsFilter = {}): Promise<{ data: Lead[]; count: number }> {
    const { page = 0, pageSize = 20 } = filter;
    const offset = page * pageSize;

    const [rows, countResult] = await Promise.all([
        db.select().from(leads).orderBy(desc(leads.created_at)).limit(pageSize).offset(offset),
        db.select({ count: sqlCount() }).from(leads),
    ]);

    return {
        data: rows.map(normalizeLead),
        count: Number(countResult[0]?.count ?? 0),
    };
}

// ── Write ─────────────────────────────────────────────────────────

export async function createLead(data: LeadInsert): Promise<Lead> {
    const rows = await db
        .insert(leads)
        .values({ name: data.name, phone: data.phone, email: data.email ?? null })
        .returning();
    return normalizeLead(rows[0]!);
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
    await db.update(leads).set({ status }).where(eq(leads.id, id));
}

export async function deleteLead(id: string): Promise<void> {
    await db.delete(leads).where(eq(leads.id, id));
}
