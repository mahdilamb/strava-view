"use client";
import { FitBoundsOptions, LatLngBounds, latLngBounds } from "leaflet";
import { ActivityTarget } from "./targets";
import { SummaryActivityDecoded } from "@/app/strava-service/service";
import { CustomControl } from "./control";
import { useMap, Polyline, TileLayer } from "react-leaflet";
import { sleep } from "@/app/animations";
import { combineBounds } from "@/app/coordinates";
import { useCallback, useEffect, useState } from "react";
import { TracedPolyline } from "./traced-polyline";
import * as mapLayers from "@/app/map-layers";

const DRAW_DURATION_MS = 100;
const PAN_DURATION_MS = 1000;

export const Timeline = (props: {
  activities: SummaryActivityDecoded[];
  targets: ActivityTarget[];
}) => {
  const { activities, targets } = props;
  const [activityIdx, setActivityIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [restWidth, setRestWidth] = useState(2);
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
  const boundGroups = bounds.map((bound) =>
    groupedBounds.find((group) => group.contains(bound)),
  ) as LatLngBounds[];
  const allBounds = groupedBounds.length
    ? groupedBounds.reduce(
        (prev, current) => prev.extend(current),
        new LatLngBounds(
          groupedBounds[0].getSouthWest(),
          groupedBounds[0].getNorthEast(),
        ),
      )
    : undefined;
  const reset = useCallback(
    (options?: FitBoundsOptions) => {
      map.fitBounds(allBounds, options);
    },
    [allBounds, map],
  );
  useEffect(() => {
    const nextFrame = async () => {
      if (playing) {
        if (
          !activityIdx ||
          (boundGroups[activityIdx] !== boundGroups[activityIdx - 1] &&
            boundGroups[activityIdx])
        ) {
          map.fitBounds(boundGroups[activityIdx], {
            animate: true,
            duration: PAN_DURATION_MS,
          });
          await sleep(PAN_DURATION_MS);
        }
        await sleep(DRAW_DURATION_MS);
        setActivityIdx(activityIdx + 1);

        if (activityIdx >= activities.length) {
          setPlaying(false);
          setActivityIdx(0);
          setRestWidth(8);

          reset({ animate: true, duration: PAN_DURATION_MS });
          map.once("zoomstart movestart dragstart", () => {
            setRestWidth(2);
          });
          await sleep(PAN_DURATION_MS);

          return;
        }
      }
    };
    nextFrame();
  }, [activities.length, activityIdx, boundGroups, map, playing, reset]);

  if (!groupedBounds.length) {
    return <></>;
  }

  const { url: tileLayerUrl, ...tileLayerProps } = mapLayers.CartoDB.Positron;

  return (
    <>
      <TileLayer
        {...tileLayerProps}
        url={`/api/tiles?useCache=${playing}&url=${tileLayerUrl}`}
      />

      <CustomControl className="leaflet-bar leaflet-control">
        <a
          href="#"
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (playing) {
              setPlaying(false);
            } else {
              setRestWidth(5);

              setPlaying(true);
              reset({ animate: true, duration: PAN_DURATION_MS });
              await sleep(PAN_DURATION_MS);
            }

            return false;
          }}
        >
          &#11208;
        </a>
      </CustomControl>
      {playing
        ? activities.slice(0, activityIdx + 1).map((activity, i) => {
            return activityIdx === i && playing ? (
              <TracedPolyline
                key={activity.id}
                duration={DRAW_DURATION_MS}
                positions={activity.map.summaryPolyline}
                color={activityTargets[i]?.color ?? "grey"}
                opacity={0.7}
                weight={6}
                markerRadius={20}
              ></TracedPolyline>
            ) : (
              <Polyline
                key={activity.id}
                positions={activity.map.summaryPolyline}
                color={activityTargets[i]?.color ?? "grey"}
                opacity={0.7}
                weight={2}
              ></Polyline>
            );
          })
        : activities.map((activity, i) => (
            <Polyline
              key={`rested-${activity.id}`}
              positions={activity.map.summaryPolyline}
              color={activityTargets[i]?.color ?? "grey"}
              opacity={0.7}
              weight={restWidth}
            ></Polyline>
          ))}
    </>
  );
};
