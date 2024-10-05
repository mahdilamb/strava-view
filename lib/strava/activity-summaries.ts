"use client";
import { ActivityType } from "@/strava";
import { decode } from "@googlemaps/polyline-codec";
import { StravaActivity, StravaDB } from "./sync";

export async function getActivities(
  db: StravaDB,
  type?: ActivityType | undefined,
  dateRange?: [Date, Date] | undefined,
) {
  var result: StravaActivity[];
  if (type !== undefined && dateRange !== undefined) {
    result = await db.getAllFromIndex(
      "activitySummaries",
      "typeAndDateIdx",
      IDBKeyRange.bound([type, dateRange[0]], [type, dateRange[1]]),
    );
  } else if (dateRange === undefined) {
    result = await db.getAllFromIndex("activitySummaries", "typeIdx", type);
  } else if (type === undefined && (dateRange[0] - dateRange[1])) {
    result = await db.getAllFromIndex(
      "activitySummaries",
      "startDateIdx",
      IDBKeyRange.bound(dateRange[0], dateRange[1], ...[false, true]),
    );
  } else {
    result = await db.getAll("activitySummaries");
  }
  return result
    .sort(
      (a, b) =>
        (a.startDate?.getTime() as number) - (b.startDate?.getTime() as number),
    )
    .map((entry) => {
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
}

export const earliestActivity = async (db: StravaDB) => {
  return (
    await db
      .transaction("activitySummaries", "readonly")
      .store.index("startDateIdx")
      .openCursor()
  )?.value;
};

export const activityIds = async (
  db: StravaDB,
  type?: ActivityType | undefined,
  dateRange?: [Date, Date] | undefined,
) => {
  if (type !== undefined && dateRange !== undefined) {
    return await db.getAllKeysFromIndex(
      "activitySummaries",
      "typeAndDateIdx",
      IDBKeyRange.bound([type, dateRange[0]], [type, dateRange[1]]),
    );
  }
  if (dateRange === undefined) {
    return await db.getAllKeysFromIndex("activitySummaries", "typeIdx", type);
  }
  if (type === undefined) {
    return await db.getAllKeysFromIndex(
      "activitySummaries",
      "startDateIdx",
      IDBKeyRange.bound(dateRange[0], dateRange[1], ...[false, true]),
    );
  }
  return await db.getAllKeys("activitySummaries");
};
