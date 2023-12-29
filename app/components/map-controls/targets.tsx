import { SummaryActivityDecoded } from "../../strava-service/service";
import { SummaryActivity } from "../../strava";
import { CustomControl } from "./control";
export type ActivityTarget = {
  name: string;
  predicate: (activity: SummaryActivity | SummaryActivityDecoded) => boolean;
  color: string;
  priority: number;
};
export function Target(props: { target: ActivityTarget; count: number }) {
  const { target, count } = props;
  return (
    <li>
      <span
        className="text-xs font-medium me-2 px-2.5 py-0.5 rounded-full"
        style={{ background: target.color }}
      >
        {target.name}: {count}
      </span>
    </li>
  );
}

export function Targets(props: {
  targets: ActivityTarget[];
  setTargets: (targets: ActivityTarget[]) => void;
  counts: { [name: string]: number };
}) {
  const { targets, setTargets, counts } = props;
  return (
    <CustomControl position="bottomright">
      <ul className="flex">
        {targets.map((target) => (
          <Target
            key={target.name}
            target={target}
            count={counts[target.name]}
          ></Target>
        ))}
      </ul>
    </CustomControl>
  );
}
