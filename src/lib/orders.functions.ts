import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const lineItemSchema = z.object({
  productId: z.string().uuid(),
  qty: z.number().int().min(1).max(99),
});

const placeOrderSchema = z.object({
  paymentMethod: z.enum(["cod", "bkash", "nagad", "rocket"]),
  paymentReference: z.string().trim().max(80).optional().nullable(),
  shipping: z.object({
    fullName: z.string().trim().min(1).max(120),
    phone: z.string().trim().min(6).max(30),
    line1: z.string().trim().min(1).max(200),
    line2: z.string().trim().max(200).optional().nullable(),
    city: z.string().trim().min(1).max(80),
    district: z.string().trim().max(80).optional().nullable(),
    postalCode: z.string().trim().max(20).optional().nullable(),
    country: z.string().trim().min(1).max(80).default("Bangladesh"),
  }),
  items: z.array(lineItemSchema).min(1).max(50),
  notes: z.string().trim().max(500).optional().nullable(),
});

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => placeOrderSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Re-fetch product prices server-side (NEVER trust client prices)
    const productIds = data.items.map((i) => i.productId);
    const { data: products, error: pErr } = await supabase
      .from("products")
      .select("id, title, price_cents, stock, images, active")
      .in("id", productIds);

    if (pErr) throw new Error(pErr.message);
    if (!products || products.length !== productIds.length) {
      throw new Error("One or more products are unavailable.");
    }

    let subtotalCents = 0;
    const orderItemsInput = data.items.map((line) => {
      const p = products.find((pp) => pp.id === line.productId);
      if (!p || !p.active) throw new Error(`Unavailable: ${line.productId}`);
      if (p.stock < line.qty) throw new Error(`Insufficient stock for ${p.title}`);
      const lineTotal = p.price_cents * line.qty;
      subtotalCents += lineTotal;
      const imgs = Array.isArray(p.images) ? (p.images as unknown[]) : [];
      const firstImg = typeof imgs[0] === "string" ? (imgs[0] as string) : null;
      return {
        product_id: p.id,
        title_snapshot: p.title,
        image_snapshot: firstImg,
        unit_price_cents: p.price_cents,
        qty: line.qty,
        line_total_cents: lineTotal,
      };
    });

    const shippingCents = subtotalCents >= 500000 ? 0 : 12000;
    const totalCents = subtotalCents + shippingCents;

    const notesWithRef =
      data.paymentReference && data.paymentMethod !== "cod"
        ? `${data.paymentMethod.toUpperCase()} txn: ${data.paymentReference}${data.notes ? `\n${data.notes}` : ""}`
        : data.notes ?? null;

    const { data: order, error: oErr } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        subtotal_cents: subtotalCents,
        shipping_cents: shippingCents,
        total_cents: totalCents,
        payment_method: data.paymentMethod,
        payment_status: "pending",
        status: "pending",
        shipping_full_name: data.shipping.fullName,
        shipping_phone: data.shipping.phone,
        shipping_line1: data.shipping.line1,
        shipping_line2: data.shipping.line2 ?? null,
        shipping_city: data.shipping.city,
        shipping_district: data.shipping.district ?? null,
        shipping_postal_code: data.shipping.postalCode ?? null,
        shipping_country: data.shipping.country,
        notes: notesWithRef,
      })
      .select("id, order_number")
      .single();

    if (oErr || !order) throw new Error(oErr?.message ?? "Failed to create order");

    const { error: iErr } = await supabase.from("order_items").insert(
      orderItemsInput.map((i) => ({ ...i, order_id: order.id })),
    );
    if (iErr) throw new Error(iErr.message);

    return { orderId: order.id, orderNumber: order.order_number };
  });

export const getMyOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ orderId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", data.orderId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) throw new Error("Order not found");

    const { data: items, error: iErr } = await supabase
      .from("order_items")
      .select("id, title_snapshot, image_snapshot, unit_price_cents, qty, line_total_cents")
      .eq("order_id", data.orderId);
    if (iErr) throw new Error(iErr.message);

    return { order, items: items ?? [] };
  });

export const listMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("orders")
      .select("id, order_number, status, payment_status, payment_method, total_cents, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
