import { ActivityTarget, Target } from "./target";

export function Targets(props: {
  targets: ActivityTarget[],
  setTargets: (targets: ActivityTarget[]) => void,
  counts: {
    [target: string]: number
  },
}) {
  const { targets, setTargets } = props
  return <ul className="flex">{targets.map((target, i) => <Target key={i} target={target}></Target>)}</ul>;
}
