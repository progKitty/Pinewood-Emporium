import { fetchApi } from "./api-client";

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80) || "category";
}

export async function adminListCategories() {
  return fetchApi(`/shop/categories/`);
}

export async function adminUpsertCategory({ data }: { data: { id?: string | number, values: any } }) {
  const v = data.values;
  const row = {
    name: v.name,
    slug: (v.slug && v.slug.trim()) ? slugify(v.slug) : slugify(v.name),
    description: v.description ?? "",
  };
  if (data.id) {
    await fetchApi(`/shop/categories/${data.id}/`, { method: "PUT", body: row });
    return { id: data.id };
  }
  const inserted = await fetchApi(`/shop/categories/`, { method: "POST", body: row });
  return { id: inserted.id };
}

export async function adminDeleteCategory({ data }: { data: { id: string | number } }) {
  await fetchApi(`/shop/categories/${data.id}/`, { method: "DELETE" });
  return { ok: true };
}
