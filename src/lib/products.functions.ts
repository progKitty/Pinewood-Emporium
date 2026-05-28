import { fetchApi } from "./api-client";
import { z } from "zod";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80) || "item";
}

export async function adminListProducts() {
  return fetchApi("/shop/products/");
}

export async function adminUpsertProduct({ data }: { data: { id?: string | number, values: any } }) {
  const v = data.values;
  const slug = (v.slug && v.slug.trim()) ? slugify(v.slug) : slugify(v.title);
  const row = {
    title: v.title,
    slug,
    description: v.description ?? "",
    price: v.price_cents ? (v.price_cents / 100).toString() : "0.00", // assuming backend wants Decimal
    stock: v.stock,
    active: v.active,
    category: v.category_id ?? null,
  };
  
  if (data.id) {
    await fetchApi(`/shop/products/${data.id}/`, { method: "PUT", body: row });
    return { id: data.id };
  }
  const inserted = await fetchApi(`/shop/products/`, { method: "POST", body: row });
  return { id: inserted.id };
}

export async function adminDeleteProduct({ data }: { data: { id: string | number } }) {
  await fetchApi(`/shop/products/${data.id}/`, { method: "DELETE" });
  return { ok: true };
}
