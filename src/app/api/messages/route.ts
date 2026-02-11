import { prisma } from "@/lib/prisma";
import { messageSchema } from "@/lib/validators";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get("matchId");

  if (!matchId) {
    return NextResponse.json({ error: "matchId is required" }, { status: 400 });
  }

  const messages = await prisma.message.findMany({
    where: { matchId },
    include: { sender: true },
    orderBy: { createdAt: "asc" }
  });

  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = messageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: parsed.data
  });

  return NextResponse.json(message, { status: 201 });
}

