import { fetchApi } from "./api-client";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80) || "item";
}

export async function applyAsCreator({ data }: { data: any }) {
  const row = {
    store_name: data.display_name,
    description: data.bio ?? "",
  };
  await fetchApi(`/vendor/profiles/`, { method: "POST", body: row });
  return { ok: true };
}

export async function updateCreatorProfile({ data }: { data: any }) {
  const row = {
    store_name: data.display_name,
    description: data.bio ?? "",
  };
  // TODO: Implement PATCH endpoint for vendor profile
  // await fetchApi(`/vendor/profiles/me/`, { method: "PATCH", body: row });
  return { ok: true };
}

export async function creatorListMyProducts() {
  return fetchApi(`/shop/products/`);
}

export async function creatorUpsertProduct({ data }: { data: { id?: string | number, values: any } }) {
  const v = data.values;
  const slug = (v.slug && v.slug.trim()) ? slugify(v.slug) : slugify(v.title);
  const row = {
    title: v.title,
    slug,
    description: v.description ?? "",
    price: v.price_cents ? (v.price_cents / 100).toString() : "0.00",
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

export async function creatorDeleteProduct({ data }: { data: { id: string | number } }) {
  await fetchApi(`/shop/products/${data.id}/`, { method: "DELETE" });
  return { ok: true };
}

export async function getBestSellers() {
  // Using the standard list for now
  return fetchApi(`/shop/products/`);
}
