"use client";
import { ReactElement, createRef, forwardRef, useEffect, useRef, useState } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import { CustomControl } from "@/ui/map-controls/control";
import { ControlButton } from "@/ui/map-controls/control-button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocation } from "@fortawesome/free-solid-svg-icons/faLocation";


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
