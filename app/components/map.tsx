/* eslint-disable react/jsx-key */
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import { MapContainer } from "react-leaflet/MapContainer";
import { Marker } from "react-leaflet/Marker";
import { Popup } from "react-leaflet/Popup";
import { TileLayer } from "react-leaflet/TileLayer";
import { useMap, useMapEvents } from "react-leaflet/hooks";
import { Polyline } from "react-leaflet/Polyline";
import { SummaryActivityDecoded } from "../service";
import { ActivityTarget } from "./target";

export function Map(props: { activities: SummaryActivityDecoded[], targets: ActivityTarget[], }) {
  return (
    <MapContainer
      className="w-dvw h-dvh flex-1"
      center={{ lat: 51.505, lng: -0.09 }}
      zoom={13}
    >
      {props.activities
        .filter(activity => !!activity.map?.summaryPolyline)
        .map((activity) => {
          var color = "grey"
          props.targets.forEach(target => {
            if (target.predicate(activity)) {
              color = target.color

            }
          })
          return <Polyline key={activity.id} positions={activity.map.summaryPolyline} color={color} opacity={.7} />
        })}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        
      />
    </MapContainer>
  );
}
