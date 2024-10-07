"use client";
import { getActivities } from "@/lib/strava/activity-summaries";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

import { Polyline } from "react-leaflet";
import { LatLngTuple } from "leaflet";
import { useMapContext } from "@/app/maps/context";



export default function StravaOverlay() {
  const { db, activityFilter, selectedDate } = useMapContext()
  const positions = useRef<LatLngTuple[]>()

  useEffect(() => {
    const updatePositions = async () => {
      if (!db) {
        return
      }

      positions.current = Object.values(await getActivities(db, activityFilter, selectedDate)).filter(el => el.map?.summaryPolyline).map(el => el.map?.summaryPolyline)
    }
    updatePositions()
  }, [activityFilter, db, selectedDate])
  return positions.current && <Polyline positions={positions.current}></Polyline>
}
