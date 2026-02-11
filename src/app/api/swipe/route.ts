import { SwipeDirection } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { swipeSchema } from "@/lib/validators";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = swipeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { actorId, actorRole, listingId, renterId, direction } = parsed.data;

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  if (actorRole === "RENTER") {
    const existing = await prisma.swipe.findFirst({
      where: { listingId, renterId: actorId, landlordId: null }
    });

    if (existing) {
      await prisma.swipe.update({
        where: { id: existing.id },
        data: {
          direction: direction as SwipeDirection,
          renterViewedAt: new Date()
        }
      });
    } else {
      await prisma.swipe.create({
        data: {
          listingId,
          renterId: actorId,
          direction: direction as SwipeDirection,
          renterViewedAt: new Date()
        }
      });
    }

    let match = null;
    if (direction === "RIGHT") {
      const landlordRight = await prisma.swipe.findFirst({
        where: {
          listingId,
          renterId: actorId,
          landlordId: listing.landlordId,
          direction: SwipeDirection.RIGHT
        }
      });

      if (landlordRight) {
        match = await prisma.match.upsert({
          where: {
            listingId_renterId_landlordId: {
              listingId,
              renterId: actorId,
              landlordId: listing.landlordId
            }
          },
          create: {
            listingId,
            renterId: actorId,
            landlordId: listing.landlordId
          },
          update: {}
        });
      }
    }

    return NextResponse.json({ ok: true, match });
  }

  if (!renterId) {
    return NextResponse.json({ error: "renterId is required for landlord swipes" }, { status: 400 });
  }

  if (listing.landlordId !== actorId) {
    return NextResponse.json({ error: "You can only swipe renters on your own listing" }, { status: 403 });
  }

  const existing = await prisma.swipe.findFirst({
    where: { listingId, renterId, landlordId: actorId }
  });

  if (existing) {
    await prisma.swipe.update({
      where: { id: existing.id },
      data: {
        direction: direction as SwipeDirection,
        landlordViewedAt: new Date()
      }
    });
  } else {
    await prisma.swipe.create({
      data: {
        listingId,
        renterId,
        landlordId: actorId,
        direction: direction as SwipeDirection,
        landlordViewedAt: new Date()
      }
    });
  }

  let match = null;
  if (direction === "RIGHT") {
    const renterRight = await prisma.swipe.findFirst({
      where: {
        listingId,
        renterId,
        landlordId: null,
        direction: SwipeDirection.RIGHT
      }
    });

    if (renterRight) {
      match = await prisma.match.upsert({
        where: {
          listingId_renterId_landlordId: {
            listingId,
            renterId,
            landlordId: actorId
          }
        },
        create: {
          listingId,
          renterId,
          landlordId: actorId
        },
        update: {}
      });
    }
  }

  return NextResponse.json({ ok: true, match });
}

