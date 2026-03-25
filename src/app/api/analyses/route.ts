export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const analyses = await prisma.analysis.findMany({
    where: {
      userId: session.user.id,
      // Exclude expired analyses for free users
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      filename: true,
      tier: true,
      clocksUsed: true,
      status: true,
      cpgCount: true,
      sampleCount: true,
      processingMs: true,
      createdAt: true,
      results: true,
    },
  });

  return NextResponse.json({ analyses });
}
