import { SummaryActivityDecoded } from "../service";
import { SummaryActivity } from "../strava";

export type ActivityTarget = {
  name: string
  predicate: (activity: SummaryActivity | SummaryActivityDecoded) => boolean
  color: string
  count: [number
    , (counts: number) => void]
}
export function Target(props: { target: ActivityTarget }) {
  const { target } = props
  return (
    <li><span className="text-xs font-medium me-2 px-2.5 py-0.5 rounded-full" style={{ background: target.color }}>
      {target.name}
    </span></li>
  );
}
