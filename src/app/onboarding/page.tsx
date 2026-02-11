"use client";

import { FormEvent, useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  role: "RENTER" | "LANDLORD";
};

const defaultListing = {
  title: "",
  description: "",
  priceMonthly: 2000,
  beds: 1,
  baths: 1,
  squareFeet: 700,
  city: "",
  address: "",
  latitude: 34.05,
  longitude: -118.25,
  furnished: false,
  petsAllowed: false,
  smokingAllowed: false,
  amenitiesRaw: "Gym, Parking",
  dealbreakersRaw: "income 3x rent",
  mediaRaw:
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80, https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
};

export default function OnboardingPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [userForm, setUserForm] = useState({
    email: "",
    name: "",
    role: "RENTER" as "RENTER" | "LANDLORD",
    bio: "",
    budgetMin: 1500,
    budgetMax: 3000,
    petsAllowed: true,
    smokingAllowed: false,
    dealbreakersRaw: "",
    preferencesRaw: ""
  });
  const [selectedLandlordId, setSelectedLandlordId] = useState("");
  const [listingForm, setListingForm] = useState(defaultListing);
  const [status, setStatus] = useState("");

  async function refreshUsers() {
    const data = await fetch("/api/users").then((response) => response.json());
    setUsers(data);
  }

  useEffect(() => {
    void refreshUsers();
  }, []);

  async function createUser(event: FormEvent) {
    event.preventDefault();
    setStatus("");

    const payload = {
      email: userForm.email,
      name: userForm.name,
      role: userForm.role,
      bio: userForm.bio,
      budgetMin: userForm.role === "RENTER" ? Number(userForm.budgetMin) : undefined,
      budgetMax: userForm.role === "RENTER" ? Number(userForm.budgetMax) : undefined,
      petsAllowed: userForm.role === "RENTER" ? userForm.petsAllowed : undefined,
      smokingAllowed: userForm.role === "RENTER" ? userForm.smokingAllowed : undefined,
      dealbreakers: userForm.dealbreakersRaw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      preferences: userForm.preferencesRaw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    };

    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      setStatus("Could not create user. Check form values.");
      return;
    }

    const created = await response.json();
    localStorage.setItem("pillow_active_user_id", created.id);
    setStatus(`User ${created.name} created and set active.`);
    setUserForm({
      email: "",
      name: "",
      role: "RENTER",
      bio: "",
      budgetMin: 1500,
      budgetMax: 3000,
      petsAllowed: true,
      smokingAllowed: false,
      dealbreakersRaw: "",
      preferencesRaw: ""
    });
    await refreshUsers();
  }

  async function createListing(event: FormEvent) {
    event.preventDefault();

    const payload = {
      landlordId: selectedLandlordId,
      title: listingForm.title,
      description: listingForm.description,
      priceMonthly: Number(listingForm.priceMonthly),
      beds: Number(listingForm.beds),
      baths: Number(listingForm.baths),
      squareFeet: Number(listingForm.squareFeet),
      city: listingForm.city,
      address: listingForm.address,
      latitude: Number(listingForm.latitude),
      longitude: Number(listingForm.longitude),
      furnished: listingForm.furnished,
      petsAllowed: listingForm.petsAllowed,
      smokingAllowed: listingForm.smokingAllowed,
      amenities: listingForm.amenitiesRaw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      dealbreakers: listingForm.dealbreakersRaw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      media: listingForm.mediaRaw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((url) => ({ kind: url.endsWith(".mp4") ? "video" : "image", url }))
    };

    const response = await fetch("/api/listings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      setStatus("Could not create listing. Make sure landlord and fields are valid.");
      return;
    }

    setStatus("Listing created.");
    setListingForm(defaultListing);
  }

  const landlordUsers = users.filter((user) => user.role === "LANDLORD");

  return (
    <div className="grid">
      <section className="card">
        <h1 style={{ marginTop: 0 }}>Create Profile</h1>
        <form onSubmit={createUser} className="row" style={{ flexDirection: "column" }}>
          <div>
            <label>Name</label>
            <input value={userForm.name} onChange={(event) => setUserForm({ ...userForm, name: event.target.value })} required />
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={userForm.email}
              onChange={(event) => setUserForm({ ...userForm, email: event.target.value })}
              required
            />
          </div>
          <div>
            <label>Role</label>
            <select
              value={userForm.role}
              onChange={(event) => setUserForm({ ...userForm, role: event.target.value as "RENTER" | "LANDLORD" })}
            >
              <option value="RENTER">Renter</option>
              <option value="LANDLORD">Landlord</option>
            </select>
          </div>
          <div>
            <label>Bio</label>
            <textarea value={userForm.bio} onChange={(event) => setUserForm({ ...userForm, bio: event.target.value })} required />
          </div>
          {userForm.role === "RENTER" && (
            <>
              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div>
                  <label>Min budget</label>
                  <input
                    type="number"
                    value={userForm.budgetMin}
                    onChange={(event) => setUserForm({ ...userForm, budgetMin: Number(event.target.value) })}
                  />
                </div>
                <div>
                  <label>Max budget</label>
                  <input
                    type="number"
                    value={userForm.budgetMax}
                    onChange={(event) => setUserForm({ ...userForm, budgetMax: Number(event.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label>Dealbreakers (comma separated)</label>
                <input
                  value={userForm.dealbreakersRaw}
                  onChange={(event) => setUserForm({ ...userForm, dealbreakersRaw: event.target.value })}
                />
              </div>
              <div>
                <label>Preferences (comma separated)</label>
                <input
                  value={userForm.preferencesRaw}
                  onChange={(event) => setUserForm({ ...userForm, preferencesRaw: event.target.value })}
                />
              </div>
            </>
          )}
          <button className="btn primary" type="submit">
            Create User
          </button>
        </form>
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0 }}>Landlord: Add Listing</h2>
        <form onSubmit={createListing} className="row" style={{ flexDirection: "column" }}>
          <div>
            <label>Landlord account</label>
            <select value={selectedLandlordId} onChange={(event) => setSelectedLandlordId(event.target.value)} required>
              <option value="">Select landlord...</option>
              {landlordUsers.map((landlord) => (
                <option key={landlord.id} value={landlord.id}>
                  {landlord.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Title</label>
            <input value={listingForm.title} onChange={(event) => setListingForm({ ...listingForm, title: event.target.value })} required />
          </div>
          <div>
            <label>Description</label>
            <textarea
              value={listingForm.description}
              onChange={(event) => setListingForm({ ...listingForm, description: event.target.value })}
              required
            />
          </div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
            <div>
              <label>Price/month</label>
              <input
                type="number"
                value={listingForm.priceMonthly}
                onChange={(event) => setListingForm({ ...listingForm, priceMonthly: Number(event.target.value) })}
              />
            </div>
            <div>
              <label>Beds</label>
              <input
                type="number"
                value={listingForm.beds}
                onChange={(event) => setListingForm({ ...listingForm, beds: Number(event.target.value) })}
              />
            </div>
            <div>
              <label>Baths</label>
              <input
                type="number"
                value={listingForm.baths}
                onChange={(event) => setListingForm({ ...listingForm, baths: Number(event.target.value) })}
              />
            </div>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <label>City</label>
              <input value={listingForm.city} onChange={(event) => setListingForm({ ...listingForm, city: event.target.value })} required />
            </div>
            <div>
              <label>Address</label>
              <input
                value={listingForm.address}
                onChange={(event) => setListingForm({ ...listingForm, address: event.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <label>Amenities (comma separated)</label>
            <input
              value={listingForm.amenitiesRaw}
              onChange={(event) => setListingForm({ ...listingForm, amenitiesRaw: event.target.value })}
            />
          </div>
          <div>
            <label>Dealbreakers (comma separated)</label>
            <input
              value={listingForm.dealbreakersRaw}
              onChange={(event) => setListingForm({ ...listingForm, dealbreakersRaw: event.target.value })}
            />
          </div>
          <div>
            <label>Media URLs (comma separated image/video URLs)</label>
            <textarea value={listingForm.mediaRaw} onChange={(event) => setListingForm({ ...listingForm, mediaRaw: event.target.value })} />
          </div>
          <button className="btn alt" type="submit">
            Publish Listing
          </button>
        </form>
      </section>

      {status && (
        <section className="card" style={{ gridColumn: "1 / -1" }}>
          {status}
        </section>
      )}
    </div>
  );
}

