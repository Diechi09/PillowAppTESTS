"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import MediaCarousel from "@/components/MediaCarousel";
import SwipeDeckControls from "@/components/SwipeDeckControls";

type User = {
  id: string;
  name: string;
  email: string;
  role: "RENTER" | "LANDLORD";
  profile?: {
    bio: string;
    budgetMin?: number;
    budgetMax?: number;
    preferences?: string;
    dealbreakers?: string;
  };
  listings: Array<{ id: string; title: string }>;
};

type ListingCard = {
  id: string;
  title: string;
  description: string;
  priceMonthly: number;
  beds: number;
  baths: number;
  city: string;
  address: string;
  amenities: string[];
  landlord: { name: string };
  media: Array<{ id: string; kind: string; url: string }>;
};

type InterestedCard = {
  id: string;
  listingId: string;
  listing: ListingCard;
  renter: {
    id: string;
    name: string;
    profile?: {
      bio: string;
      budgetMin?: number;
      budgetMax?: number;
      preferences: string;
      dealbreakers: string;
    };
  };
};

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [activeUserId, setActiveUserId] = useState<string>("");
  const [listings, setListings] = useState<ListingCard[]>([]);
  const [interested, setInterested] = useState<InterestedCard[]>([]);
  const [index, setIndex] = useState(0);
  const [matchNotice, setMatchNotice] = useState<string>("");

  const activeUser = useMemo(() => users.find((u) => u.id === activeUserId), [users, activeUserId]);

  useEffect(() => {
    const saved = localStorage.getItem("pillow_active_user_id");
    if (saved) setActiveUserId(saved);
  }, []);

  useEffect(() => {
    void (async () => {
      const data = await fetch("/api/users").then((r) => r.json());
      setUsers(data);
    })();
  }, []);

  useEffect(() => {
    if (!activeUserId) return;
    localStorage.setItem("pillow_active_user_id", activeUserId);
  }, [activeUserId]);

  useEffect(() => {
    if (!activeUser) return;

    if (activeUser.role === "RENTER") {
      void (async () => {
        const data = await fetch(`/api/listings?viewerId=${activeUser.id}&role=RENTER`).then((r) => r.json());
        setListings(data);
        setInterested([]);
        setIndex(0);
      })();
      return;
    }

    void (async () => {
      const data = await fetch(`/api/listings/interested?landlordId=${activeUser.id}`).then((r) => r.json());
      setInterested(data);
      setListings([]);
      setIndex(0);
    })();
  }, [activeUser]);

  async function renterSwipe(direction: "LEFT" | "RIGHT") {
    const current = listings[index];
    if (!current || !activeUser) return;

    const response = await fetch("/api/swipe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        actorId: activeUser.id,
        actorRole: activeUser.role,
        listingId: current.id,
        direction
      })
    }).then((r) => r.json());

    if (response.match) {
      setMatchNotice(`New match with ${current.landlord.name} for ${current.title}`);
    }

    setIndex((prev) => prev + 1);
  }

  async function landlordSwipe(direction: "LEFT" | "RIGHT") {
    const current = interested[index];
    if (!current || !activeUser) return;

    const response = await fetch("/api/swipe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        actorId: activeUser.id,
        actorRole: activeUser.role,
        listingId: current.listingId,
        renterId: current.renter.id,
        direction
      })
    }).then((r) => r.json());

    if (response.match) {
      setMatchNotice(`Matched with ${current.renter.name} on ${current.listing.title}`);
    }

    setIndex((prev) => prev + 1);
  }

  const renterCard = activeUser?.role === "RENTER" ? listings[index] : null;
  const landlordCard = activeUser?.role === "LANDLORD" ? interested[index] : null;

  return (
    <div className="grid" style={{ gridTemplateColumns: "1.6fr 1fr" }}>
      <section className="card">
        <h1 style={{ marginTop: 0 }}>Swipe Feed</h1>
        <p style={{ color: "var(--ink-soft)" }}>
          Renters swipe properties. Landlords swipe renters who already liked their listings.
        </p>

        <div style={{ marginBottom: 12 }}>
          <label>Active user</label>
          <select value={activeUserId} onChange={(event) => setActiveUserId(event.target.value)}>
            <option value="">Pick user...</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
        </div>

        {!activeUser && (
          <p>
            Create users in <Link href="/onboarding">Onboarding</Link>.
          </p>
        )}

        {activeUser?.role === "RENTER" && renterCard && (
          <div className="card" style={{ background: "#fff" }}>
            <MediaCarousel media={renterCard.media} />
            <h2>{renterCard.title}</h2>
            <p>
              ${renterCard.priceMonthly}/mo • {renterCard.beds}bd/{renterCard.baths}ba • {renterCard.city}
            </p>
            <p>{renterCard.description}</p>
            <p>
              Host: {renterCard.landlord.name} • {renterCard.address}
            </p>
            <div className="row">
              {renterCard.amenities.map((amenity) => (
                <span key={amenity} className="badge">
                  {amenity}
                </span>
              ))}
            </div>
            <SwipeDeckControls onLeft={() => void renterSwipe("LEFT")} onRight={() => void renterSwipe("RIGHT")} />
          </div>
        )}

        {activeUser?.role === "RENTER" && !renterCard && <p>No more cards right now.</p>}

        {activeUser?.role === "LANDLORD" && landlordCard && (
          <div className="card" style={{ background: "#fff" }}>
            <h2>{landlordCard.renter.name}</h2>
            <p>{landlordCard.renter.profile?.bio}</p>
            <p>
              Budget: ${landlordCard.renter.profile?.budgetMin ?? "?"} - ${landlordCard.renter.profile?.budgetMax ?? "?"}
            </p>
            <p>
              Applied to: <strong>{landlordCard.listing.title}</strong>
            </p>
            <p style={{ color: "var(--ink-soft)" }}>
              Preferences: {(JSON.parse(landlordCard.renter.profile?.preferences ?? "[]") as string[]).join(", ")}
            </p>
            <SwipeDeckControls onLeft={() => void landlordSwipe("LEFT")} onRight={() => void landlordSwipe("RIGHT")} />
          </div>
        )}

        {activeUser?.role === "LANDLORD" && !landlordCard && <p>No incoming likes to review.</p>}

        {matchNotice && (
          <div className="card" style={{ marginTop: 12, borderColor: "var(--accent)" }}>
            <strong>{matchNotice}</strong>
            <p style={{ marginBottom: 0 }}>
              Open <Link href="/chat">Chat</Link> to continue.
            </p>
          </div>
        )}
      </section>

      <aside className="card">
        <h3 style={{ marginTop: 0 }}>How matching works</h3>
        <ol>
          <li>Renter swipes right on a listing.</li>
          <li>Landlord sees that renter in their review queue.</li>
          <li>If landlord swipes right back, match is created.</li>
          <li>Both users can chat instantly.</li>
        </ol>
        <div className="row">
          <Link className="btn" href="/discover">
            Open map discovery
          </Link>
          <Link className="btn alt" href="/chat">
            Open inbox
          </Link>
        </div>
      </aside>
    </div>
  );
}

