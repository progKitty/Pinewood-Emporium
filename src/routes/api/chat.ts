import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `You are the friendly customer support assistant for Pinewood Emporium — a Bangladesh-based shop selling curated leather goods, watches, home items, and outdoor gear. You also work with independent creators.

Help customers with:
- Product questions, sizing, materials, care
- Order status (ask them to share their order number; tell them they can also visit /order/<id>)
- Shipping (free on orders over BDT 5,000; flat BDT 120 otherwise; delivered across Bangladesh in 3–7 days)
- Payment methods: Cash on Delivery, bKash, Nagad, Rocket
- Returns within 7 days of delivery for unused items
- How to become a creator (point them to /collaborate)

Keep replies short (1–3 short paragraphs), warm, and concrete. If you don't know, say so and offer to forward the question to a human via /contact. Never invent prices, stock, or order details — direct them to the shop or contact page.`;

type ChatBody = { messages?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as ChatBody;
        if (!Array.isArray(messages)) {
          return new Response("messages required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        const result = streamText({
          model,
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
