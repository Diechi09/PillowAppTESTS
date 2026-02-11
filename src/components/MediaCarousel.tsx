"use client";

import { useState } from "react";

type MediaItem = {
  id: string;
  kind: string;
  url: string;
};

export default function MediaCarousel({ media }: { media: MediaItem[] }) {
  const [index, setIndex] = useState(0);

  if (!media.length) return <div className="media" />;

  const item = media[index];

  return (
    <div>
      <div className="media">
        {item.kind === "video" ? <video src={item.url} controls muted /> : <img src={item.url} alt="Listing media" />}
      </div>
      {media.length > 1 && (
        <div className="row" style={{ marginTop: 8 }}>
          <button className="btn" onClick={() => setIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1))}>
            Prev
          </button>
          <span className="badge">
            {index + 1}/{media.length}
          </span>
          <button className="btn" onClick={() => setIndex((prev) => (prev + 1) % media.length)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}

