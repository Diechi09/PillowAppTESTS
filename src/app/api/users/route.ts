import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createUserSchema } from "@/lib/validators";
import { NextResponse } from "next/server";

export async function GET() {
  const users = await prisma.user.findMany({
    include: {
      profile: true,
      listings: {
        include: { media: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      role: data.role as Role,
      profile: {
        create: {
          bio: data.bio,
          budgetMin: data.budgetMin,
          budgetMax: data.budgetMax,
          moveInDate: data.moveInDate ? new Date(data.moveInDate) : undefined,
          petsAllowed: data.petsAllowed,
          smokingAllowed: data.smokingAllowed,
          latitude: data.latitude,
          longitude: data.longitude,
          dealbreakers: JSON.stringify(data.dealbreakers),
          preferences: JSON.stringify(data.preferences)
        }
      }
    },
    include: { profile: true }
  });

  return NextResponse.json(user, { status: 201 });
}

