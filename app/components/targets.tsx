import { ActivityTarget } from "./target";

export function Targets(props: {
  targets: ActivityTarget[],
  setTargets: (targets: ActivityTarget[]) => void
}) {
  return <ul className="" style={{ background: "green" }}></ul>;
}
