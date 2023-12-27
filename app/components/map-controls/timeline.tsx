"use client";
import {
  LatLngBounds,
  Layer,
  Map,
  Polygon,
  latLngBounds,
  polyline,
} from "leaflet";
import { ActivityTarget } from "./targets";
import { SummaryActivityDecoded } from "@/app/strava-service/service";
import { CustomControl } from "./control";
import { Rectangle, useMap, Polyline } from "react-leaflet";
import { sleep, moveTo } from "@/app/animations";
import { combineBounds } from "@/app/coordinates";
import { off } from "process";
import { ReactElement } from "react";

export const Timeline = (props: {
  activities: SummaryActivityDecoded[];
  targets: ActivityTarget[];
}) => {
  const { activities, targets } = props;
  const map = useMap();
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
  const bounds = activities.map((activity) =>
    latLngBounds(activity.map.summaryPolyline),
  );
  var groupedBounds = combineBounds(bounds);
  if (!groupedBounds.length) {
    return <></>;
  }

  var annotations: Layer[] = [];
  const allBounds = groupedBounds.reduce(
    (prev, current) => prev.extend(current),
    new LatLngBounds(
      groupedBounds[0].getSouthWest(),
      groupedBounds[0].getNorthEast(),
    ),
  );
  const reset = () => {
    map.fitBounds(allBounds);
    annotations.forEach((ann) => ann.remove());
    annotations = [];
  };
  const boundGroups = bounds.map((bound) =>
    groupedBounds.find((group) => group.contains(bound)),
  ) as LatLngBounds[];
  var annotation;
  const play = async () => {
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
    }
    map.fitBounds(allBounds, { animate: true, duration: 600 });
  };

  return (
    <>
      <CustomControl className="leaflet-bar leaflet-control">
        <a
          href="#"
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            reset();
            await play();
            return false;
          }}
        >
          &#11208;
        </a>
      </CustomControl>
      {annotations}
    </>
  );
};
