'use client'
import { redirect } from "next/navigation";
import { useMapContext } from "../../context";
import { StravaDB } from "@/lib/strava/sync";
import { LatLngTuple } from "leaflet";
import { useRef, useEffect } from "react";
import { getActivityDetails } from "@/lib/strava/activities";
import { decode as decodePolyLine } from "@googlemaps/polyline-codec";
import { Polyline } from "react-leaflet";

const ActivityOverlay = (props: { activityId: number, db: StravaDB }) => {
    const { activityId, db } = props
    const positions = useRef<LatLngTuple[]>()

    useEffect(() => {
        const updatePositions = async () => {
            if (!db) {
                return
            }
            positions.current = decodePolyLine((await getActivityDetails(db, activityId)).map?.polyline)
        }
        updatePositions()
    }, [activityId, db])
    return positions.current && <Polyline positions={positions.current}></Polyline>
}

export default function RedirectOrOverlay() {
    const { activityFilter, activityId, db } = useMapContext()
    if (activityFilter) {
        return redirect(`/maps/activities/${activityFilter}/dates/all`)
    }
    return <ActivityOverlay activityId={activityId} db={db} />

}
