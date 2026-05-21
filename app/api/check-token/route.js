import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getFetchErrorMessage(error) {
  if (!(error instanceof Error)) {
    return String(error);
  }

  const cause = error.cause;
  return cause?.code
    ? `${error.message} (${cause.code}${cause.message ? `: ${cause.message}` : ""})`
    : error.message;
}

export async function GET() {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "Missing HUGGINGFACE_API_KEY" }, { status: 400 });
  }

  const base =
    process.env.HUGGINGFACE_API_BASE_URL?.replace(/\/$/, "") ??
    "https://router.huggingface.co/v1";

  try {
    const url = `${base}/models`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });

    if (res.status === 401) {
      return NextResponse.json({ ok: false, error: "Invalid API key (401)" }, { status: 401 });
    }

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ ok: false, status: res.status, details: text }, { status: 502 });
    }

    return NextResponse.json({ ok: true, status: res.status });
  } catch (err) {
    const message = getFetchErrorMessage(err);
    return NextResponse.json({ ok: false, error: `Network error: ${message}` }, { status: 502 });
  }
}
