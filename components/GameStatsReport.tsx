"use client";

import { AthleteProfileCard } from "@/components/AthleteProfileCard";
import { ExportPdfButton } from "@/components/ExportPdfButton";
import { ClipLinks } from "@/components/ClipLinks";
import { VideoLinksProvider } from "@/components/VideoLinksContext";
import { MetricFlow } from "@/components/MetricFlow";
import { SgaBrand } from "@/components/SgaBrand";
import { SgaCornerBrand } from "@/components/SgaCornerBrand";
import { TopicsBoard, type Topic } from "@/components/TopicsBoard";
import { BRAND } from "@/lib/brand";
import type { GameStats } from "@/lib/stats";

type GameStatsReportProps = {
  stats: GameStats;
};

type BarTone = "accent" | "positive" | "negative" | "muted";

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
}: {
  title: string;
  primary: number;
  secondary: number;
  primaryLabel: string;
  secondaryLabel: string;
  primaryTone: BarTone;
  secondaryTone: BarTone;
  headline: string;
}) {
  const total = primary + secondary;
  const primaryPct = percent(primary, total);

  return (
    <div className="metric-card">
      <h3 className="metric-card__title">{title}</h3>
      <p className="metric-card__headline">{headline}</p>
      <div className="meter" role="img" aria-label={`${primaryLabel}: ${primary}. ${secondaryLabel}: ${secondary}.`}>
        <span className={`meter__seg meter__seg--${primaryTone}`} style={{ width: `${primaryPct}%` }} />
        <span className={`meter__seg meter__seg--${secondaryTone}`} style={{ width: `${100 - primaryPct}%` }} />
      </div>
      <ul className="legend">
        <li>
          <span className={`legend__dot legend__dot--${primaryTone}`} />
          <span className="legend__label">{primaryLabel}</span>
          <strong>{primary}</strong>
        </li>
        <li>
          <span className={`legend__dot legend__dot--${secondaryTone}`} />
          <span className="legend__label">{secondaryLabel}</span>
          <strong>{secondary}</strong>
        </li>
      </ul>
    </div>
  );
}

export function GameStatsReport({ stats }: GameStatsReportProps) {
  const { player, offensiveScanning, betweenLinesPassing, enteringBox, meta } = stats;

  const scanningDone = offensiveScanning.passesReceived - offensiveScanning.noOffensiveScanning;
  const scanningRate = percent(scanningDone, offensiveScanning.passesReceived);

  const passTotal = betweenLinesPassing.passes;
  const betweenLinesPct = percent(betweenLinesPassing.betweenLines, passTotal);
  const completedPasses = passTotal - betweenLinesPassing.wrong;
  const accuracyRate = percent(completedPasses, passTotal);

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
                <h3 className="metric-card__title">Passes received</h3>
                <span className="metric-card__value">{offensiveScanning.passesReceived}</span>
                <p className="metric-card__caption">Receptions tracked for offensive scanning</p>
              </div>,
              <SplitMeter
                key="scanning"
                title="Offensive scanning"
                headline={`${offensiveScanning.noOffensiveScanning} of ${offensiveScanning.passesReceived} · ${percent(
                  offensiveScanning.noOffensiveScanning,
                  offensiveScanning.passesReceived,
                )}% without scan`}
                primary={scanningDone}
                secondary={offensiveScanning.noOffensiveScanning}
                primaryLabel="Scanned before receiving"
                secondaryLabel="No offensive scan"
                primaryTone="positive"
                secondaryTone="negative"
              />,
            ]}
          />
          <p className="metric-card__caption" style={{ marginTop: "0.75rem" }}>
            Scanning rate: {scanningRate}% ({scanningDone} of {offensiveScanning.passesReceived})
          </p>
          <ClipLinks scope="scanning" />
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
                <h3 className="metric-card__title">Passes</h3>
                <span className="metric-card__value">{passTotal}</span>
                <p className="metric-card__caption">Total passes in the match</p>
              </div>,
              <div key="between" className="metric-card">
                <h3 className="metric-card__title">Between the lines</h3>
                <span className="metric-card__value">{betweenLinesPassing.betweenLines}</span>
                <span className="metric-card__pct">{betweenLinesPct}% of passes</span>
              </div>,
              <div key="wrong" className="metric-card">
                <h3 className="metric-card__title">Misplaced</h3>
                <span className="metric-card__value">{betweenLinesPassing.wrong}</span>
                <span className="metric-card__pct">{percent(betweenLinesPassing.wrong, passTotal)}% of passes</span>
              </div>,
            ]}
          />
          <SplitMeter
            title="Pass accuracy"
            headline={`${accuracyRate}% · ${completedPasses} of ${passTotal} completed`}
            primary={completedPasses}
            secondary={betweenLinesPassing.wrong}
            primaryLabel="Completed"
            secondaryLabel="Misplaced"
            primaryTone="positive"
            secondaryTone="negative"
          />
          <ClipLinks scope="passing" />
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
            <span className="metric-card__value">{enteringBox.total}</span>
            <p className="metric-card__caption">Entries into the opposition penalty area</p>
          </div>
          <SplitMeter
            title="Phase of play"
            headline={`${enteringBox.inOrganization} in possession · ${enteringBox.inTransition} in transition`}
            primary={enteringBox.inOrganization}
            secondary={enteringBox.inTransition}
            primaryLabel="In possession"
            secondaryLabel="In transition"
            primaryTone="accent"
            secondaryTone="muted"
          />
          <div className="metric-card">
            <h3 className="metric-card__title">In possession — right channel</h3>
            <p className="metric-card__headline">
              {enteringBox.organizationRightWing} of {enteringBox.inOrganization} via the right channel
            </p>
            <p className="metric-card__caption">
              All {enteringBox.inOrganization} in-possession entries came from attacks down the right channel.
            </p>
          </div>
        </>
      ),
    },
  ];

  return (
    <VideoLinksProvider
      initialScanningVideoLink={offensiveScanning.videoLink}
      initialPassingVideoLink={betweenLinesPassing.videoLink}
    >
      <SgaCornerBrand />

      <div className="shell">
        <header className="report-header">
          <SgaBrand />
          <div className="report-header__intro">
            <p className="report-header__eyebrow">{BRAND.legal}</p>
            <h1 className="report-header__title">{meta.title}</h1>
            <p className="report-header__meta">{meta.subtitle}</p>
          </div>
        </header>

        <div className="report-grid">
          <AthleteProfileCard name={player.name} club={player.club} photoSrc={player.photo}>
            <ExportPdfButton stats={stats} />
          </AthleteProfileCard>

          <main className="report-main">
            <TopicsBoard topics={topics} />
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
