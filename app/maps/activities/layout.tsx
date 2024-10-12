"use client";
import * as mapLayers from "@/lib/leaflet/map-layers";
import { earliestActivity } from "@/lib/strava/activity-summaries";
import { ActivityType } from "@/strava/models/ActivityType";
import { LocationControls } from "@/components/map-controls/location-controls";
import { StravaButton } from "@/components/strava";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";

import { useStrava } from "@/lib/strava";
import { CustomControl } from "@/components/map-controls/control";
import DateRangePicker from 'rsuite/DateRangePicker';
import { addDays, endOfDay, startOfDay, subDays } from "rsuite/esm/internals/utils/date";
import { MapContext } from "@/app/maps/context";
import { useParams } from "next/navigation";

const evaluateDate = (date: string): [Date, Date] | undefined => {
    if (date === 'all' || date === '-') {
        return
    }
    if (date.includes(':')) {
        const [startDate, endDate] = date.split(':', 2)
        return [startOfDay(Date.parse(startDate)), endDate ? startOfDay(Date.parse(endDate)) : endOfDay(new Date())]
    }
    return [startOfDay(Date.parse(date)), addDays(Date.parse(date), 1)]
}
const evaluateActivity = (activity: string): ActivityType | undefined => {
    if (activity === 'all' || activity === '-') {
        return
    }
    const activityType = Object.keys(ActivityType).find(a => a.replaceAll(' ', '').toLocaleLowerCase() === activity.replaceAll(' ', '').toLocaleLowerCase())
    if (!activityType) {
        throw `Unknown activity type: ${activity}`
    }
    return activityType as ActivityType
}
export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const earliestDate = useRef<Date>()
    const params = useParams<{ 'date-range'?: string, 'activity': string }>()
    const { db, status } = useStrava()
    const activityId = !Number.isNaN(Number(params.activity)) ? Number(params.activity) : undefined
    const activityFilter = activityId === undefined ? evaluateActivity(decodeURIComponent(params.activity)) : undefined
    const selectedDate = params["date-range"] ? evaluateDate(decodeURIComponent(params["date-range"])) : undefined
    useEffect(() => {
        const getEarliestDate = async () => {
            if (!db) {
                return
            }
            const earliestDateDb = (await earliestActivity(db))?.startDate
            if (earliestDateDb) {
                earliestDate.current = earliestDateDb
            }
        }
        getEarliestDate()
    }, [db])

    return <MapContext.Provider value={{ db, selectedDate, activityFilter, activityId }}>
        <MapContainer
            center={[51.505, -0.09]}
            zoom={13}
            className="flex-1"
            zoomControl={false}
        >
            <TileLayer {...mapLayers.CartoDB.Positron} />
            <LocationControls />
            <CustomControl position="bottomleft">
                <DateRangePicker
                    style={{ width: 230 }}
                    defaultValue={[earliestDate.current || new Date(), addDays(startOfDay(new Date()), 1)]}
                    value={selectedDate}
                    placement="topStart"
                    cleanable={false}
                    editable={true}
                    showWeekNumbers={true}
                    showOneCalendar={true}
                    // onOk={range => {
                    //   setSelectedDate(range)
                    // }}
                    // onShortcutClick={(range) => {
                    //   setSelectedDate(range.value)
                    // }}
                    ranges={[
                        {
                            label: 'today',
                            value: [startOfDay(new Date()), endOfDay(new Date())]
                        },
                        {
                            label: 'yesterday',
                            value: [startOfDay(addDays(new Date(), -1)), endOfDay(addDays(new Date(), -1))]
                        },
                        {
                            label: 'last7Days',
                            value: [startOfDay(subDays(new Date(), 6)), endOfDay(new Date())]
                        },
                        ...(earliestDate.current ? [{
                            label: 'All',
                            value: [startOfDay(earliestDate), endOfDay(new Date())]
                        }] : [])
                    ]}
                />
            </CustomControl>
            {status === "ready" && children}
            <CustomControl position="bottomright"><StravaButton /></CustomControl>
        </MapContainer>
    </MapContext.Provider>;
}
