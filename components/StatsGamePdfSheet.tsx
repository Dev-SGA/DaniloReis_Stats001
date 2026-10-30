import { BRAND } from "@/lib/brand";
import { clipUrl, formatCount, type GameStats } from "@/lib/stats";

type StatsGamePdfSheetProps = {
  stats: GameStats;
  photoUrl: string;
  logoUrl: string;
  playIconUrl: string;
  clubLogoUrl?: string;
  opponentLogoUrl?: string;
};

type Phase = "build-up" | "defensive";

type Tone = "blue" | "green" | "red" | "grey" | "amber";

function pct(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function PdfPlay({ href, playIconUrl }: { href?: string; playIconUrl: string }) {
  if (!href) return null;
  return (
    <a className="spdf-play" href={href} data-pdf-link={href} target="_blank" rel="noreferrer" aria-label="Open video">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={playIconUrl} alt="" className="spdf-play__icon" width={14} height={14} />
    </a>
  );
}

function PdfPlayTarget({ href, children }: { href?: string; children: React.ReactNode }) {
  if (!href) return <>{children}</>;
  return (
    <a className="spdf-play-target" href={href} data-pdf-link={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

function resolveScanningClip(stats: GameStats): string | undefined {
  const fromList = clipUrl(stats.videos, "Offensive scanning", "Scanning", "No offensive scan", "No scan")?.trim();
  const fallback = stats.offensiveScanning.videoLink.trim();
  return fromList || fallback || undefined;
}

function resolvePassingClip(stats: GameStats): string | undefined {
  const fromList = clipUrl(
    stats.videos,
    "Between-the-lines passing",
    "Between the lines",
    "Passing",
    "Wrong passes",
    "Misplaced passes",
  )?.trim();
  const fallback = stats.betweenLinesPassing.videoLink.trim();
  return fromList || fallback || undefined;
}

type StatTileItem = {
  label: string;
  value: number;
  tone?: Tone;
  detail?: string;
  href?: string;
};

function StatTiles({ items, playIconUrl }: { items: StatTileItem[]; playIconUrl: string }) {
  return (
    <ul className="spdf-stats">
      {items.map((item) => (
        <li key={item.label} className="spdf-stat">
          <span className={`spdf-stat__value${item.tone ? ` spdf-stat__value--${item.tone}` : ""}`}>
            <PdfPlayTarget href={item.href}>{formatCount(item.value)}</PdfPlayTarget>
            <PdfPlay href={item.href} playIconUrl={playIconUrl} />
          </span>
          <span className="spdf-stat__label">{item.label}</span>
          {item.detail ? <span className="spdf-stat__detail">{item.detail}</span> : null}
        </li>
      ))}
    </ul>
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
          <span className="spdf-section__value">{formatCount(value)}</span>
          <span className="spdf-section__unit">{unit}</span>
        </div>
        <div className="spdf-section__aside">{aside}</div>
      </div>
      {footer ? <div className="spdf-section__footer">{footer}</div> : null}
    </section>
  );
}

export function StatsGamePdfSheet({
  stats,
  photoUrl,
  logoUrl,
  playIconUrl,
  clubLogoUrl,
  opponentLogoUrl,
}: StatsGamePdfSheetProps) {
  const { player, meta, offensiveScanning, betweenLinesPassing, enteringBox } = stats;
  const scanningDone = offensiveScanning.passesReceived - offensiveScanning.noOffensiveScanning;
  const completedPasses = betweenLinesPassing.passes - betweenLinesPassing.wrong;
  const scanningClip = resolveScanningClip(stats);
  const passingClip = resolvePassingClip(stats);

  const boxTiles: StatTileItem[] = [
    { label: "In possession", value: enteringBox.inOrganization, tone: "blue" },
    { label: "In transition", value: enteringBox.inTransition, tone: "grey" },
  ];
  if (enteringBox.organizationRightWing > 0) {
    boxTiles.push({
      label: "Via right channel",
      value: enteringBox.organizationRightWing,
      tone: "blue",
      detail: `${pct(enteringBox.organizationRightWing, enteringBox.inOrganization)}% of in-possession entries`,
    });
  }

  return (
    <article className="stats-pdf" aria-hidden="true">
      <aside className="spdf-side">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt="" className="spdf-side__logo" />
        <div className="spdf-side__photo" data-pdf-bg={photoUrl} style={{ backgroundImage: `url(${photoUrl})` }} />
        <div className="spdf-side__identity">
          <p className="spdf-side__label">Athlete</p>
          <h2 className="spdf-side__name">{player.name}</h2>
          <p className="spdf-side__club">
            {clubLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={clubLogoUrl} alt="" className="spdf-side__club-logo" />
            ) : null}
            {player.club}
          </p>
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
            <span className="spdf-head__match">
              {opponentLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={opponentLogoUrl} alt="" className="spdf-head__logo" />
              ) : null}
              {meta.subtitle}
            </span>
          </div>
        </header>

        <div className="spdf-grid spdf-grid--three">
          <Section
            phase="build-up"
            kicker="Scanning"
            title="Offensive Scanning"
            value={offensiveScanning.passesReceived}
            unit="Passes received"
            aside={
              <StatTiles
                playIconUrl={playIconUrl}
                items={[
                  { label: "Scanned", value: scanningDone, tone: "green" },
                  {
                    label: "No scan",
                    value: offensiveScanning.noOffensiveScanning,
                    tone: "amber",
                    detail: `${pct(offensiveScanning.noOffensiveScanning, offensiveScanning.passesReceived)}% of receptions`,
                    href: scanningClip,
                  },
                ]}
              />
            }
            footer={
              <RateBar
                label="Scanning rate"
                value={pct(scanningDone, offensiveScanning.passesReceived)}
                note={`${formatCount(scanningDone)} of ${formatCount(offensiveScanning.passesReceived)} with offensive scanning`}
                segments={[
                  { value: scanningDone, tone: "green" },
                  { value: offensiveScanning.noOffensiveScanning, tone: "amber" },
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
              <StatTiles
                playIconUrl={playIconUrl}
                items={[
                  {
                    label: "Between the lines",
                    value: betweenLinesPassing.betweenLines,
                    tone: "blue",
                    detail: `${pct(betweenLinesPassing.betweenLines, betweenLinesPassing.passes)}% of passes`,
                  },
                  {
                    label: "Inaccurate passes",
                    value: betweenLinesPassing.wrong,
                    tone: "amber",
                    detail: `${pct(betweenLinesPassing.wrong, betweenLinesPassing.passes)}% of passes`,
                    href: passingClip,
                  },
                ]}
              />
            }
            footer={
              <RateBar
                label="Pass accuracy"
                value={pct(completedPasses, betweenLinesPassing.passes)}
                note={`${formatCount(completedPasses)} of ${formatCount(betweenLinesPassing.passes)} passes completed`}
                segments={[
                  { value: completedPasses, tone: "green" },
                  { value: betweenLinesPassing.wrong, tone: "amber" },
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
            aside={<StatTiles playIconUrl={playIconUrl} items={boxTiles} />}
            footer={
              enteringBox.inOrganization + enteringBox.inTransition > 0 ? (
                <RateBar
                  label="Phase of play"
                  value={pct(enteringBox.inOrganization, enteringBox.inOrganization + enteringBox.inTransition)}
                  note={`${formatCount(enteringBox.inOrganization)} in possession · ${formatCount(enteringBox.inTransition)} in transition`}
                  segments={[
                    { value: enteringBox.inOrganization, tone: "blue" },
                    { value: enteringBox.inTransition, tone: "grey" },
                  ]}
                />
              ) : undefined
            }
          />
        </div>

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
