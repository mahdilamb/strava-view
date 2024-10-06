"use client";
import { CustomControl } from "@/components/map-controls/control";
import { ControlButton } from "@/components/map-controls/control-button";
import { faLocation } from "@fortawesome/free-solid-svg-icons/faLocation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactElement, useEffect, useState } from "react";
import { useMapEvents } from "react-leaflet";


export const LocationControls = (props: {
  children?: ReactElement | ReactElement[];
}) => {
  const [_, setCurrentZoom] = useState<number | null>();
  const map = useMapEvents({
    zoom: () => {
      setCurrentZoom(map.getZoom());
    },
  });
  useEffect(() => {
    map.locate({ setView: true, maxZoom: map.getZoom(), enableHighAccuracy: true })
  }, [map])
  return (
    <CustomControl position="topleft" className="leaflet-bar leaflet-control">
      <ControlButton
        style={{ fontSize: 22 }}
        title="Zoom out"
        className={map.getZoom() < map.getMaxZoom() ? "" : "leaflet-disabled"}
        onClick={() => map.setZoom(map.getZoom() + 1)}
      >
        +
      </ControlButton>
      <ControlButton
        style={{ fontSize: 22 }}
        title="Zoom in"
        className={map.getZoom() > map.getMinZoom() ? "" : "leaflet-disabled"}
        onClick={() => map.setZoom(map.getZoom() - 1)}
      >
        &ndash;
      </ControlButton>
      <ControlButton
        title="Current location"
        onClick={() => map.locate({ setView: true, maxZoom: map.getZoom() })}
      >
        <FontAwesomeIcon icon={faLocation} />
      </ControlButton>
      {props.children as any}

    </CustomControl>
  );
};
