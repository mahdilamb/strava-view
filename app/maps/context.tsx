'use client'

import { StravaDB } from "@/lib/strava/sync"
import { ActivityType } from "@/strava"
import { useContext, createContext } from "react"


export const MapContext = createContext<{
    db?: StravaDB
    activityFilter?: ActivityType
    selectedDate?: [Date, Date],
    activityId?: number
}>({})


export const useMapContext = () => useContext(MapContext)
