import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { askGemini, type ChatMessage } from "@/lib/gemini";
import { SHIPPING_STATUS_LABELS } from "@/lib/tracking";

const SITE_MAP = `
Pages on this store:
- / — homepage
- /shop — full product catalog
- /shop/[slug] — a single product's page (add to cart from here)
- /cart — the shopping cart
- /checkout — place an order (requires being signed in)
- /login and /signup — sign in / create an account
- /account — profile + order history (requires being signed in)
- /account/orders/[id] — a single order's status, tracking link, and items
`;

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "The AI assistant isn't configured yet — add a free GEMINI_API_KEY (see README)." },
      { status: 400 },
    );
  }

  const { messages } = (await req.json().catch(() => ({}))) as { messages?: ChatMessage[] };
  if (!messages?.length) return NextResponse.json({ error: "messages required" }, { status: 400 });

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let orderContext = "The visitor is not signed in, so you don't have access to any order details for them.";
  if (user) {
    // RLS restricts this to the signed-in user's own orders — safe even though the AI
    // decides how to use it.
    const { data: orders } = await supabase
      .from("orders")
      .select("id, shipping_status, carrier, tracking_number, display_total, display_currency, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (orders && orders.length > 0) {
      const lines = orders.map(
        (o) =>
          `- Order #${o.id.slice(0, 8)} (placed ${new Date(o.created_at).toLocaleDateString()}): ` +
          `${SHIPPING_STATUS_LABELS[o.shipping_status] ?? o.shipping_status}` +
          `${o.carrier ? `, carrier ${o.carrier}` : ""}${o.tracking_number ? `, tracking # ${o.tracking_number}` : ""}` +
          `, total ${o.display_currency} ${o.display_total}. Link: /account/orders/${o.id}`,
      );
      orderContext = `The signed-in customer's recent orders:\n${lines.join("\n")}`;
    } else {
      orderContext = "The visitor is signed in but has no orders yet.";
    }
  }

  const systemPrompt = `You are the helpful shopping assistant for EMBZ DESIGNZ, an online streetwear store.
Answer questions about products, orders, shipping/tracking, and help the visitor navigate the site.
Be concise (2-4 sentences). When pointing someone to a page, mention its path (e.g. "/account/orders/...")
so the app can turn it into a link. Never invent order details or tracking numbers — only use what's given below.
If you don't know something, say so and suggest contacting support.

${SITE_MAP}

${orderContext}`;

  try {
    const reply = await askGemini(systemPrompt, messages);
    return NextResponse.json({ reply });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Assistant is temporarily unavailable." }, { status: 500 });
  }
}
