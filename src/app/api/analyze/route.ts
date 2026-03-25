import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const API_URL = process.env.OPENMETHYL_API_URL || "http://127.0.0.1:8901";

export async function POST(request: NextRequest) {
  // Check auth
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { detail: "Authentication required. Please sign in." },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const tier = (formData.get("tier") as string) || "tier1";

    // Compute file hash for dedup (SHA256 of content)
    let fileHash: string | null = null;
    let fileSize: number | null = null;
    let filename: string | null = null;

    if (file) {
      filename = file.name.replace(/[^\w.\-]/g, "_"); // sanitize
      fileSize = file.size;
      const buffer = Buffer.from(await file.arrayBuffer());
      fileHash = crypto.createHash("sha256").update(buffer).digest("hex");

      // Check for duplicate
      const existing = await prisma.analysis.findFirst({
        where: {
          userId: session.user.id,
          fileHash,
          status: "completed",
        },
        orderBy: { createdAt: "desc" },
      });

      if (existing) {
        return NextResponse.json({
          ...(existing.results as Record<string, unknown>),
          _duplicate: true,
          _existingId: existing.id,
          _message: "This file has been analyzed before.",
        });
      }
    }

    // Forward to backend
    const backendForm = new FormData();
    if (file) backendForm.append("file", file);
    backendForm.append("tier", tier);

    const startMs = Date.now();
    const response = await fetch(`${API_URL}/analyze`, {
      method: "POST",
      body: backendForm,
    });

    const data = await response.json();
    const processingMs = Date.now() - startMs;

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Extract metadata from results
    const clocksUsed = data.results?.clocks
      ? Object.keys(data.results.clocks)
      : [];
    const cpgCount = data.results?.cpg_sites || data.validation?.cpg_sites || null;
    const sampleCount = data.results?.samples || data.validation?.samples || null;

    // Compute expiration for free tier
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });
    const expiresAt =
      user?.plan === "free"
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        : null;

    // Save to DB — only results JSON, never raw genetic data
    const analysis = await prisma.analysis.create({
      data: {
        userId: session.user.id,
        filename,
        fileHash,
        fileSize,
        cpgCount,
        sampleCount,
        tier,
        clocksUsed,
        results: data,
        status: "completed",
        processingMs,
        expiresAt,
      },
    });

    return NextResponse.json({
      ...data,
      _analysisId: analysis.id,
    });
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { detail: "Analysis service unavailable. Please try again later." },
      { status: 502 }
    );
  }
}
