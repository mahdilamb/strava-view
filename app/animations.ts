"use client";
import { LatLngBounds, Map, Polygon, Polyline, polyline } from "leaflet";

export const sleep = (duration: number) => {
  return new Promise((resolve) => setTimeout(resolve, duration));
};
export const moveTo = async (
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
