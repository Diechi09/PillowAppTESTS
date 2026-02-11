import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(["RENTER", "LANDLORD"]),
  bio: z.string().min(8),
  budgetMin: z.number().int().nonnegative().optional(),
  budgetMax: z.number().int().nonnegative().optional(),
  moveInDate: z.string().datetime().optional(),
  petsAllowed: z.boolean().optional(),
  smokingAllowed: z.boolean().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  dealbreakers: z.array(z.string()).default([]),
  preferences: z.array(z.string()).default([])
});

export const createListingSchema = z.object({
  landlordId: z.string().cuid(),
  title: z.string().min(3),
  description: z.string().min(12),
  priceMonthly: z.number().int().positive(),
  beds: z.number().int().positive(),
  baths: z.number().int().positive(),
  squareFeet: z.number().int().positive(),
  city: z.string().min(2),
  address: z.string().min(4),
  latitude: z.number(),
  longitude: z.number(),
  furnished: z.boolean().default(false),
  petsAllowed: z.boolean().default(false),
  smokingAllowed: z.boolean().default(false),
  amenities: z.array(z.string()).default([]),
  dealbreakers: z.array(z.string()).default([]),
  media: z.array(z.object({ kind: z.enum(["image", "video"]), url: z.string().url() })).min(1)
});

export const swipeSchema = z.object({
  actorId: z.string().cuid(),
  actorRole: z.enum(["RENTER", "LANDLORD"]),
  listingId: z.string().cuid(),
  renterId: z.string().cuid().optional(),
  direction: z.enum(["LEFT", "RIGHT"])
});

export const messageSchema = z.object({
  matchId: z.string().cuid(),
  senderId: z.string().cuid(),
  content: z.string().min(1).max(1200)
});

