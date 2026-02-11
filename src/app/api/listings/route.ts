import { Role, SwipeDirection } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/utils";
import { createListingSchema } from "@/lib/validators";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const viewerId = searchParams.get("viewerId");
  const role = searchParams.get("role");

  if (role === "LANDLORD" && viewerId) {
    const listings = await prisma.listing.findMany({
      where: { landlordId: viewerId },
      include: { media: true },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(
      listings.map((listing) => ({
        ...listing,
        amenities: parseJsonArray(listing.amenities),
        dealbreakers: parseJsonArray(listing.dealbreakers)
      }))
    );
  }

  const swipedIds = viewerId
    ? (
        await prisma.swipe.findMany({
          where: { renterId: viewerId },
          select: { listingId: true }
        })
      ).map((swipe) => swipe.listingId)
    : [];

  const listings = await prisma.listing.findMany({
    where: {
      id: { notIn: swipedIds }
    },
    include: {
      media: { orderBy: { sortOrder: "asc" } },
      landlord: { include: { profile: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 30
  });

  return NextResponse.json(
    listings.map((listing) => ({
      ...listing,
      amenities: parseJsonArray(listing.amenities),
      dealbreakers: parseJsonArray(listing.dealbreakers)
    }))
  );
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createListingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const landlord = await prisma.user.findUnique({ where: { id: data.landlordId } });
  if (!landlord || landlord.role !== Role.LANDLORD) {
    return NextResponse.json({ error: "Invalid landlord account." }, { status: 400 });
  }

  const listing = await prisma.listing.create({
    data: {
      landlordId: data.landlordId,
      title: data.title,
      description: data.description,
      priceMonthly: data.priceMonthly,
      beds: data.beds,
      baths: data.baths,
      squareFeet: data.squareFeet,
      city: data.city,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      furnished: data.furnished,
      petsAllowed: data.petsAllowed,
      smokingAllowed: data.smokingAllowed,
      amenities: JSON.stringify(data.amenities),
      dealbreakers: JSON.stringify(data.dealbreakers),
      media: {
        create: data.media.map((media, index) => ({
          kind: media.kind,
          url: media.url,
          sortOrder: index
        }))
      }
    },
    include: { media: true }
  });

  return NextResponse.json(listing, { status: 201 });
}

