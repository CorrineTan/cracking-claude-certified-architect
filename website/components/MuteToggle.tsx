"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isMuted, setMuted, unlock, playChime } from "@/lib/sound-fx";

export function MuteToggle({ className }: { className?: string }) {
  const [muted, setMutedState] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setMutedState(isMuted());
    setHydrated(true);
  }, []);

  function toggle() {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) {
      unlock();
      playChime();
    }
  }

  if (!hydrated) {
    return (
      <button
        type="button"
        className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-clay-200 bg-white text-clay-500 ${className ?? ""}`}
        aria-label="Audio toggle"
      >
        <Volume2 className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-clay-200 bg-white text-clay-700 transition hover:border-ember-300 hover:text-ember-700 ${className ?? ""}`}
      aria-label={muted ? "Unmute sounds" : "Mute sounds"}
      title={muted ? "Sounds off — click to enable" : "Sounds on — click to mute"}
    >
      {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
    </button>
  );
}
