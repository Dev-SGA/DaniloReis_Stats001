"use client";

import type { ReactNode } from "react";

export function PlayTip({ label, tip, href }: { label: string; tip: string; href?: string }) {
  const className = `pass-play-tip legend__label${href ? " pass-play-tip--clip clip-link--hit" : ""}`;
  if (href) {
    return (
      <a
        className={className}
        href={href}
        target="_blank"
        rel="noreferrer"
        data-tip={tip}
        aria-label={`Open video: ${label}. ${tip}`}
      >
        <span className="pass-play-tip__label">
          {label}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/play-icon.png" alt="" className="play-icon" width={14} height={14} />
        </span>
      </a>
    );
  }
  return (
    <button type="button" className={className} data-tip={tip} aria-label={`${label}. ${tip}`}>
      <span className="pass-play-tip__label">{label}</span>
    </button>
  );
}

export function ClipAnchor({
  href,
  className,
  children,
  ariaLabel,
}: {
  href?: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  if (!href) return <span className={className}>{children}</span>;
  return (
    <a
      className={["clip-link", "clip-link--hit", className].filter(Boolean).join(" ")}
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={ariaLabel ?? "Open video clip"}
    >
      {children}
    </a>
  );
}

export function ClipLegendLabel({ label, href }: { label: string; href?: string }) {
  if (!href) return <span className="legend__label">{label}</span>;
  return (
    <ClipAnchor href={href} className="legend__label" ariaLabel={`Open video: ${label}`}>
      {label}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/play-icon.png" alt="" className="play-icon play-icon--legend" width={14} height={14} />
    </ClipAnchor>
  );
}

export function ClipMetricTitle({ label, href }: { label: string; href?: string }) {
  if (!href) return <h3 className="metric-card__title">{label}</h3>;
  return (
    <h3 className="metric-card__title">
      <ClipAnchor href={href} ariaLabel={`Open video: ${label}`}>
        {label}
      </ClipAnchor>
    </h3>
  );
}
