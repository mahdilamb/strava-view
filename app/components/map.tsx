/* eslint-disable react/jsx-key */
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import { MapContainer } from "react-leaflet/MapContainer";
import colorbrewer from "colorbrewer";

import { TileLayer, TileLayerProps } from "react-leaflet/TileLayer";
import { useMap, useMapEvents } from "react-leaflet/hooks";
import { Polyline } from "react-leaflet/Polyline";
import { SummaryActivityDecoded } from "../strava-service/service";
import { ActivityTarget } from "./map-controls/target";

import { Animator, activityAnimator } from "../timeline";
import { Targets } from "./map-controls/targets";
import { Timeline } from "./map-controls/timeline";
import * as mapLayers from "../map-layers";

export const Map = (props: { activities: SummaryActivityDecoded[] }) => {
  const { activities } = props;
  const runs = useMemo(
    () => activities.filter((activity) => !!activity.map?.summaryPolyline),
    [activities],
  );
  const [targets, setTargets] = useState<ActivityTarget[]>([
    {
      name: "5km",
      predicate: (activity) => activity.distance >= 5_000,
      color: colorbrewer.Greens[3][2],
      count: useState(0),
    },
    {
      name: "10km",
      predicate: (activity) => activity.distance >= 10_000,
      color: colorbrewer.Blues[3][2],
      count: useState(0),
    },
    {
      name: "21.1km",
      predicate: (activity) => activity.distance >= 21_100,
      color: colorbrewer.Reds[3][2],
      count: useState(0),
    },
  ]);
  const animator = activityAnimator(runs, targets);
  return (
    <MapContainer
      center={[51.505, -0.09]}
      zoom={6}
      className="w-dvw h-dvh flex-1"
    >
      <TileLayer
        {...mapLayers.Stadia.AlidadeSmooth}
      />
      <Timeline animator={animator}></Timeline>
      <Targets targets={targets} setTargets={setTargets}></Targets>
    </MapContainer>
  );
};
