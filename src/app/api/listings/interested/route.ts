import { SwipeDirection } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const landlordId = searchParams.get("landlordId");

  if (!landlordId) {
    return NextResponse.json({ error: "landlordId is required" }, { status: 400 });
  }

  const incoming = await prisma.swipe.findMany({
    where: {
      listing: { landlordId },
      renterId: { not: null },
      direction: SwipeDirection.RIGHT
    },
    include: {
      renter: {
        include: { profile: true }
      },
      listing: {
        include: { media: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const uniqueKey = new Set<string>();
  const cards = incoming.filter((item) => {
    const key = `${item.listingId}:${item.renterId}`;
    if (uniqueKey.has(key)) return false;
    uniqueKey.add(key);
    return true;
  });

  return NextResponse.json(cards);
}

