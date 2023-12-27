
import { SummaryActivityDecoded } from "../../strava-service/service";
import { SummaryActivity } from "../../strava";
import { CustomControl } from "./control";
export type ActivityTarget = {
  name: string;
  predicate: (activity: SummaryActivity | SummaryActivityDecoded) => boolean;
  color: string;
  count: [number, (counts: number) => void];
};
export function Target(props: { target: ActivityTarget }) {
  const { target } = props;
  return (
    <li>
      <span
        className="text-xs font-medium me-2 px-2.5 py-0.5 rounded-full"
        style={{ background: target.color }}
      >
        {target.name}
      </span>
    </li>
  );
}

export function Targets(props: {
  targets: ActivityTarget[];
  setTargets: (targets: ActivityTarget[]) => void;
}) {
  const { targets, setTargets } = props;
  return (
    <CustomControl position="bottomright">
      <ul className="flex">
        {targets.map(target => (
          <Target key={target.name} target={target}></Target>
        ))}
      </ul>
    </CustomControl>
  );
}
