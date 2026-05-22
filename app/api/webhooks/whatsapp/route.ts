import { type NextRequest, NextResponse } from "next/server";
import { inboundSchema } from "./_lib/inbound.schema";
import { processInbound } from "./_lib/inbound.service";

// POST /api/webhooks/whatsapp
//
// Demo authentication: a shared secret in the X-Demo-Secret header.
// Production should switch to HMAC-SHA256 over the raw body using a secret
// shared with the WhatsApp provider; that swap is a one-file change in this
// handler, the rest of the pipeline is unchanged.
//
// Acks fast (synchronously in this MVP). A production version would respond
// 200 immediately and process the body in a background worker via
// `waitUntil` so the provider doesn't retry on slow LLM calls.
export async function POST(request: NextRequest) {
  const expectedSecret = process.env.WHATSAPP_WEBHOOK_SECRET;
  if (!expectedSecret) {
    return NextResponse.json(
      { error: "webhook_secret_not_configured" },
      { status: 503 },
    );
  }

  const provided = request.headers.get("x-demo-secret");
  if (provided !== expectedSecret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = inboundSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "invalid_payload",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const result = await processInbound(parsed.data);
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      {
        error: "processing_failed",
        message: e instanceof Error ? e.message : "unknown error",
      },
      { status: 500 },
    );
  }
}