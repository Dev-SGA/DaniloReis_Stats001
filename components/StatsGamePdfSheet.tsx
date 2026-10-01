import { BRAND } from "@/lib/brand";
import type { GameStats } from "@/lib/stats";

type StatsGamePdfSheetProps = {
  stats: GameStats;
  photoUrl: string;
  logoUrl: string;
};

type Phase = "build-up" | "defensive";

type Tone = "blue" | "green" | "red" | "grey";

function pct(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function linkHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.length > 48 ? `${url.slice(0, 45)}…` : url;
  }
}

function StatTiles({ items }: { items: { label: string; value: number; tone?: Tone; detail?: string }[] }) {
  return (
    <ul className="spdf-stats">
      {items.map((item) => (
        <li key={item.label} className="spdf-stat">
          <span className={`spdf-stat__value${item.tone ? ` spdf-stat__value--${item.tone}` : ""}`}>{item.value}</span>
          <span className="spdf-stat__label">{item.label}</span>
          {item.detail ? <span className="spdf-stat__detail">{item.detail}</span> : null}
        </li>
      ))}
    </ul>
  );
}

function Highlight({ value, label, note }: { value: number; label: string; note: string }) {
  return (
    <div className="spdf-highlight">
      <span className="spdf-highlight__value">{value}%</span>
      <span className="spdf-highlight__label">{label}</span>
      <span className="spdf-highlight__note">{note}</span>
    </div>
  );
}

