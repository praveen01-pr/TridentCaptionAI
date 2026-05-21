import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!clientPromise) {
    return NextResponse.json(
      {
        ok: false,
        error: "MongoDB connection is not configured. Add MONGODB_URI to .env.local",
        captions: [],
      },
      { status: 200 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db("visioscribe");
    
    const captions = await db
      .collection("captions")
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    const serializedCaptions = captions.map((doc) => ({
      id: doc._id.toString(),
      caption: doc.caption,
      filename: doc.filename,
      fileSize: doc.fileSize,
      createdAt: doc.createdAt,
    }));

    return NextResponse.json({ ok: true, captions: serializedCaptions });
  } catch (error) {
    console.error("Failed to fetch caption history from MongoDB:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch caption history", captions: [] },
      { status: 500 }
    );
  }
}
