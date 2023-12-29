"use server";

import {
  ActivitiesApi,
  Configuration,
  PolylineMap,
  SummaryActivity,
} from "../strava";
import { decode } from "@googlemaps/polyline-codec";

import { readCache, writeCache } from "../cache-utils";
import { AuthTokenDetails, AuthTokenResponse } from "./tokens";
import { yearToSpan } from "../dates";
import { StravaDBv1, initDB, syncDB } from "../databases";
import { IDBPDatabase } from "idb";
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