function RateBar({
  label,
  value,
  note,
  segments,
}: {
  label: string;
  value: number;
  note: string;
  segments: { value: number; tone: Tone }[];
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  return (
    <div className="spdf-rate">
      <div className="spdf-rate__head">
        <span className="spdf-rate__label">{label}</span>
        <span className="spdf-rate__value">{value}%</span>
      </div>
      <div className="spdf-rate__track">
        {segments.map((segment, index) =>
          segment.value > 0 ? (
            <span
              key={index}
              className={`spdf-rate__seg spdf-rate__seg--${segment.tone}`}
              style={{ width: `${pct(segment.value, total)}%` }}
            />
          ) : null,
        )}
      </div>
      <p className="spdf-rate__note">{note}</p>
    </div>
  );
}

function Section({
  phase,
  kicker,
  title,
  value,
  unit,
  aside,
  footer,
}: {
  phase: Phase;
  kicker: string;
  title: string;
  value: number;
  unit: string;
  aside: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className={`spdf-section spdf-section--${phase}`}>
      <p className="spdf-section__phase">{kicker}</p>
      <h3 className="spdf-section__title">{title}</h3>
      <div className="spdf-section__body">
        <div className="spdf-section__kpi">
          <span className="spdf-section__value">{value}</span>
          <span className="spdf-section__unit">{unit}</span>
        </div>
        <div className="spdf-section__aside">{aside}</div>
      </div>
      {footer ? <div className="spdf-section__footer">{footer}</div> : null}
    </section>
  );
}

function PdfVideoLinks({ scanningVideoLink, passingVideoLink }: { scanningVideoLink: string; passingVideoLink: string }) {
  const rows = [
    { label: "Offensive scanning", url: scanningVideoLink.trim() },
    { label: "Between-the-lines passing", url: passingVideoLink.trim() },
  ];

  return (
    <section className="spdf-videos" aria-label="Video clips">
      <h4 className="spdf-videos__title">Video clips</h4>
      <ul className="spdf-videos__list">
        {rows.map((row) => (
          <li key={row.label}>
            {row.url ? (
              <a className="spdf-videos__link" href={row.url} data-pdf-link={row.url}>
                <span className="spdf-videos__play" aria-hidden="true">
                  ▶
                </span>
                <span className="spdf-videos__text">
                  <strong>{row.label}</strong>
                  <span>{linkHost(row.url)}</span>
                </span>
              </a>
            ) : (
              <span className="spdf-videos__empty">{row.label} — pending</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function StatsGamePdfSheet({ stats, photoUrl, logoUrl }: StatsGamePdfSheetProps) {
  const { player, meta, offensiveScanning, betweenLinesPassing, enteringBox } = stats;
  const scanningDone = offensiveScanning.passesReceived - offensiveScanning.noOffensiveScanning;
  const completedPasses = betweenLinesPassing.passes - betweenLinesPassing.wrong;

  return (
    <article className="stats-pdf" aria-hidden="true">
      <aside className="spdf-side">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt="" className="spdf-side__logo" />
        <div className="spdf-side__photo" data-pdf-bg={photoUrl} style={{ backgroundImage: `url(${photoUrl})` }} />
        <div className="spdf-side__identity">
          <p className="spdf-side__label">Athlete</p>
          <h2 className="spdf-side__name">{player.name}</h2>
          <p className="spdf-side__club">{player.club}</p>
        </div>
        <p className="spdf-side__slogan">{BRAND.slogan}</p>
      </aside>

      <div className="spdf-main">
        <header className="spdf-head">
          <div>
            <p className="spdf-head__eyebrow">{BRAND.legal}</p>
            <h1 className="spdf-head__title">{meta.title}</h1>
          </div>
          <div className="spdf-head__meta">
            <span>{meta.subtitle}</span>
          </div>
        </header>

        <div className="spdf-grid">
          <Section
            phase="build-up"
            kicker="Scanning"
            title="Offensive Scanning"
            value={offensiveScanning.passesReceived}
            unit="Passes received"
            aside={
              <StatTiles
                items={[
                  { label: "Scanned", value: scanningDone, tone: "green" },
                  {
                    label: "No scan",
                    value: offensiveScanning.noOffensiveScanning,
                    tone: "red",
                    detail: `${pct(offensiveScanning.noOffensiveScanning, offensiveScanning.passesReceived)}% of receptions`,
                  },
                ]}
              />
            }
            footer={
              <RateBar
                label="Scanning rate"
                value={pct(scanningDone, offensiveScanning.passesReceived)}
                note={`${scanningDone} of ${offensiveScanning.passesReceived} with offensive scanning`}
                segments={[
                  { value: scanningDone, tone: "green" },
                  { value: offensiveScanning.noOffensiveScanning, tone: "red" },
                ]}
              />
            }
          />

          <Section
            phase="build-up"
            kicker="Passing"
            title="Between-the-Lines Passing"
            value={betweenLinesPassing.passes}
            unit="Total passes"
            aside={
              <Highlight
                value={pct(betweenLinesPassing.betweenLines, betweenLinesPassing.passes)}
                label="Between-the-lines passes"
                note={`${betweenLinesPassing.betweenLines} of ${betweenLinesPassing.passes} passes`}
              />
            }
            footer={
              <RateBar
                label="Pass accuracy"
                value={pct(completedPasses, betweenLinesPassing.passes)}
                note={`${completedPasses} completed · ${betweenLinesPassing.wrong} misplaced · ${betweenLinesPassing.betweenLines} between the lines`}
                segments={[
                  { value: completedPasses, tone: "green" },
                  { value: betweenLinesPassing.wrong, tone: "red" },
                ]}
              />
            }
          />

          <Section
            phase="build-up"
            kicker="Final third"
            title="Entering the Penalty Area"
            value={enteringBox.total}
            unit="Penalty area entries"
            aside={
              <StatTiles
                items={[
                  { label: "In possession", value: enteringBox.inOrganization, tone: "blue" },
                  { label: "In transition", value: enteringBox.inTransition, tone: "grey" },
                ]}
              />
            }
            footer={
              <p className="spdf-note">
                All {enteringBox.inOrganization} in-possession entries came from attacks down the right channel.
              </p>
            }
          />
        </div>

        <PdfVideoLinks
          scanningVideoLink={offensiveScanning.videoLink}
          passingVideoLink={betweenLinesPassing.videoLink}
        />

        <footer className="spdf-foot">
          <span>{BRAND.name}</span>
          <span>
            {player.name} · {meta.title}
          </span>
        </footer>
      </div>
    </article>
  );
}
