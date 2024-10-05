import { DetailedActivity } from "@/strava";
import { ActivitiesApi } from "@/strava/apis/ActivitiesApi";
import { StravaDB } from "./sync";
export const getActivityDetails = async (
  db: StravaDB,
  id: number,
): Promise<DetailedActivity> => {
  let tx = db.transaction("activityDetails", "readwrite");
  let store = tx.store;
  const [existingDetails, ..._] = await Promise.all([
    await store.get(id),
    tx.done,
  ]);
  return existingDetails;
};

export const syncActivityDetails = async (
  db: StravaDB,
  api: ActivitiesApi,
  id: number,
): Promise<DetailedActivity> => {
  let tx = db.transaction("activityDetails", "readwrite");
  let store = tx.store;
  const [existingDetails, ..._] = await Promise.all([
    await store.get(id),
    tx.done,
  ]);
  if (existingDetails === undefined) {
    const activityDetails = await api.getActivityById({ id: id });
    tx = db.transaction("activityDetails", "readwrite")
    store = tx.store;
    await Promise.all([store.add(activityDetails, id), tx.done]);
    return activityDetails;
  }

  return existingDetails;
};

export async function detailsSynced(db: StravaDB) {
  return await db.getAllKeys("activityDetails");
}
