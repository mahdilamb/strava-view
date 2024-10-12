"use client";
import { getActivities } from "@/lib/strava/activity-summaries";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

import { Polyline } from "react-leaflet";
import { LatLngTuple } from "leaflet";
import { useMapContext } from "@/app/maps/context";
import { useSearchParams } from "next/navigation";


type PointsView = 'start' | 'end' | 'both' | null
export default function StravaOverlay() {
  const { db, activityFilter, selectedDate } = useMapContext()
  const params = useSearchParams()
  const pointsView = params.get('points') as PointsView
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
  if (pointsView === 'start') {
    return positions.current && <Polyline positions={positions.current.map(pos => [pos[0], pos[0]])}></Polyline>
  }
  if (pointsView === 'end') {
    return positions.current && <Polyline positions={positions.current.map(pos => [pos.at(-1), pos.at(-1)])}></Polyline>
  }
  if (pointsView === 'both') {
    return positions.current && <><Polyline color='red' positions={positions.current.map(pos => [pos.at(-1), pos.at(-1)])}></Polyline><Polyline color='green' positions={positions.current.map(pos => [pos.at(0), pos.at(0)])}></Polyline></>
  }
  return positions.current && <Polyline positions={positions.current}></Polyline>
}
