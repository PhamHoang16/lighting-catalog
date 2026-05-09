import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import type { Post, PostInsert, PostUpdate } from "@/lib/types/database";
import type { DBPost } from "@/lib/db/types";

function normalizePost(row: DBPost): Post {
    return {
        ...row,
        created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    };
}

// ── Read ─────────────────────────────────────────────────────────

export async function getPublishedPosts(limit = 20): Promise<Post[]> {
    const rows = await db
        .select()
        .from(posts)
        .where(eq(posts.is_published, true))
        .orderBy(desc(posts.created_at))
        .limit(limit);
    return rows.map(normalizePost);
}

export async function getFeaturedPosts(limit = 6): Promise<Post[]> {
    const rows = await db
        .select()
        .from(posts)
        .where(and(eq(posts.is_published, true), eq(posts.is_featured, true)))
        .orderBy(desc(posts.created_at))
        .limit(limit);
    return rows.map(normalizePost);
}

export async function getPopularPosts(limit = 6): Promise<Post[]> {
    const rows = await db
        .select()
        .from(posts)
        .where(and(eq(posts.is_published, true), eq(posts.is_popular, true)))
        .orderBy(desc(posts.created_at))
        .limit(limit);
    return rows.map(normalizePost);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
    const row = await db.query.posts.findFirst({
        where: eq(posts.slug, slug),
    });
    if (!row) return null;
    return normalizePost(row);
}

export async function getAllPostsForAdmin(): Promise<Post[]> {
    const rows = await db
        .select()
        .from(posts)
        .orderBy(desc(posts.created_at));
    return rows.map(normalizePost);
}

export async function getPostSlugs(limit = 20): Promise<{ slug: string }[]> {
    return db
        .select({ slug: posts.slug })
        .from(posts)
        .where(eq(posts.is_published, true))
        .orderBy(desc(posts.created_at))
        .limit(limit);
}

// ── Write ─────────────────────────────────────────────────────────

export async function createPost(data: PostInsert): Promise<Post> {
    const { created_at: _, ...rest } = data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await db.insert(posts).values(rest as any).returning();
    return normalizePost(rows[0]!);
}

export async function updatePost(id: string, data: PostUpdate): Promise<void> {
    const { created_at: _, ...rest } = data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.update(posts).set(rest as any).where(eq(posts.id, id));
}

export async function deletePost(id: string): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
}
