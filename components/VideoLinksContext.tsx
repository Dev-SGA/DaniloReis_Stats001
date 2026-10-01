"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { GameStats } from "@/lib/stats";

type VideoLinksContextValue = {
  scanningVideoLink: string;
  setScanningVideoLink: (value: string) => void;
  passingVideoLink: string;
  setPassingVideoLink: (value: string) => void;
  mergeIntoStats: (stats: GameStats) => GameStats;
};

const VideoLinksContext = createContext<VideoLinksContextValue | null>(null);

type VideoLinksProviderProps = {
  initialScanningVideoLink: string;
  initialPassingVideoLink: string;
  children: ReactNode;
};

export function VideoLinksProvider({
  initialScanningVideoLink,
  initialPassingVideoLink,
  children,
}: VideoLinksProviderProps) {
  const [scanningVideoLink, setScanningVideoLink] = useState(initialScanningVideoLink);
  const [passingVideoLink, setPassingVideoLink] = useState(initialPassingVideoLink);

  const value = useMemo<VideoLinksContextValue>(
    () => ({
      scanningVideoLink,
      setScanningVideoLink,
      passingVideoLink,
      setPassingVideoLink,
      mergeIntoStats(stats) {
        return {
          ...stats,
          offensiveScanning: { ...stats.offensiveScanning, videoLink: scanningVideoLink },
          betweenLinesPassing: { ...stats.betweenLinesPassing, videoLink: passingVideoLink },
        };
      },
    }),
    [scanningVideoLink, passingVideoLink],
  );

  return <VideoLinksContext.Provider value={value}>{children}</VideoLinksContext.Provider>;
}

export function useVideoLinks(): VideoLinksContextValue {
  const ctx = useContext(VideoLinksContext);
  if (!ctx) {
    throw new Error("useVideoLinks must be used within VideoLinksProvider");
  }
  return ctx;
}
