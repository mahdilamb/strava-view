"use client";
import { DBSchema, IDBPDatabase, openDB } from "idb";
import {
  ActivitiesApi,
  ActivityType,
  Configuration,
  DetailedActivity,
  SportType,
  SummaryActivity,
} from "@/strava";
import { AuthTokenDetails } from "@/lib/strava-service/authorization";
import { detailsSynced, syncActivityDetails } from "./activities";
import { activityIds } from "./activity-summaries";

type Synchronization = {
  startKey: number;
  store: keyof StravaDBv1;
  completed?: Date;
};
type SynchronizationKey = number;
type Synchronizable<T> = T & { synchronizedIdx: SynchronizationKey };
type SanitizedSummaryActivity = Omit<SummaryActivity, "startDate"> & {
  startDate?: Date;
};

export interface StravaDBv1 extends DBSchema {
  synchronizations: {
    key: SynchronizationKey;
    value: Synchronization;
  };
  activitySummaries: {
    key: number;
    value: Synchronizable<SanitizedSummaryActivity>;
    indexes: {
      typeIdx: ActivityType;
      sportTypeIdx: SportType;
      startDateIdx: Date;
      typeAndDateIdx: [ActivityType, Date];
      sportTypeAndDateIdx: [SportType, Date];
      synchronizationIdx: SynchronizationKey;
    };
  };
  activityDetails: {
    key: number;
    value: DetailedActivity;
    indexes: {
      typeIdx: ActivityType;
    };
  };
}

export type StravaDB = IDBPDatabase<StravaDBv1>;
export type StravaActivity = Synchronizable<SummaryActivity>;

export async function initDB(): Promise<IDBPDatabase<StravaDBv1>> {
  return await openDB<StravaDBv1>("strava-replay", 2, {
    upgrade: (db) => {
      db.createObjectStore("synchronizations");

      const activitySummaries = db.createObjectStore("activitySummaries");
      activitySummaries.createIndex("typeIdx", "type");
      activitySummaries.createIndex("sportTypeIdx", "sportType");
      activitySummaries.createIndex("startDateIdx", "startDate");
      activitySummaries.createIndex("typeAndDateIdx", ["type", "startDate"]);
      activitySummaries.createIndex("sportTypeAndDateIdx", [
        "sportType",
        "startDate",
      ]);
      activitySummaries.createIndex("synchronizationIdx", "synchronizationIdx");
      const activityDetails = db.createObjectStore("activityDetails");
      activityDetails.createIndex("typeIdx", "type");
    },
  });
}
export const lastSynchronization = async (db: IDBPDatabase<StravaDBv1>) => {
  const synchronizations = await db.getAllKeys("synchronizations");
  const lastSynchronizationKey = synchronizations.length
    ? Math.max(...synchronizations)
    : undefined;
  if (lastSynchronizationKey) {
    const lastSynchronization = await db.get(
      "synchronizations",
      lastSynchronizationKey,
    );

    if (!lastSynchronization?.completed) {
      const tx = db.transaction("activitySummaries", "readwrite");
      const index = tx.store.index("synchronizationIdx");
      for await (const cursor of index.iterate(lastSynchronizationKey)) {
        await cursor.delete();
      }
      await db
        .transaction("synchronizations", "readwrite")
        .store.delete(lastSynchronizationKey);
    }
    return lastSynchronization;
  }
};
const initSynchronization = async (
  db: IDBPDatabase<StravaDBv1>,
  store: keyof StravaDBv1,
  startKey: number,
): Promise<[SynchronizationKey, () => Promise<void>]> => {
  const tx = db.transaction("synchronizations", "readwrite");
  const synchronization: Synchronization = {
    store: store,
    completed: undefined,
    startKey: startKey,
  };
  const [synchronizationKey, ..._] = await Promise.all([
    tx.store.add(synchronization, new Date().getTime()),
    tx.done,
  ]);
  return [
    synchronizationKey,
    async () => {
      const tx = db.transaction("synchronizations", "readwrite");
      await Promise.all([
        tx.store.put(
          { ...synchronization, completed: new Date() },
          synchronizationKey,
        ),
        tx.done,
      ]);
    },
  ];
};

