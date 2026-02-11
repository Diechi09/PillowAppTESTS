import { PrismaClient, Role, SwipeDirection } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.message.deleteMany();
  await prisma.match.deleteMany();
  await prisma.swipe.deleteMany();
  await prisma.listingMedia.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const landlord = await prisma.user.create({
    data: {
      email: "landlord@pillow.app",
      name: "Maya Brooks",
      role: Role.LANDLORD,
      profile: {
        create: {
          bio: "Landlord focused on long-term tenants and transparent leases.",
          latitude: 34.0522,
          longitude: -118.2437
        }
      }
    }
  });

  const renter = await prisma.user.create({
    data: {
      email: "renter@pillow.app",
      name: "Jordan Lee",
      role: Role.RENTER,
      profile: {
        create: {
          bio: "Remote software engineer looking for a quiet one-bedroom.",
          budgetMin: 1800,
          budgetMax: 3000,
          petsAllowed: true,
          smokingAllowed: false,
          latitude: 34.0489,
          longitude: -118.2519,
          dealbreakers: JSON.stringify(["smoking", "no in-unit laundry"]),
          preferences: JSON.stringify(["close to transit", "natural light"])
        }
      }
    }
  });

  const listing = await prisma.listing.create({
    data: {
      landlordId: landlord.id,
      title: "Bright Downtown Loft",
      description: "Modern loft near metro with gym, rooftop, and in-unit laundry.",
      priceMonthly: 2650,
      beds: 1,
      baths: 1,
      squareFeet: 760,
      city: "Los Angeles",
      address: "745 Main St",
      latitude: 34.0468,
      longitude: -118.2476,
      furnished: false,
      petsAllowed: true,
      smokingAllowed: false,
      amenities: JSON.stringify(["Gym", "Rooftop", "In-unit laundry", "Parking"]),
      dealbreakers: JSON.stringify(["income 3x rent"]),
      media: {
        create: [
          {
            kind: "image",
            url: "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80",
            sortOrder: 0
          },
          {
            kind: "image",
            url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
            sortOrder: 1
          },
          {
            kind: "video",
            url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
            sortOrder: 2
          }
        ]
      }
    }
  });

  await prisma.swipe.create({
    data: {
      listingId: listing.id,
      renterId: renter.id,
      direction: SwipeDirection.RIGHT,
      renterViewedAt: new Date()
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

