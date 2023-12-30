import { DBSchema, IDBPDatabase, openDB } from "idb";
import {
  ActivitiesApi,
  ActivityType,
  Configuration,
  SportType,
  SummaryActivity,
} from "./strava";
import { AuthTokenDetails } from "./strava-service/tokens";
import { deleteToken } from "./tokens";
import { decodeSummaryActivity } from "./strava-service/service";

type Synchronization = {
  startKey: number;
  store: keyof StravaDBv1;
  completed?: boolean;
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
}
export async function initDB(): Promise<IDBPDatabase<StravaDBv1>> {
  return await openDB<StravaDBv1>("strava-replay", 1, {
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
    },
  });
}
const lastSynchronization = async (db: IDBPDatabase<StravaDBv1>) => {
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
      // for await (const cursor of index.iterate(lastSynchronizationKey)) {
      //   console.log(cursor);
      // }
      //TODO delete all the data from incomplete synchronization
      throw "Unsupported";
    }
    return lastSynchronization.startKey;
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
    completed: false,
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
          { ...synchronization, completed: true },
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
    ,
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

export async function syncDB(
  db: IDBPDatabase<StravaDBv1>,
  auth: AuthTokenDetails,
) {
  const activitiesApi = new ActivitiesApi(
    new Configuration({
      headers: { Authorization: `Bearer ${auth.access_token}` },
    }),
  );

  const upToKey = await lastSynchronization(db);
  const page = await activitiesApi
    .getLoggedInAthleteActivities({ page: 1 })
    .catch(() => {
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

export async function getActivities(
  db: IDBPDatabase<StravaDBv1>,
  type: ActivityType | undefined,
  dateRange: [Date, Date] | undefined,
) {
  var result: Synchronizable<SummaryActivity>[];
  if (type !== undefined && dateRange !== undefined) {
    result = await db.getAllFromIndex(
      "activitySummaries",
      "typeAndDateIdx",
      IDBKeyRange.bound([type, dateRange[0]], [type, dateRange[1]]),
    );
  } else if (dateRange === undefined) {
    result = await db.getAllFromIndex("activitySummaries", "typeIdx", type);
  } else if (type === undefined) {
    result = await db.getAllFromIndex(
      "activitySummaries",
      "startDateIdx",
      IDBKeyRange.bound(dateRange[0], dateRange[1]),
    );
  } else {
    result = await db.getAll("activitySummaries");
  }
  return decodeSummaryActivity(
    result.sort(
      (a, b) =>
        (a.startDate?.getTime() as number) - (b.startDate?.getTime() as number),
    ),
  );
}
