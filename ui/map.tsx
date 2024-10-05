import { useEffect, useMemo, useState } from "react";
import { MapContainer } from "react-leaflet/MapContainer";
import colorbrewer from "colorbrewer";

import { SummaryActivityDecoded } from "../lib/strava-service/service";
import { ActivityTarget } from "./map-controls/targets";

import { Targets } from "./map-controls/targets";
import { Timeline } from "./map-controls/timeline";

export const Map = (props: { activities: SummaryActivityDecoded[] }) => {
  const { activities } = props;
  const runs = useMemo(
    () => activities.filter((activity) => !!activity.map?.summaryPolyline),
    [activities],
  );
  const [activityIdx, setActivityIdx] = useState<number>(-1);
  const [targets, setTargets] = useState<ActivityTarget[]>([
    {
      name: "5km",
      predicate: (activity) => (activity.distance as number) >= 5_000,
      color: colorbrewer.Greens[3][2],
      priority: 3,
    },
    {
      name: "10km",
      predicate: (activity) => (activity.distance as number) >= 10_000,
      color: colorbrewer.Blues[3][2],
      priority: 2,
    },
    {
      name: "21.1km",
      predicate: (activity) => (activity.distance as number) >= 21_100,
      color: colorbrewer.Reds[3][2],
      priority: 1,
    },
  ]);
  const sortedTargets = targets.slice().sort((a, b) => a.priority - b.priority);
  const activityTargets = activities.map((activity) =>
    sortedTargets.find((target) => target.predicate(activity)),
  );
  return (
    <>
      <Timeline
        activities={runs}
        targets={targets}
        activityIdx={activityIdx}
        setActivityIdx={setActivityIdx}
      ></Timeline>
      <Targets
        targets={targets}
        setTargets={setTargets}
        counts={Object.fromEntries(
          targets.map((target) => [
            target.name,
            (activityIdx < 0
              ? activityTargets
              : activityTargets.slice(0, activityIdx)
            ).filter((activityTarget) => target.name === activityTarget?.name)
              .length,
          ]),
        )}
      ></Targets>
    </>
  );
};
