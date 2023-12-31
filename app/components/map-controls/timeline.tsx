"use client";
import {
  FitBoundsOptions,
  LatLngBounds,
  LatLngExpression,
  latLngBounds,
} from "leaflet";
import { ActivityTarget } from "./targets";
import { SummaryActivityDecoded } from "@/app/strava-service/service";
import { CustomControl } from "./control";
import { useMap, Polyline, TileLayer, Rectangle } from "react-leaflet";
import { sleep } from "@/app/animations";
import { combineBounds } from "@/app/coordinates";
import { useCallback, useEffect, useState } from "react";
import { TracedPolyline } from "./traced-polyline";
import * as mapLayers from "@/app/map-layers";
import { CacheableTileLayer } from "./cachable-tile-layer";

const DRAW_DURATION_MS = 10;
const PAN_DURATION_MS = 100;

export const Timeline = (props: {
  activities: SummaryActivityDecoded[];
  targets: ActivityTarget[];
  activityIdx: number;
  setActivityIdx: (idx: number) => void;
}) => {
  const { activities, targets, activityIdx, setActivityIdx } = props;
  const [playing, setPlaying] = useState(false);
  const [restWidth, setRestWidth] = useState(2);
  const map = useMap();
  const sortedTargets = targets.slice().sort((a, b) => a.priority - b.priority);
  const activityTargets = activities.map((activity) =>
    sortedTargets.find((target) => target.predicate(activity)),
  );
  const bounds = activities.map((activity) =>
    latLngBounds(activity.map.summaryPolyline as LatLngExpression[]),
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
      map.fitBounds(allBounds as LatLngBounds, options);
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
          setActivityIdx(-1);
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
    // if (allBounds) {
    //   setRestWidth(8);
    //   reset();
    // }
    nextFrame();
  }, [
    activities.length,
    activityIdx,
    allBounds,
    boundGroups,
    map,
    playing,
    reset,
    setActivityIdx,
  ]);
  if (!groupedBounds.length) {
    return <></>;
  }
  return (
    <>
      {playing ? (
        <CacheableTileLayer {...mapLayers.CartoDB.Positron} />
      ) : (
        <TileLayer {...mapLayers.CartoDB.Positron} />
      )}
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
                positions={activity.map.summaryPolyline as LatLngExpression[]}
                color={activityTargets[i]?.color ?? "grey"}
                opacity={0.7}
                weight={3}
                markerRadius={20}
              ></TracedPolyline>
            ) : (
              <Polyline
                key={activity.id}
                positions={activity.map.summaryPolyline as LatLngExpression[]}
                color={activityTargets[i]?.color ?? "grey"}
                opacity={0.7}
                weight={2}
              ></Polyline>
            );
          })
        : activities.map((activity, i) => (
            <Polyline
              key={`rested-${activity.id}`}
              positions={activity.map.summaryPolyline as LatLngExpression[]}
              color={activityTargets[i]?.color ?? "grey"}
              opacity={0.7}
              weight={restWidth}
            ></Polyline>
          ))}
    </>
  );
};
