"use client";

type SwipeDeckProps = {
  onLeft: () => void;
  onRight: () => void;
  disabled?: boolean;
};

export default function SwipeDeckControls({ onLeft, onRight, disabled }: SwipeDeckProps) {
  return (
    <div className="row" style={{ marginTop: 12 }}>
      <button className="btn" disabled={disabled} onClick={onLeft}>
        Swipe Left
      </button>
      <button className="btn primary" disabled={disabled} onClick={onRight}>
        Swipe Right
      </button>
    </div>
  );
}

