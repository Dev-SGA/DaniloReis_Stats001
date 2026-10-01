import gameStats from "@/data/gameStats.json";

export type GameStats = {
  meta: {
    title: string;
    subtitle: string;
    session: string;
  };
  player: {
    name: string;
    club: string;
    photo: string;
  };
  offensiveScanning: {
    passesReceived: number;
    noOffensiveScanning: number;
    videoLink: string;
  };
  betweenLinesPassing: {
    passes: number;
    betweenLines: number;
    wrong: number;
    videoLink: string;
  };
  enteringBox: {
    total: number;
    inOrganization: number;
    inTransition: number;
    organizationRightWing: number;
  };
};

export function getGameStats(): GameStats {
  return gameStats as GameStats;
}
