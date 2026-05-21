import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";

export const runtime = "nodejs";

function getFetchErrorMessage(error) {
  if (!(error instanceof Error)) {
    return String(error);
  }

  const cause = error.cause;
  return cause?.code
    ? `${error.message} (${cause.code}${cause.message ? `: ${cause.message}` : ""})`
    : error.message;
}

export async function POST(request) {
  const formData = await request.formData();
  const image = formData.get("image");

  if (!image || image.size === 0) {
    return NextResponse.json({ error: "No image file provided." }, { status: 400 });
  }

  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing HUGGINGFACE_API_KEY environment variable." },
      { status: 500 }
    );
  }

  const buffer = Buffer.from(await image.arrayBuffer());
  const imageUrl = `data:${image.type || "application/octet-stream"};base64,${buffer.toString("base64")}`;
  const model = process.env.HUGGINGFACE_MODEL ?? "CohereLabs/aya-vision-32b:cohere";

  const base =
    process.env.HUGGINGFACE_API_BASE_URL?.replace(/\/$/, "") ??
    "https://router.huggingface.co/v1";

  let response;
  try {
    const url = `${base}/chat/completions`;
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Describe this image in one concise sentence.",
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 80,
      }),
    });
  } catch (fetchError) {
    const message = getFetchErrorMessage(fetchError);
    return NextResponse.json(
      { error: `Failed to connect to Hugging Face inference API: ${message}` },
      { status: 502 }
    );
  }

  if (!response.ok) {
    const errorBody = await response.text();
    return NextResponse.json(
      { error: `Inference service error: ${response.status} ${errorBody}` },
      { status: 502 }
    );
  }

  const text = await response.text();
  if (!text) {
    return NextResponse.json(
      { error: "Inference service returned empty response." },
      { status: 502 }
    );
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch (parseError) {
    return NextResponse.json(
      { error: "Inference service returned invalid JSON.", details: text },
      { status: 502 }
    );
  }

  const content = data?.choices?.[0]?.message?.content;
  const caption =
    typeof content === "string"
      ? content
      : Array.isArray(content)
        ? content
            .map((part) => (typeof part?.text === "string" ? part.text : ""))
            .filter(Boolean)
            .join(" ")
        : "";

  const finalCaption = caption || "No caption returned.";

  // Save to MongoDB asynchronously if clientPromise is configured
  if (clientPromise) {
    try {
      const client = await clientPromise;
      const db = client.db("visioscribe");
      await db.collection("captions").insertOne({
        caption: finalCaption,
        filename: image.name || "unknown",
        fileSize: image.size,
        createdAt: new Date(),
      });
    } catch (dbError) {
      console.error("Failed to save caption to MongoDB:", dbError);
    }
  }

  return NextResponse.json({ caption: finalCaption });
}
