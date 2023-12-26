"use client";
import { useEffect, useState } from "react";
import { Calendar, Targets, Map } from "./components";
import { SummaryActivityDecoded, authUrl, getActivities, refreshToken } from "./service";
import { ActivityTarget } from "./components/target";
import colorbrewer from "colorbrewer"
const getToken = () => {
  var potentialAuth;
  if (
    (potentialAuth = JSON.parse(localStorage.getItem("stravaAuth") || "{}"))
  ) {
    if (new Date(potentialAuth.expires_at * 1000) > new Date()) {
      return potentialAuth;
    }
    return refreshToken(potentialAuth).then((token) => {
      if (token.errors) {
        return null;
      }
      localStorage.setItem("stravaAuth", JSON.stringify(token));
      console.log("Refreshed token");
      return token;
    });
  }
};

export default function Home() {
  const [date, setDate] = useState<Date>(new Date(new Date().getFullYear(), 0, 1, 0, 0, 0));
  const [auth, setAuth] = useState(null);
  const [stravaAuthUrl, setStravaAuthUrl] = useState<string>();
  const [activities, setActivities] = useState<SummaryActivityDecoded[]>([]);
  const [targets, setTargets] = useState<ActivityTarget[]>([
    { name: "5km", predicate: activity => activity.distance >= 5_000, color: colorbrewer.Greens[3][2], count: useState(0) },
    { name: "10km", predicate: activity => activity.distance >= 10_000, color: colorbrewer.Blues[3][2], count: useState(0) },
    { name: "21.1km", predicate: activity => activity.distance >= 21_100, color: colorbrewer.Reds[3][2], count: useState(0) }
  ])
  useEffect(() => {
    const checkAuth = async () => {
      var potentialToken;
      if ((potentialToken = getToken())) {
        setAuth(await potentialToken);
        return;
      }
    };
    checkAuth();
    authUrl().then((data) => {
      setStravaAuthUrl(data);
    });
  }, []);
  useEffect(() => {
    if (auth !== null) {
      getActivities(auth).then((data) => {
        setActivities(data);
      });
    }
  }, [auth]);
  if (auth !== null) {
    return (
      <div className="flex flex-col h-dvh w-dvw">
        <Targets targets={targets} setTargets={setTargets} ></Targets>
        {/* <Calendar targets={targets} activities={activities} date={date} setDate={setDate}></Calendar> */}
        <Map targets={targets} activities={activities} date={date} setDate={setDate}></Map>
      </div>
    );
  }
  if (!stravaAuthUrl) {
    return <>Loading...</>;
  }
  return <a href={stravaAuthUrl}>Login to strava</a>;
}
