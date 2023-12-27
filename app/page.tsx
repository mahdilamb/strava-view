"use client";
import { useEffect, useState } from "react";
import { Map } from "./components";
import {
  SummaryActivityDecoded,
  getActivities,
} from "./strava-service/service";
import { authUrl, refreshToken } from "./strava-service";

const STORAGE_KEY = "stravaAuth";

export const getToken = () => {
  var potentialAuth;
  if (
    (potentialAuth = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")) &&
    "expires_at" in potentialAuth
  ) {
    if (new Date() < new Date(potentialAuth.expires_at * 1000)) {
      return potentialAuth;
    }
    return refreshToken(potentialAuth).then((token) => {
      if ("errors" in token) {
        throw JSON.stringify(token.errors);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(token));
      console.debug("Refreshed token.");
      return token;
    });
  }
};

export default function Home() {
  const [auth, setAuth] = useState(null);
  const [stravaAuthUrl, setStravaAuthUrl] = useState<string>();
  const [activities, setActivities] = useState<SummaryActivityDecoded[]>([]);

  useEffect(() => {
    authUrl().then(setStravaAuthUrl);
  }, []);
  useEffect(() => {
    const checkAuth = async () => {
      var potentialToken;
      if ((potentialToken = getToken())) {
        setAuth(await potentialToken);
        return;
      }
    };
    checkAuth();
  }, []);
  useEffect(() => {
    if (auth !== null) {
      getActivities(auth).then((data) => {
        setActivities(data);
      });
    }
  }, [auth]);
  if (auth !== null) {
    return <Map activities={activities}></Map>;
  }
  if (!stravaAuthUrl) {
    return <>Loading...</>;
  }
  return <a href={stravaAuthUrl}>Login to strava</a>;
}
