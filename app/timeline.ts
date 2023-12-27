import { LatLngBounds, Map, Polygon, Polyline, polyline } from "leaflet";
import { SummaryActivityDecoded } from "./strava-service/service";
import { ActivityTarget } from "./components/map-controls/target";

export type Animator = {
  play: (map: Map) => Promise<void>;
  reset: (map: Map) => void;
  steps: number;
};
const sleep = (duration: number) => {
  return new Promise((resolve) => setTimeout(resolve, duration));
};

const moveTo = async (
  map: Map,
  bounds: LatLngBounds,
  duration: number = 1000,
) => {
  map.fitBounds(bounds, {
    animate: true,
    duration: duration * 0.25,
    padding: [2, 2],
  });
  await sleep(duration * 0.25);
  map.fitBounds(bounds, { animate: true, duration: duration * 0.5 });
  await sleep(duration * 0.5);
  map.fitBounds(bounds, {
    animate: true,
    duration: duration * 0.25,
    padding: [2, 2],
  });
  return sleep(duration * 0.25);
};
export const activityAnimator = (
  activities: SummaryActivityDecoded[],
  targets: ActivityTarget[],
) => {
  activities = activities.filter((activity) => activity.map.summaryPolyline);
  const activityTargets: (ActivityTarget | undefined)[] = activities.map(
    (activity) => {
      var assignedTarget;
      targets.forEach((target) => {
        if (target.predicate(activity)) {
          assignedTarget = target;
        }
      });
      return assignedTarget;
    },
  );
  const polygons = activities.map((activity) => {
    return new Polygon(activity.map.summaryPolyline);
  });
  const lineBounds = polygons.map((polygon) => polygon.getBounds());
  var groups: LatLngBounds[] = [];
  if (lineBounds.length) {
    groups.push(lineBounds[0]);
    lineBounds.slice(1).forEach((bound) => {
      if (
        !groups.some((overlap) => {
          if (overlap.overlaps(bound)) {
            overlap.extend(bound);
            return true;
          }
          return false;
        })
      ) {
        groups.push(bound);
      }
    });
  }
  var reset = (map: Map) => {
    console.log(map.locate().getCenter());
    map.setView(map.locate().getCenter(), 13);
  };
  var play = async (map: Map) => {};
  var steps = 0;
  if (groups.length) {
    var annotations: Polyline[] = [];
    const allBounds = groups.reduce(
      (prev, current) => prev.extend(current),
      new LatLngBounds(groups[0].getSouthWest(), groups[0].getNorthEast()),
    );
    reset = (map: Map) => {
      map.fitBounds(allBounds);
      annotations.forEach((ann) => ann.remove());
      annotations = [];
    };
    const boundGroups = lineBounds.map((bound) =>
      groups.find((group) => group.contains(bound)),
    ) as LatLngBounds[];
    var annotation;
    play = async (map: Map) => {
      var i = 0;
      annotations.push(
        (annotation = polyline(activities[i].map.summaryPolyline, {
          color: activityTargets[i]?.color || "grey",
          opacity: 0.7,
          weight: 4,
        })),
      );
      map.fitBounds(boundGroups[i], { animate: true, duration: 100 });
      annotation.addTo(map);
      for (var i = 1; i < activities.length; ++i) {
        if (i == 1 || boundGroups[i] !== boundGroups[i - 1]) {
          await moveTo(map, boundGroups[i], 800);
        }

        annotations.push(
          (annotation = polyline(activities[i].map.summaryPolyline, {
            color: activityTargets[i]?.color || "grey",
            opacity: 0.7,
            weight: 4,
          })),
        );

        annotation.addTo(map);
        await sleep(2);

        // targets.forEach(target => target.count[1](activityTargets.slice(0, i).filter(activityTarget => activityTarget?.name === target.name).length))
      }
      map.fitBounds(allBounds, { animate: true, duration: 600 });
    };
    steps = activities.length;
  }
  return {
    reset: reset,
    play: play,
    steps: steps,
  };
};
