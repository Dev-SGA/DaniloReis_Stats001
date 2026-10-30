import gameStats from "@/data/gameStats.json";

export type OffensiveScanning = {
  passesReceived: number;
  noOffensiveScanning: number;
  videoLink: string;
};

export type BetweenLinesPassing = {
  passes: number;
  betweenLines: number;
  wrong: number;
  videoLink: string;
};

export type EnteringBox = {
  total: number;
  inOrganization: number;
  inTransition: number;
  organizationRightWing: number;
};

export type MatchVideo = {
  label: string;
  url: string;
};

export type MatchKind = "session" | "season";

export type MatchStats = {
  id: string;
  kind?: MatchKind;
  label: string;
  shortLabel: string;
  logo: string;
  offensiveScanning: OffensiveScanning;
  betweenLinesPassing: BetweenLinesPassing;
  enteringBox: EnteringBox;
  videos?: MatchVideo[];
  /** Set on season aggregate — number of matches rolled up. */
  games?: number;
  /** Season numbers divided by the games played. */
  perGame?: boolean;
};

export type StatsReport = {
  meta: {
    title: string;
    subtitle: string;
    session: string;
  };
  player: {
    name: string;
    club: string;
    clubLogo: string;
    photo: string;
  };
  matches: MatchStats[];
};

export type GameStats = {
  meta: StatsReport["meta"] & { fileSlug: string };
  player: StatsReport["player"];
  opponentLogo: string;
  offensiveScanning: OffensiveScanning;
  betweenLinesPassing: BetweenLinesPassing;
  enteringBox: EnteringBox;
  videos?: MatchVideo[];
  games?: number;
};

export function clipUrl(videos: MatchVideo[] | undefined, ...aliases: string[]): string | undefined {
  if (!videos?.length) return undefined;
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
  const keys = new Set(aliases.map(normalize));
  return videos.find((video) => keys.has(normalize(video.label)))?.url;
}

export function matchVideoClip(
  match: MatchStats,
  scope: "scanning" | "passing",
  ...aliases: string[]
): string | undefined {
  const fromList = clipUrl(match.videos, ...aliases)?.trim();
  if (fromList) return fromList;
  const fallback = scope === "scanning" ? match.offensiveScanning.videoLink : match.betweenLinesPassing.videoLink;
  const trimmed = fallback.trim();
  return trimmed || undefined;
}

export function getStatsReport(): StatsReport {
  return gameStats as StatsReport;
}

/** Average per recorded game, with one decimal when it is not a whole number. */
export function perGame(total: number, games: number): string {
  const value = games > 0 ? total / games : 0;
  const rounded = Math.round(value * 10) / 10;
  return rounded.toFixed(1).replace(/\.0$/, "");
}

export function seasonMatch(matches: MatchStats[]): MatchStats {
  const games = matches.length;

  return {
    id: "season",
    kind: "season",
    label: "Season totals",
    shortLabel: "Season",
    logo: "",
    games,
    offensiveScanning: {
      passesReceived: matches.reduce((sum, match) => sum + match.offensiveScanning.passesReceived, 0),
      noOffensiveScanning: matches.reduce((sum, match) => sum + match.offensiveScanning.noOffensiveScanning, 0),
      videoLink: "",
    },
    betweenLinesPassing: {
      passes: matches.reduce((sum, match) => sum + match.betweenLinesPassing.passes, 0),
      betweenLines: matches.reduce((sum, match) => sum + match.betweenLinesPassing.betweenLines, 0),
      wrong: matches.reduce((sum, match) => sum + match.betweenLinesPassing.wrong, 0),
      videoLink: "",
    },
    enteringBox: {
      total: matches.reduce((sum, match) => sum + match.enteringBox.total, 0),
      inOrganization: matches.reduce((sum, match) => sum + match.enteringBox.inOrganization, 0),
      inTransition: matches.reduce((sum, match) => sum + match.enteringBox.inTransition, 0),
      organizationRightWing: matches.reduce((sum, match) => sum + match.enteringBox.organizationRightWing, 0),
    },
  };
}

/** Whole numbers stay as they are; averages show one decimal. */
export function formatCount(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return (Math.round(value * 10) / 10).toFixed(1).replace(/\.0$/, "");
}

function scaleNumbers<T>(value: T, factor: number): T {
  if (typeof value === "number") return (value * factor) as T;
  if (Array.isArray(value) || value === null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, scaleNumbers(item, factor)]),
  ) as T;
}

/** Season match with every absolute number divided by the games played. Shares stay the same. */
export function perGameMatch(season: MatchStats): MatchStats {
  const games = season.games ?? 0;
  const factor = games > 0 ? 1 / games : 0;

  return {
    ...season,
    label: "Season · Per game",
    offensiveScanning: scaleNumbers(season.offensiveScanning, factor),
    betweenLinesPassing: scaleNumbers(season.betweenLinesPassing, factor),
    enteringBox: scaleNumbers(season.enteringBox, factor),
    perGame: true,
  };
}

export function toGameStats(report: StatsReport, match: MatchStats): GameStats {
  return {
    meta: {
      ...report.meta,
      subtitle: match.label,
      fileSlug: `${report.meta.session}-${match.id}${match.perGame ? "-per-game" : ""}`,
    },
    player: report.player,
    opponentLogo: match.logo,
    offensiveScanning: match.offensiveScanning,
    betweenLinesPassing: match.betweenLinesPassing,
    enteringBox: match.enteringBox,
    videos: match.videos,
    games: match.games,
  };
}
