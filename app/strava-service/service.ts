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
export type SummaryActivityDecoded = Omit<
  SummaryActivity,
  "map" | "startDate"
> & {
  startDate?: Date;
  map: Omit<PolylineMap, "summaryPolyline"> & {
    summaryPolyline?: [number, number][];
  };
};

const decodeSummaryActivity = (
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

export async function getActivities(
  auth: AuthTokenDetails,
  timespan: [number | undefined, number | undefined] = yearToSpan(2023),
): Promise<SummaryActivityDecoded[]> {
  const params = {
    before: timespan[1] ? timespan[1] / 1000 : undefined,
    after: timespan[0] ? timespan[0] / 1000 : undefined,
    page: 1,
  };
  var combinedResult: SummaryActivity[] = [];
  const activitiesApi = new ActivitiesApi(
    new Configuration({
      headers: { Authorization: `Bearer ${auth.access_token}` },
    }),
  );
  await readCache<SummaryActivity[]>(
    `getActivities-${params.after}-${params.before}-${params.page}`,
    [],
  ).then(async (cachedPage) => {
    await activitiesApi
      .getLoggedInAthleteActivities(params)
      .then(async (returnedPage) => {
        if (cachedPage?.length && returnedPage[0].id === cachedPage[0].id) {
          combinedResult = [...cachedPage, ...combinedResult];
          while (true) {
            params.page += 1;
            cachedPage = await readCache<SummaryActivity[]>(
              `getActivities-${params.after}-${params.before}-${params.page}`,
              [],
            );
            if (!cachedPage?.length) {
              break;
            }
            combinedResult = [...cachedPage, ...combinedResult];
          }
        } else {
          await writeCache(
            `getActivities-${params.after}-${params.before}-${params.page}`,
            async () => returnedPage,
          );
          combinedResult = [...returnedPage, ...combinedResult];
          while (true) {
            params.page += 1;
            returnedPage = await writeCache<SummaryActivity[]>(
              `getActivities-${params.after}-${params.before}-${params.page}`,
              () => activitiesApi.getLoggedInAthleteActivities(params),
            );
            if (!returnedPage?.length) {
              break;
            }
            combinedResult = [...returnedPage, ...combinedResult];
          }
        }
      });
  });
  return decodeSummaryActivity(
    combinedResult.filter((activity) => activity.sportType === "Run"),
  ).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}
