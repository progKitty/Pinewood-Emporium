import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80) || "item";
}

const applySchema = z.object({
  display_name: z.string().trim().min(2).max(80),
  bio: z.string().trim().max(1000).optional().nullable(),
  location: z.string().trim().max(120).optional().nullable(),
  website: z.string().trim().max(200).url().optional().or(z.literal("")).nullable(),
});

export const applyAsCreator = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => applySchema.parse(input))
  .handler(async ({ data, context }) => {
    const row = {
      id: context.userId,
      display_name: data.display_name,
      bio: data.bio ?? null,
      location: data.location ?? null,
      website: data.website && data.website.length > 0 ? data.website : null,
      status: "approved",
    };
    const { error } = await supabaseAdmin
      .from("creators")
      .upsert(row, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateCreatorProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => applySchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await supabaseAdmin
      .from("creators")
      .update({
        display_name: data.display_name,
        bio: data.bio ?? null,
        location: data.location ?? null,
        website: data.website && data.website.length > 0 ? data.website : null,
      })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const productInput = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z.string().trim().max(120).optional().nullable(),
  description: z.string().trim().max(5000).optional().nullable(),
  price_cents: z.number().int().min(0).max(100_000_000),
  compare_at_cents: z.number().int().min(0).max(100_000_000).optional().nullable(),
  stock: z.number().int().min(0).max(1_000_000),
  active: z.boolean(),
  category_id: z.string().uuid().optional().nullable(),
  images: z.array(z.string().min(1).max(1000)).max(10).default([]),
  video_url: z.string().max(1000).optional().nullable(),
});

async function assertCreator(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("creators")
    .select("id, status")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data || data.status !== "approved") {
    throw new Error("You must be an approved creator to do that.");
  }
}

export const creatorListMyProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertCreator(context.userId);
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(
        "id, slug, title, description, price_cents, compare_at_cents, stock, active, category_id, images, video_url, updated_at",
      )
      .eq("creator_id", context.userId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const creatorUpsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid().optional().nullable(), values: productInput }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertCreator(context.userId);
    const v = data.values;
    const slug = (v.slug && v.slug.trim()) ? slugify(v.slug) : slugify(v.title);
    const row = {
      title: v.title,
      slug,
      description: v.description ?? null,
      price_cents: v.price_cents,
      compare_at_cents: v.compare_at_cents ?? null,
      stock: v.stock,
      active: v.active,
      category_id: v.category_id ?? null,
      images: v.images,
      video_url: v.video_url && v.video_url.length > 0 ? v.video_url : null,
      creator_id: context.userId,
    };
    if (data.id) {
      // Ownership enforced by RLS + explicit eq
      const { error } = await supabaseAdmin
        .from("products")
        .update(row)
        .eq("id", data.id)
        .eq("creator_id", context.userId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: inserted, error } = await supabaseAdmin
      .from("products")
      .insert(row)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: inserted.id };
  });

export const creatorDeleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertCreator(context.userId);
    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", data.id)
      .eq("creator_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Top-selling products by units sold (falls back to newest if no sales). */
export const getBestSellers = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data: items, error } = await supabaseAdmin
      .from("order_items")
      .select("product_id, qty");
    if (error) throw new Error(error.message);

    const totals = new Map<string, number>();
    for (const i of items ?? []) {
      if (!i.product_id) continue;
      totals.set(i.product_id, (totals.get(i.product_id) ?? 0) + (i.qty ?? 0));
    }
    const topIds = [...totals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([id]) => id);

    let products: any[] = [];
    if (topIds.length > 0) {
      const { data, error: pErr } = await supabaseAdmin
        .from("products")
        .select("id, slug, title, price_cents, compare_at_cents, stock, images")
        .in("id", topIds)
        .eq("active", true);
      if (pErr) throw new Error(pErr.message);
      products = (data ?? []).sort(
        (a, b) => (totals.get(b.id) ?? 0) - (totals.get(a.id) ?? 0),
      );
    }

    // Fallback: newest 8 if no sales yet
    if (products.length < 4) {
      const { data, error: nErr } = await supabaseAdmin
        .from("products")
        .select("id, slug, title, price_cents, compare_at_cents, stock, images")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(8);
      if (nErr) throw new Error(nErr.message);
      const seen = new Set(products.map((p) => p.id));
      for (const p of data ?? []) {
        if (!seen.has(p.id)) {
          products.push(p);
          if (products.length >= 8) break;
        }
      }
    }

    return products.slice(0, 8).map((p) => ({
      ...p,
      units_sold: totals.get(p.id) ?? 0,
    }));
  });
