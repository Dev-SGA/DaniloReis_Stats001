import { Fragment, type ReactNode } from "react";

type MetricFlowProps = {
  items: ReactNode[];
};

export function MetricFlow({ items }: MetricFlowProps) {
  return (
    <div className="metric-flow">
      {items.map((item, index) => (
        <Fragment key={index}>
          {index > 0 ? <span className="metric-flow__arrow" aria-hidden="true" /> : null}
          {item}
        </Fragment>
      ))}
    </div>
  );
}
