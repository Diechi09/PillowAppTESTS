"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Match = {
  id: string;
  listing: { title: string };
  renter: { id: string; name: string };
  landlord: { id: string; name: string };
  messages: Array<{ content: string; createdAt: string }>;
};

type Message = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: { name: string };
};

type User = {
  id: string;
  name: string;
  role: "RENTER" | "LANDLORD";
};

export default function ChatPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [activeUserId, setActiveUserId] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");

  const activeUser = useMemo(() => users.find((item) => item.id === activeUserId), [users, activeUserId]);

  async function loadUsers() {
    const data = await fetch("/api/users").then((response) => response.json());
    setUsers(data);
  }

  async function loadMatches(userId: string) {
    const data = await fetch(`/api/matches?userId=${userId}`).then((response) => response.json());
    setMatches(data);
    if (!selectedMatchId && data.length) {
      setSelectedMatchId(data[0].id);
    }
  }

  async function loadMessages(matchId: string) {
    const data = await fetch(`/api/messages?matchId=${matchId}`).then((response) => response.json());
    setMessages(data);
  }

  useEffect(() => {
    const saved = localStorage.getItem("pillow_active_user_id") ?? "";
    setActiveUserId(saved);
    void loadUsers();
  }, []);

  useEffect(() => {
    if (!activeUserId) return;
    localStorage.setItem("pillow_active_user_id", activeUserId);
    void loadMatches(activeUserId);
  }, [activeUserId]);

  useEffect(() => {
    if (!selectedMatchId) return;
    void loadMessages(selectedMatchId);
  }, [selectedMatchId]);

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!activeUserId || !selectedMatchId || !draft.trim()) return;

    await fetch("/api/messages", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        matchId: selectedMatchId,
        senderId: activeUserId,
        content: draft.trim()
      })
    });

    setDraft("");
    await loadMessages(selectedMatchId);
    await loadMatches(activeUserId);
  }

  return (
    <div className="grid" style={{ gridTemplateColumns: "320px 1fr" }}>
      <aside className="card">
        <h1 style={{ marginTop: 0 }}>Matches</h1>
        <label>Active user</label>
        <select value={activeUserId} onChange={(event) => setActiveUserId(event.target.value)}>
          <option value="">Select user...</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.role})
            </option>
          ))}
        </select>

        <div className="row" style={{ flexDirection: "column", marginTop: 12 }}>
          {matches.map((match) => {
            const counterpart = activeUserId === match.renter.id ? match.landlord.name : match.renter.name;
            return (
              <button
                key={match.id}
                className="btn"
                style={{ textAlign: "left", borderColor: selectedMatchId === match.id ? "var(--accent)" : "var(--line)" }}
                onClick={() => setSelectedMatchId(match.id)}
              >
                <strong>{counterpart}</strong>
                <br />
                <small>{match.listing.title}</small>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="card">
        <h2 style={{ marginTop: 0 }}>Chat</h2>
        {!activeUser && <p>Select a user to load inbox.</p>}
        {activeUser && !selectedMatchId && <p>No matches yet.</p>}

        {selectedMatchId && (
          <>
            <div className="card" style={{ maxHeight: 420, overflowY: "auto", background: "#fff" }}>
              {messages.map((message) => (
                <div key={message.id} style={{ marginBottom: 10 }}>
                  <strong>{message.senderId === activeUserId ? "You" : message.sender.name}</strong>
                  <p style={{ margin: "0.2rem 0" }}>{message.content}</p>
                  <small style={{ color: "var(--ink-soft)" }}>{new Date(message.createdAt).toLocaleString()}</small>
                </div>
              ))}
              {!messages.length && <p>No messages yet. Start the conversation.</p>}
            </div>

            <form onSubmit={sendMessage} className="row" style={{ marginTop: 10 }}>
              <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Type a message..." />
              <button className="btn primary" type="submit">
                Send
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

