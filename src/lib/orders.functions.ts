import { fetchApi } from "./api-client";

export async function createCheckoutSession({ data }: { data: any }) {
  // Fetch products to calculate total
  const products: any[] = await fetchApi(`/shop/products/`);

  let totalAmount = 0;
  const orderItems = [];
  
  for (const item of data.items) {
    const product = products.find((p: any) => p.id === item.id);
    if (!product) throw new Error(`Product ${item.id} not found`);
    totalAmount += parseFloat(product.price) * item.quantity;
    orderItems.push({
      product: product.id,
      quantity: item.quantity,
      price: product.price
    });
  }

  const orderRow = {
    status: "PENDING",
    total_amount: totalAmount.toString(),
    shipping_address: `${data.shipping.name}, ${data.shipping.address}, ${data.shipping.city}, ${data.shipping.phone}`,
  };

  const newOrder = await fetchApi(`/shop/orders/`, { method: "POST", body: orderRow });

  // For now, return orderId
  return { orderId: newOrder.id };
}

export async function getOrder({ data }: { data: { id: string | number } }) {
  return fetchApi(`/shop/orders/${data.id}/`);
}

export async function listMyOrders() {
  return fetchApi(`/shop/orders/`);
}
