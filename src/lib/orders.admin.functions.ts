import { fetchApi } from "./api-client";

export async function adminListOrders() {
  return fetchApi(`/shop/orders/`);
}

export async function adminGetOrder({ data }: { data: { id: string | number } }) {
  return fetchApi(`/shop/orders/${data.id}/`);
}

export async function adminUpdateOrder({ data }: { data: { id: string | number, status?: string } }) {
  const patch: Record<string, unknown> = {};
  if (data.status) patch.status = data.status;
  if (Object.keys(patch).length === 0) return { ok: true };
  await fetchApi(`/shop/orders/${data.id}/`, { method: "PATCH", body: patch });
  return { ok: true };
}
