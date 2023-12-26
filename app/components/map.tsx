/* eslint-disable react/jsx-key */
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import { MapContainer } from "react-leaflet/MapContainer";

import { TileLayer } from "react-leaflet/TileLayer";
import { useMap, useMapEvents } from "react-leaflet/hooks";
import { Polyline } from "react-leaflet/Polyline";
import { SummaryActivityDecoded } from "../service";
import { ActivityTarget } from "./target";
import { LayersControl, Pane, ZoomControl } from "react-leaflet";
import { Control, DomUtil, LatLngExpression, Map as LeafletMap, control, latLngBounds } from "leaflet";
import { Animator, activityAnimator } from "../timeline";
type TimelineControlOpts = {
  target: any
}

const Timeline = (props: {
  date: Date,
  setDate: (newDate: Date) => void,
  animator: Animator
}) => {
  const map = useMap()
  const { date, setDate, animator } = props
  useEffect(
    () => {
      if (!animator.steps) {
        return
      }
      animator.reset(map)

      const TimelineControl = Control.extend({
        onAdd: function (map: LeafletMap) {
          var button = DomUtil.create('a');

          button.innerHTML = "<span>Play</span>"
          button.addEventListener("click", async (e) => {

            e.preventDefault()
            e.stopPropagation()
            animator.reset(map)
            await animator.play(map)
            return false
          })

          return button;
        },

        onRemove: function (map: LeafletMap) {
          // Nothing to do here
        }
      })
      control.timelineControl = function (opts: TimelineControlOpts) {
        return new TimelineControl(opts);
      }
      control.timelineControl({ position: 'bottomleft' }).addTo(map);
    }, [animator, map]
  )

  return <div className="leaflet-bar leaflet-control"></div>
}


export const Map = (props: {
  activities: SummaryActivityDecoded[], targets: ActivityTarget[], date: Date,
  setDate: (newDate: Date) => void,
}) => {
  const { activities, targets, date, setDate } = props
  const runs = useMemo(() => activities
    .filter(activity => !!activity.map?.summaryPolyline), [activities])
  const animator = activityAnimator(runs, targets)
  return (
    <MapContainer center={[51.505, -0.09]} zoom={6}
      className="w-dvw h-dvh flex-1"
    >

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

      />
      <Timeline date={date} setDate={setDate} animator={animator} ></Timeline>
    </MapContainer>
  );
}
