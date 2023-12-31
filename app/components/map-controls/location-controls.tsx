"use client";
import { ReactElement, createRef, forwardRef, useEffect, useRef, useState } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import { CustomControl } from "@/app/components/map-controls/control";
import { ControlButton } from "@/app/components/map-controls/control-button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocation } from "@fortawesome/free-solid-svg-icons/faLocation";
import { GeoNames, useGeoNames } from "@/app/geonames-service";
import { LatLngBounds, map } from "leaflet";
import InfiniteScroll from "react-infinite-scroll-component";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
const SearchButton = forwardRef<HTMLAnchorElement>(function SearchButton(props, ref) {
  return (<ControlButton
    ref={ref}
    title="Search"
    {...props}
  >
    <FontAwesomeIcon icon={faSearch} />
  </ControlButton>)
});
const Search = (props: { map: Map }) => {
  const [q, setQ] = useState<string | null>(null)
  const [offset, setOffset] = useState<number>(0)
  const inputRef = useRef<HTMLInputElement>()
  const buttonRef = useRef<HTMLAnchorElement>()
  const { map } = props
  const active = q !== null
  const { geonames, isLoading, isError, totalResultsCount } = useGeoNames({ username: "mahdilamb", maxRows: 10, inclBbox: true, q: q?.length >= 2 ? q : undefined })
  return <div><SearchButton
    ref={buttonRef}
    onClick={() => {
      setQ(active ? q : "")
      setOffset(0)
    }}

  />{active ?
    <div style={{
      position: "fixed",
      color: "black",
      left: buttonRef.current?.clientWidth + buttonRef.current?.clientLeft
    }}><input type="text" autoFocus={true} ref={inputRef} onChange={e => {
      setQ(e.target.value)
    }}
      onKeyDown={e => {
        if (e.key === "Escape") {
          setQ(null)
          e.preventDefault()
        }
      }}></input>{<InfiniteScroll
        dataLength={totalResultsCount || 0}
        next={() => {
          setOffset(offset + 10)
          return GeoNames()({ username: "mahdilamb", maxRows: 10, startRow: offset, inclBbox: true, q: q?.length >= 2 ? q : undefined })
        }}
        hasMore={true}
        loader={<h4>Loading...</h4>}
      >
        {geonames?.map(geoname => <a href="#" style={{ width: "inherit" }} onClick={e => {
          e.stopPropagation()
          e.preventDefault()
          if (geoname.bbox) {
            map.fitBounds(new LatLngBounds([geoname.bbox.south, geoname.bbox.west], [geoname.bbox.north, geoname.bbox.east]))
          } else {
            map.setView([parseFloat(geoname.lat), parseFloat(geoname.lng)])
          }
        }} key={geoname.geonameId}>{geoname.name}</a>)}
      </InfiniteScroll>}</div> : <></>}</div>
}

export const LocationControls = (props: {
  children?: ReactElement | ReactElement[];
}) => {
  const [_, setCurrentZoom] = useState<number | null>();
  const map = useMapEvents({
    zoom: () => {
      setCurrentZoom(map.getZoom());
    },
  });
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
      <Search map={map} />
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
