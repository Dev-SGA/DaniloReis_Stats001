import { GameStatsReport } from "@/components/GameStatsReport";
import { getGameStats } from "@/lib/stats";

export default function HomePage() {
  const stats = getGameStats();
  return <GameStatsReport stats={stats} />;
}
