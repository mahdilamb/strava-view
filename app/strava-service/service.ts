"use server";

import { PolylineMap, SummaryActivity } from "../strava";
import { decode } from "@googlemaps/polyline-codec";

export type SummaryActivityDecoded = Omit<
  SummaryActivity,
  "map" | "startDate"
> & {
  startDate?: Date;
  map: Omit<PolylineMap, "summaryPolyline"> & {
    summaryPolyline?: [number, number][];
  };
};

export const decodeSummaryActivity = (
  data: SummaryActivity[],
): SummaryActivityDecoded[] => {
  return data.map((entry) => {
    return {
      ...entry,
      startDate: entry.startDate ? new Date(entry.startDate) : undefined,
      map: {
        ...entry.map,
        summaryPolyline: entry.map?.summaryPolyline
          ? decode(entry.map?.summaryPolyline)
          : undefined,
      },
    };
  });
};
