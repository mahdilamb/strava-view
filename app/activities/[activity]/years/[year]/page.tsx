"use client";
import { authUrl } from "@/app/strava-service";
import {
  SummaryActivityDecoded,
  decodeSummaryActivity,
} from "@/app/strava-service/service";
import { useEffect, useState } from "react";
import { Map } from "@/app/components/map";
import { notFound, useParams } from "next/navigation";
import { yearToSpan } from "@/app/dates";
import { getToken } from "@/app/tokens";
import { getActivities, initDB, syncDB } from "@/app/databases";
import { ActivityType } from "@/app/strava";

export default function Year() {
  const [auth, setAuth] = useState(null);
  const [stravaAuthUrl, setStravaAuthUrl] = useState<string>();
  const [activities, setActivities] = useState<SummaryActivityDecoded[]>([]);
  const params = useParams<{ year: string; activity: ActivityType }>();
  useEffect(() => {
    const checkAuth = async () => {
      var potentialToken;
      if ((potentialToken = getToken())) {
        setAuth(await potentialToken);
        return;
      }
    };
    authUrl().then(setStravaAuthUrl);
    checkAuth();
  }, []);
  useEffect(() => {
    if (auth !== null) {
      const getDB = async () => {
        const allActivities = Object.keys(ActivityType);
        const activity = allActivities.find(
          (activity) => (params?.activity as string) === activity.toLowerCase(),
        );
        if (activity === undefined) {
          return notFound();
        }
        const db = await syncDB(await initDB(), auth);
        setActivities(
          await getActivities(
            db,
            activity as ActivityType,
            yearToSpan(parseInt(params?.year as string)),
          ),
        );
      };
      getDB();
    }
  }, [auth, params]);
  if (auth !== null) {
    return <Map activities={activities}></Map>;
  }
  if (!stravaAuthUrl) {
    return <>Loading...</>;
  }
  return <a href={stravaAuthUrl}>Login to strava</a>;
}