const insertActivities = async (
  db: IDBPDatabase<StravaDBv1>,
  synchronizationKey: SynchronizationKey,
  values: SummaryActivity[],
  getNextValues: (pageNumber: number) => Promise<SummaryActivity[]>,
  page: number,
  upToKey: number | undefined,
) => {
  const toAdd = values.findIndex((value) => value.id === upToKey);
  const sanitizedValues: Synchronizable<SanitizedSummaryActivity>[] = (
    toAdd !== -1 ? values.slice(0, toAdd) : values
  ).map((value) => {
    return {
      ...value,
      synchronizedIdx: synchronizationKey,
      startDate: value.startDate ? new Date(value.startDate) : undefined,
    };
  });
  const tx = db.transaction("activitySummaries", "readwrite");
  await Promise.all([
    ...sanitizedValues.map((value) => tx.store.add(value, value.id)),
    tx.done,
  ]);
  if (toAdd === -1 && values.length) {
    await insertActivities(
      db,
      synchronizationKey,
      await getNextValues(page + 1),
      getNextValues,
      page + 1,
      upToKey,
    );
  }
};

async function syncSummaries(
  db: IDBPDatabase<StravaDBv1>,
  auth: AuthTokenDetails,
  deleteToken: () => void,
) {
  const activitiesApi = new ActivitiesApi(
    new Configuration({
      headers: { Authorization: `Bearer ${auth.access_token}` },
    }),
  );

  const { startKey: upToKey } = await lastSynchronization(db);
  const page = await activitiesApi
    .getLoggedInAthleteActivities({ page: 1 })
    .catch(() => {
      console.debug("Deleting token as failed to synchronize db");
      deleteToken();
      return window.location.reload();
    })
    .then(async (page) => {
      return page?.map((activity) => {
        return {
          ...activity,
          startDate: activity.startDate
            ? new Date(activity.startDate)
            : undefined,
        };
      });
    });
  if (!page || !page.length || page[0].id === upToKey) {
    return db;
  }

  const [synchronizationKey, completeSynchronization] =
    await initSynchronization(db, "activitySummaries", page[0].id as number);
  await insertActivities(
    db,
    synchronizationKey,
    page,
    async (pageNumber) => {
      return await activitiesApi.getLoggedInAthleteActivities({
        page: pageNumber,
      });
    },
    1,
    upToKey,
  );
  await completeSynchronization();
  return db;
}

export async function syncDB(
  db: IDBPDatabase<StravaDBv1>,
  auth: AuthTokenDetails,
  deleteToken: () => void,
) {
  return await syncSummaries(db, auth, deleteToken);
}

const createBatcher = <T>(batchSize: number) => {
  return (arr: T[]) => {
    const numBatches = Math.ceil(arr.length / batchSize);
    return Array.from({ length: numBatches }, (_, i) =>
      arr.slice(i * batchSize, Math.min(arr.length, (i + 1) * batchSize)),
    );
  };
};
const batchBy10 = createBatcher<number>(10);
export async function syncDetails(
  db: IDBPDatabase<StravaDBv1>,
  api: ActivitiesApi,
  deleteToken: () => void,
  ids?: number[],
): Promise<DetailedActivity[]> {
  if (ids === undefined) {
    const synced = new Set(await detailsSynced(db));
    ids = (await activityIds(db)).filter((v) => !synced.has(v));
  }
  const results: DetailedActivity[] = [];
  //TODO add re-sync timeout
  let error = undefined;
  for (let batch of batchBy10(ids)) {
    if (error !== undefined) {
      break;
    }
    console.log(`Syncing ${batch}`);
    await Promise.all(
      batch.map(async (id) => {
        return await syncActivityDetails(db, api, id);
      }),
    )
      .then((result) => {
        results.push(...result);
        return [];
      })
      .catch((reason) => {
        console.error(reason);
        error = reason;
        return [];
      });
  }

  return results;
}
