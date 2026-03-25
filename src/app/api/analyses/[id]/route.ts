import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const analysis = await prisma.analysis.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!analysis) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Check expiration
  if (analysis.expiresAt && analysis.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "This analysis has expired" },
      { status: 410 }
    );
  }

  return NextResponse.json({ analysis });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const analysis = await prisma.analysis.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!analysis) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.analysis.delete({ where: { id } });

  return NextResponse.json({ deleted: true });
}
