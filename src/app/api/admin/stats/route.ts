export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify admin role
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalUsers, totalAnalyses, analysesToday, users] = await Promise.all([
    prisma.user.count(),
    prisma.analysis.count(),
    prisma.analysis.count({
      where: { createdAt: { gte: today } },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        plan: true,
        role: true,
        createdAt: true,
        _count: { select: { analyses: true } },
      },
    }),
  ]);

  // Privacy by design: no analysis results in admin response
  return NextResponse.json({
    totalUsers,
    totalAnalyses,
    analysesToday,
    users,
  });
}
