"use client";
import { authUrl } from "@/strava-service";
import {
  codeVerifierAndChallenge,
  authUrl as fitbitAuthUrl,
} from "@/fitbit-service";

import { SummaryActivityDecoded } from "@/strava-service/service";
import {
  AnchorHTMLAttributes,
  DetailedHTMLProps,
  MouseEventHandler,
  ReactElement,
  useEffect,
  useState,
} from "react";
import { Map } from "@/app/components/map";
import { notFound, useParams } from "next/navigation";
import { yearToSpan } from "@/app/dates";
import { getToken } from "@/app/tokens";
import { getActivities, initDB, syncDB } from "@/app/databases";
import { ActivityType } from "@/strava";
import { MapContainer } from "react-leaflet/MapContainer";

import { TileLayer } from "react-leaflet/TileLayer";
import * as mapLayers from "@/app/map-layers";
import "leaflet/dist/leaflet.css";
import { LocationControls } from "./components/map-controls/location-controls";
import { GeoNames } from "./geonames-service";

export default function MapPage(props: {
  year: string;
  activity: ActivityType;
}) {
  const [auth, setAuth] = useState(null);
  const [stravaAuthUrl, setStravaAuthUrl] = useState<string>();
  const [activities, setActivities] = useState<SummaryActivityDecoded[]>([]);

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
    const getDB = async () => {
      if (auth !== null) {
        const allActivities = Object.keys(ActivityType);
        const activity = allActivities.find(
          (activity) => (props?.activity as string) === activity.toLowerCase(),
        );
        if (activity === undefined) {
          return notFound();
        }
        const db = await syncDB(await initDB(), auth);
        setActivities(
          await getActivities(
            db,
            activity as ActivityType,
            yearToSpan(parseInt(props?.year as string)),
          ),
        );
      }
      //getDB();
    };
  }, [auth, props?.activity, props?.year]);

  return (
    <MapContainer
      center={[51.505, -0.09]}
      zoom={13}
      className="flex-1"
      zoomControl={false}
    >
      <LocationControls />
      {auth !== null ? (
        <Map activities={activities}></Map>
      ) : (
        <TileLayer {...mapLayers.CartoDB.Positron} />
      )}
    </MapContainer>
  );
}
