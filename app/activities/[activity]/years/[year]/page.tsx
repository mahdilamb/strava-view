"use client";

import { ActivityType } from "@/strava";
import MapPage from "@/app/map-page";
import { useParams } from "next/navigation";

export default function Year() {
  const params = useParams<{ year: string; activity: ActivityType }>();
  return <MapPage {...params} />;
}
