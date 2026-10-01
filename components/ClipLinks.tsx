"use client";

import { useVideoLinks } from "@/components/VideoLinksContext";

type ClipLinksProps = {
  scope: "scanning" | "passing";
};

export function ClipLinks({ scope }: ClipLinksProps) {
  const { scanningVideoLink, setScanningVideoLink, passingVideoLink, setPassingVideoLink } = useVideoLinks();

  const url = scope === "scanning" ? scanningVideoLink : passingVideoLink;
  const setUrl = scope === "scanning" ? setScanningVideoLink : setPassingVideoLink;
  const trimmed = url.trim();
  const hasUrl = trimmed.length > 0;

  return (
    <div className="clips">
      <p className="section-label">Video clip</p>
      <div className="clips__row">
        <span className="clips__index">1</span>
        <input
          type="url"
          className="clips__input"
          placeholder="Paste video link (Hudl, Drive, etc.)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          aria-label="Video link"
        />
        {hasUrl ? (
          <a className="clip clip--ready btn btn--primary" href={trimmed} target="_blank" rel="noopener noreferrer">
            Open
          </a>
        ) : (
          <span className="clips__pending">Pending</span>
        )}
      </div>
    </div>
  );
}
