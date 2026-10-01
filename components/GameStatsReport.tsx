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
      title: "Mapeamento Ofensivo (Scanning)",
      phase: "build-up",
      content: (
        <>
          <MetricFlow
            items={[
              <div key="received" className="metric-card metric-card--hero">
                <h3 className="metric-card__title">Passes recebidos</h3>
                <span className="metric-card__value">{offensiveScanning.passesReceived}</span>
                <p className="metric-card__caption">Total de recepções analisadas no mapeamento ofensivo</p>
              </div>,
              <SplitMeter
                key="scanning"
                title="Mapeamento ofensivo"
                headline={`${offensiveScanning.noOffensiveScanning} de ${offensiveScanning.passesReceived} · ${percent(
                  offensiveScanning.noOffensiveScanning,
                  offensiveScanning.passesReceived,
                )}% sem mapeamento`}
                primary={scanningDone}
                secondary={offensiveScanning.noOffensiveScanning}
                primaryLabel="Com mapeamento ofensivo"
                secondaryLabel="Não fez mapeamento ofensivo"
                primaryTone="positive"
                secondaryTone="negative"
              />,
            ]}
          />
          <p className="metric-card__caption" style={{ marginTop: "0.75rem" }}>
            Taxa de mapeamento: {scanningRate}% ({scanningDone} de {offensiveScanning.passesReceived})
          </p>
          <ClipLinks scope="scanning" />
        </>
      ),
    },
    {
      id: "passing",
      title: "Passe entrelinhas (Passing)",
      phase: "build-up",
      content: (
        <>
          <MetricFlow
            items={[
              <div key="passes" className="metric-card metric-card--hero">
                <h3 className="metric-card__title">Passes</h3>
                <span className="metric-card__value">{passTotal}</span>
                <p className="metric-card__caption">Total de passes no jogo</p>
              </div>,
              <div key="between" className="metric-card">
                <h3 className="metric-card__title">Entrelinhas</h3>
                <span className="metric-card__value">{betweenLinesPassing.betweenLines}</span>
                <span className="metric-card__pct">{betweenLinesPct}% dos passes</span>
              </div>,
              <div key="wrong" className="metric-card">
                <h3 className="metric-card__title">Errados</h3>
                <span className="metric-card__value">{betweenLinesPassing.wrong}</span>
                <span className="metric-card__pct">{percent(betweenLinesPassing.wrong, passTotal)}% dos passes</span>
              </div>,
            ]}
          />
          <SplitMeter
            title="Precisão de passe"
            headline={`${accuracyRate}% · ${completedPasses} de ${passTotal} completos`}
            primary={completedPasses}
            secondary={betweenLinesPassing.wrong}
            primaryLabel="Completos"
            secondaryLabel="Errados"
            primaryTone="positive"
            secondaryTone="negative"
          />
          <ClipLinks scope="passing" />
        </>
      ),
    },
    {
      id: "entering-box",
      title: "Pisar na Área",
      phase: "build-up",
      content: (
        <>
          <div className="metric-card metric-card--hero">
            <h3 className="metric-card__title">Total</h3>
            <span className="metric-card__value">{enteringBox.total}</span>
            <p className="metric-card__caption">Entradas na área adversária</p>
          </div>
          <SplitMeter
            title="Contexto da entrada"
            headline={`${enteringBox.inOrganization} em organização · ${enteringBox.inTransition} em transição`}
            primary={enteringBox.inOrganization}
            secondary={enteringBox.inTransition}
            primaryLabel="Em organização"
            secondaryLabel="Em transição"
            primaryTone="accent"
            secondaryTone="muted"
          />
          <div className="metric-card">
            <h3 className="metric-card__title">Organização — corredor direito</h3>
            <p className="metric-card__headline">
              {enteringBox.organizationRightWing} de {enteringBox.inOrganization} em jogadas pelo corredor direito
            </p>
            <p className="metric-card__caption">
              Dos {enteringBox.inOrganization} em organização, todos em jogadas pelo corredor direito.
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
