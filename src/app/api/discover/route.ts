import { prisma } from "@/lib/prisma";
import { haversineMiles, parseJsonArray } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const minPrice = Number(searchParams.get("minPrice") ?? 0);
  const maxPrice = Number(searchParams.get("maxPrice") ?? 10000);
  const beds = Number(searchParams.get("beds") ?? 0);
  const petsAllowed = searchParams.get("pets") === "true";
  const lat = Number(searchParams.get("lat") ?? 0);
  const lng = Number(searchParams.get("lng") ?? 0);
  const radius = Number(searchParams.get("radius") ?? 15);

  const listings = await prisma.listing.findMany({
    where: {
      priceMonthly: { gte: minPrice, lte: maxPrice },
      beds: { gte: beds },
      ...(searchParams.get("pets") ? { petsAllowed } : {})
    },
    include: {
      media: { orderBy: { sortOrder: "asc" } },
      landlord: true
    },
    orderBy: { createdAt: "desc" }
  });

  const withDistance = listings
    .map((listing) => {
      const distanceMiles = lat && lng ? haversineMiles(lat, lng, listing.latitude, listing.longitude) : null;
      return {
        ...listing,
        amenities: parseJsonArray(listing.amenities),
        dealbreakers: parseJsonArray(listing.dealbreakers),
        distanceMiles
      };
    })
    .filter((listing) => (listing.distanceMiles === null ? true : listing.distanceMiles <= radius));

  return NextResponse.json(withDistance);
}

