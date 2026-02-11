import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const matches = await prisma.match.findMany({
    where: {
      OR: [{ renterId: userId }, { landlordId: userId }]
    },
    include: {
      listing: { include: { media: true } },
      renter: { include: { profile: true } },
      landlord: { include: { profile: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(matches);
}

