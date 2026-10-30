"use client";

import { useMemo, useState } from "react";
import { AthleteProfileCard } from "@/components/AthleteProfileCard";
import { ExportPdfButton } from "@/components/ExportPdfButton";
import { ClipAnchor, ClipLegendLabel, ClipMetricTitle } from "@/components/ClipUi";
import { CountLine } from "@/components/CountLine";
import { VideoLinksProvider } from "@/components/VideoLinksContext";
import { MetricFlow } from "@/components/MetricFlow";
import { SgaBrand } from "@/components/SgaBrand";
import { SgaCornerBrand } from "@/components/SgaCornerBrand";
import { TopicsBoard, type Topic } from "@/components/TopicsBoard";
import { BRAND } from "@/lib/brand";
import {
  formatCount,
  matchVideoClip,
  perGameMatch,
  seasonMatch,
  toGameStats,
  type MatchStats,
  type StatsReport,
} from "@/lib/stats";

type GameStatsReportProps = {
  report: StatsReport;
};

type BarTone = "accent" | "positive" | "negative" | "warn" | "muted";

function percent(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function SplitMeter({
  title,
  primary,
  secondary,
  primaryLabel,
  secondaryLabel,
  primaryTone,
  secondaryTone,
  headline,
  primaryHref,
  secondaryHref,
  games,
  countUnit,
}: {
  title: string;
  primary: number;
  secondary: number;
  primaryLabel: string;
  secondaryLabel: string;
  primaryTone: BarTone;
  secondaryTone: BarTone;
  headline: string;
  primaryHref?: string;
  secondaryHref?: string;
  games?: number;
  countUnit?: string;
}) {
  const total = primary + secondary;
  const primaryPct = percent(primary, total);

  return (
    <div className="metric-card">
      <h3 className="metric-card__title">{title}</h3>
      {games && countUnit ? <CountLine value={total} unit={countUnit} className="metric-card__count-line--meter" /> : null}
      <p className="metric-card__headline">{headline}</p>
      <div className="meter" role="img" aria-label={`${primaryLabel}: ${primary}. ${secondaryLabel}: ${secondary}.`}>
        <span className={`meter__seg meter__seg--${primaryTone}`} style={{ width: `${primaryPct}%` }} />
        <span className={`meter__seg meter__seg--${secondaryTone}`} style={{ width: `${100 - primaryPct}%` }} />
      </div>
      <ul className="legend">
        <li>
          <span className={`legend__dot legend__dot--${primaryTone}`} />
          <ClipLegendLabel label={primaryLabel} href={primaryHref} />
          {primaryHref ? (
            <ClipAnchor href={primaryHref} className="legend__clip-stat" ariaLabel={`Open video: ${primaryLabel}`}>
              {formatCount(primary)} · {primaryPct}%
            </ClipAnchor>
          ) : (
            <strong>
              {formatCount(primary)} · {primaryPct}%
            </strong>
          )}
        </li>
        <li>
          <span className={`legend__dot legend__dot--${secondaryTone}`} />
          <ClipLegendLabel label={secondaryLabel} href={secondaryHref} />
          {secondaryHref ? (
            <ClipAnchor href={secondaryHref} className="legend__clip-stat" ariaLabel={`Open video: ${secondaryLabel}`}>
              {formatCount(secondary)} · {percent(secondary, total)}%
            </ClipAnchor>
          ) : (
            <strong>
              {formatCount(secondary)} · {percent(secondary, total)}%
            </strong>
          )}
        </li>
      </ul>
    </div>
  );
}

type SeasonMode = "total" | "perGame";

function SeasonModeToggle({ mode, onChange }: { mode: SeasonMode; onChange: (mode: SeasonMode) => void }) {
  const items: { id: SeasonMode; label: string }[] = [
    { id: "total", label: "Total" },
    { id: "perGame", label: "Per game" },
  ];

  return (
    <div className="match-nav__pills season-mode" role="group" aria-label="Season numbers">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`match-nav__pill${item.id === mode ? " is-active" : ""}`}
          aria-pressed={item.id === mode}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function MatchSwitcher({
  matches,
  activeId,
  onChange,
  children,
}: {
  matches: MatchStats[];
  activeId: string;
  onChange: (id: string) => void;
  children?: React.ReactNode;
}) {
  const index = matches.findIndex((match) => match.id === activeId);

  return (
    <div className="match-nav">
      <div className="match-nav__session" role="group" aria-label="Matches">
        <button
          type="button"
          className="match-nav__arrow"
          onClick={() => onChange(matches[index - 1].id)}
          disabled={index <= 0}
          aria-label="Previous match"
        >
          <span aria-hidden="true">‹</span>
        </button>
        <div className="match-nav__pills">
          {matches.map((match) => (
            <button
              key={match.id}
              type="button"
              className={`match-nav__pill${match.id === activeId ? " is-active" : ""}`}
              aria-pressed={match.id === activeId}
              onClick={() => onChange(match.id)}
            >
              {match.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={match.logo} alt="" className="club-logo club-logo--pill" />
              ) : null}
              {match.shortLabel}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="match-nav__arrow"
          onClick={() => onChange(matches[index + 1].id)}
          disabled={index < 0 || index === matches.length - 1}
          aria-label="Next match"
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>
      {children}
    </div>
  );
}

function buildTopics(match: MatchStats): Topic[] {
  const { offensiveScanning, betweenLinesPassing, enteringBox } = match;
  const games = match.id === "season" ? match.games : undefined;
  const isSeason = Boolean(games && games > 0);
  const seasonCaption = (what: string) =>
    match.perGame ? `Average ${what} per game` : `Total ${what} across recorded matches`;
  const scanningClip = isSeason
    ? undefined
    : matchVideoClip(match, "scanning", "Offensive scanning", "Scanning", "No offensive scan", "No scan");
  const passingClip = isSeason
    ? undefined
    : matchVideoClip(
        match,
        "passing",
        "Between-the-lines passing",
        "Between the lines",
        "Passing",
        "Wrong passes",
        "Misplaced passes",
      );

  const scanningDone = offensiveScanning.passesReceived - offensiveScanning.noOffensiveScanning;
  const scanningRate = percent(scanningDone, offensiveScanning.passesReceived);
  const passTotal = betweenLinesPassing.passes;
  const betweenLinesPct = percent(betweenLinesPassing.betweenLines, passTotal);
  const completedPasses = passTotal - betweenLinesPassing.wrong;
  const accuracyRate = percent(completedPasses, passTotal);
  const hasPhaseData = enteringBox.inOrganization + enteringBox.inTransition > 0;

  const topics: Topic[] = [
    {
      id: "scanning",
      kicker: "Scanning",
      title: "Offensive Scanning",
      phase: "build-up",
      content: (
        <>
          <MetricFlow
            items={[
              <div key="received" className="metric-card metric-card--hero">
                <ClipMetricTitle label="Passes received" href={scanningClip} />
                {games ? (
                  <CountLine value={offensiveScanning.passesReceived} unit="passes received" size="hero" />
                ) : scanningClip ? (
                  <ClipAnchor
                    href={scanningClip}
                    className="metric-card__value clip-link--value"
                    ariaLabel="Open video: Offensive scanning"
                  >
                    {formatCount(offensiveScanning.passesReceived)}
                  </ClipAnchor>
                ) : (
                  <span className="metric-card__value">{formatCount(offensiveScanning.passesReceived)}</span>
                )}
                <p className="metric-card__caption">
                  {isSeason ? seasonCaption("passes received") : "Receptions tracked for offensive scanning"}
                </p>
              </div>,
              <SplitMeter
                key="scanning"
                title="Offensive scanning"
                headline={`${formatCount(offensiveScanning.noOffensiveScanning)} of ${formatCount(
                  offensiveScanning.passesReceived,
                )} · ${percent(offensiveScanning.noOffensiveScanning, offensiveScanning.passesReceived)}% without scan`}
                primary={scanningDone}
                secondary={offensiveScanning.noOffensiveScanning}
                primaryLabel="Scanned before receiving"
                secondaryLabel="No offensive scan"
                primaryTone="positive"
                secondaryTone="warn"
                secondaryHref={scanningClip}
                games={games}
                countUnit="receptions"
              />,
            ]}
          />
          <p className="metric-card__caption" style={{ marginTop: "0.75rem" }}>
            Scanning rate: {scanningRate}% ({formatCount(scanningDone)} of {formatCount(offensiveScanning.passesReceived)})
          </p>
        </>
      ),
    },
    {
      id: "passing",
      kicker: "Passing",
      title: "Between-the-Lines Passing",
      phase: "build-up",
      content: (
        <>
          <MetricFlow
            items={[
              <div key="passes" className="metric-card metric-card--hero">
                <ClipMetricTitle label="Passes" href={passingClip} />
                {games ? (
                  <CountLine value={passTotal} unit="passes" size="hero" />
                ) : passingClip ? (
                  <ClipAnchor
                    href={passingClip}
                    className="metric-card__value clip-link--value"
                    ariaLabel="Open video: Between-the-lines passing"
                  >
                    {formatCount(passTotal)}
                  </ClipAnchor>
                ) : (
                  <span className="metric-card__value">{formatCount(passTotal)}</span>
                )}
                <p className="metric-card__caption">
                  {isSeason ? seasonCaption("passes") : "Total passes in the match"}
                </p>
              </div>,
              <div key="between" className="metric-card">
                <h3 className="metric-card__title">Between the lines</h3>
                <span className="metric-card__value">{formatCount(betweenLinesPassing.betweenLines)}</span>
                <span className="metric-card__pct">{betweenLinesPct}% of passes</span>
              </div>,
              <div key="wrong" className="metric-card">
                <h3 className="metric-card__title">Inaccurate passes</h3>
                <span className="metric-card__value">{formatCount(betweenLinesPassing.wrong)}</span>
                <span className="metric-card__pct">{percent(betweenLinesPassing.wrong, passTotal)}% of passes</span>
              </div>,
            ]}
          />
          <SplitMeter
            title="Pass accuracy"
            headline={`${accuracyRate}% · ${formatCount(completedPasses)} of ${formatCount(passTotal)} completed`}
            primary={completedPasses}
            secondary={betweenLinesPassing.wrong}
            primaryLabel="Completed"
            secondaryLabel="Inaccurate passes"
            primaryTone="positive"
            secondaryTone="warn"
            secondaryHref={passingClip}
            games={games}
            countUnit="passes"
          />
        </>
      ),
    },
    {
      id: "entering-box",
      kicker: "Final third",
      title: "Entering the Penalty Area",
      phase: "build-up",
      content: (
        <>
          <div className="metric-card metric-card--hero">
            <h3 className="metric-card__title">Total</h3>
            {games ? (
              <CountLine value={enteringBox.total} unit="entries" size="hero" />
            ) : (
              <span className="metric-card__value">{formatCount(enteringBox.total)}</span>
            )}
            <p className="metric-card__caption">
              {isSeason ? seasonCaption("penalty area entries") : "Entries into the opposition penalty area"}
            </p>
          </div>
          {hasPhaseData ? (
            <SplitMeter
              title="Phase of play"
              headline={`${formatCount(enteringBox.inOrganization)} in possession · ${formatCount(
                enteringBox.inTransition,
              )} in transition`}
              primary={enteringBox.inOrganization}
              secondary={enteringBox.inTransition}
              primaryLabel="In possession"
              secondaryLabel="In transition"
              primaryTone="accent"
              secondaryTone="muted"
              games={games}
              countUnit="entries"
            />
          ) : null}
          {enteringBox.organizationRightWing > 0 ? (
            <div className="metric-card">
              <h3 className="metric-card__title">In possession — right channel</h3>
              <p className="metric-card__headline">
                {formatCount(enteringBox.organizationRightWing)} of {formatCount(enteringBox.inOrganization)} via the
                right channel
              </p>
              <p className="metric-card__caption">
                In-possession entries that came from attacks down the right channel.
              </p>
            </div>
          ) : null}
        </>
      ),
    },
  ];

  return topics;
}

export function GameStatsReport({ report }: GameStatsReportProps) {
  const { player, meta, matches } = report;
  const [seasonMode, setSeasonMode] = useState<SeasonMode>("total");
  const options = useMemo(() => {
    const season = seasonMatch(matches);
    return [...matches, seasonMode === "perGame" ? perGameMatch(season) : season];
  }, [matches, seasonMode]);
  const initialMatchId = matches[0]?.id ?? "";
  const [matchId, setMatchId] = useState(initialMatchId);
  const match = options.find((item) => item.id === matchId) ?? options[0];
  const exportStats = useMemo(() => toGameStats(report, match), [report, match]);
  const topics = useMemo(() => buildTopics(match), [match]);

  return (
    <VideoLinksProvider
      key={match.id}
      initialScanningVideoLink={match.offensiveScanning.videoLink}
      initialPassingVideoLink={match.betweenLinesPassing.videoLink}
    >
      <SgaCornerBrand />

      <div className="shell">
        <header className="report-header">
          <SgaBrand />
          <div className="report-header__intro">
            <p className="report-header__eyebrow">{BRAND.legal}</p>
            <h1 className="report-header__title">{meta.title}</h1>
            <p className="report-header__meta">
              {match.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={match.logo} alt="" className="club-logo club-logo--meta" />
              ) : null}
              {match.label}
            </p>
          </div>
        </header>

        <div className="report-grid">
          <AthleteProfileCard
            name={player.name}
            club={player.club}
            clubLogo={player.clubLogo}
            photoSrc={player.photo}
          >
            <ExportPdfButton stats={exportStats} />
          </AthleteProfileCard>

          <main className="report-main">
            <div className="view-panel">
              <MatchSwitcher matches={options} activeId={match.id} onChange={setMatchId}>
                {match.id === "season" ? <SeasonModeToggle mode={seasonMode} onChange={setSeasonMode} /> : null}
              </MatchSwitcher>
              <TopicsBoard topics={topics} />
            </div>
          </main>
        </div>

        <footer className="footer">
          <p className="footer__slogan">{BRAND.slogan}</p>
          <p className="footer__rights">All rights reserved.</p>
        </footer>
      </div>
    </VideoLinksProvider>
  );
}
