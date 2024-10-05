

import { PolylineMap, SummaryActivity } from "@/strava";

export type SummaryActivityDecoded = Omit<
  SummaryActivity,
  "map" | "startDate"
> & {
  startDate?: Date;
  map: Omit<PolylineMap, "summaryPolyline"> & {
    summaryPolyline?: [number, number][];
  };
};

