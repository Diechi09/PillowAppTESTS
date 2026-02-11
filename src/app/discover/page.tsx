"use client";

import { useEffect, useMemo, useState } from "react";
import MediaCarousel from "@/components/MediaCarousel";

type Listing = {
  id: string;
  title: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  priceMonthly: number;
  beds: number;
  distanceMiles: number | null;
  amenities: string[];
  media: Array<{ id: string; kind: string; url: string }>;
};

export default function DiscoverPage() {
  const [filters, setFilters] = useState({
    minPrice: 1000,
    maxPrice: 5000,
    beds: 1,
    pets: false,
    lat: 34.0522,
    lng: -118.2437,
    radius: 12
  });
  const [listings, setListings] = useState<Listing[]>([]);

  async function load() {
    const params = new URLSearchParams({
      minPrice: String(filters.minPrice),
      maxPrice: String(filters.maxPrice),
      beds: String(filters.beds),
      radius: String(filters.radius),
      lat: String(filters.lat),
      lng: String(filters.lng)
    });
    if (filters.pets) params.set("pets", "true");

    const data = await fetch(`/api/discover?${params.toString()}`).then((response) => response.json());
    setListings(data);
  }

  useEffect(() => {
    void load();
  }, []);

  const bounds = useMemo(() => {
    if (!listings.length) {
      return {
        minLat: filters.lat - 0.1,
        maxLat: filters.lat + 0.1,
        minLng: filters.lng - 0.1,
        maxLng: filters.lng + 0.1
      };
    }

    return {
      minLat: Math.min(...listings.map((item) => item.latitude)),
      maxLat: Math.max(...listings.map((item) => item.latitude)),
      minLng: Math.min(...listings.map((item) => item.longitude)),
      maxLng: Math.max(...listings.map((item) => item.longitude))
    };
  }, [filters.lat, filters.lng, listings]);

  return (
    <div className="grid" style={{ gridTemplateColumns: "1fr 1.4fr" }}>
      <aside className="card">
        <h1 style={{ marginTop: 0 }}>Map Discover</h1>
        <p style={{ color: "var(--ink-soft)" }}>Set preferences and dealbreakers to refine your feed.</p>
        <div className="row" style={{ flexDirection: "column" }}>
          <div>
            <label>Min price</label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(event) => setFilters({ ...filters, minPrice: Number(event.target.value) })}
            />
          </div>
          <div>
            <label>Max price</label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(event) => setFilters({ ...filters, maxPrice: Number(event.target.value) })}
            />
          </div>
          <div>
            <label>Min beds</label>
            <input type="number" value={filters.beds} onChange={(event) => setFilters({ ...filters, beds: Number(event.target.value) })} />
          </div>
          <div>
            <label>Radius miles</label>
            <input
              type="number"
              value={filters.radius}
              onChange={(event) => setFilters({ ...filters, radius: Number(event.target.value) })}
            />
          </div>
          <label className="row" style={{ alignItems: "center" }}>
            <input
              style={{ width: 20 }}
              type="checkbox"
              checked={filters.pets}
              onChange={(event) => setFilters({ ...filters, pets: event.target.checked })}
            />
            Pet friendly only
          </label>
          <button className="btn primary" onClick={() => void load()}>
            Apply Filters
          </button>
        </div>
      </aside>

      <section className="card">
        <div className="map-surface">
          {listings.map((listing) => {
            const x = ((listing.longitude - bounds.minLng) / (bounds.maxLng - bounds.minLng || 1)) * 92 + 4;
            const y = ((listing.latitude - bounds.minLat) / (bounds.maxLat - bounds.minLat || 1)) * 82 + 6;
            return (
              <div
                className="pin"
                key={listing.id}
                title={`${listing.title} - $${listing.priceMonthly}/mo`}
                style={{ left: `${x}%`, top: `${100 - y}%` }}
              />
            );
          })}
        </div>

        <div className="grid" style={{ marginTop: 12 }}>
          {listings.map((listing) => (
            <article key={listing.id} className="card" style={{ background: "#fff" }}>
              <MediaCarousel media={listing.media} />
              <h3>{listing.title}</h3>
              <p>
                ${listing.priceMonthly}/mo • {listing.beds} bed • {listing.city}
              </p>
              <p style={{ marginBottom: 0 }}>
                {listing.address}
                {listing.distanceMiles !== null ? ` • ${listing.distanceMiles.toFixed(1)} mi` : ""}
              </p>
            </article>
          ))}
          {!listings.length && <p>No listings match current constraints.</p>}
        </div>
      </section>
    </div>
  );
}

