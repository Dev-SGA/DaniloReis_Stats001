import { formatCount } from "@/lib/stats";

type CountLineProps = {
  value: number;
  unit: string;
  className?: string;
  /** hero = large figure for lead cards, compact = secondary cards. */
  size?: "hero" | "compact";
};

/** Season readout: big figure with its unit label. */
export function CountLine({ value, unit, className, size = "compact" }: CountLineProps) {
  const classes = ["count-line", `count-line--${size}`, "count-line--single", className ?? ""].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <div className="count-line__total">
        <span className="count-line__value">{formatCount(value)}</span>
        <span className="count-line__unit">{unit}</span>
      </div>
    </div>
  );
}
