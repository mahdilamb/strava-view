"use client";
import * as mapLayers from "@/lib/leaflet/map-layers";
import { earliestActivity, getActivities } from "@/lib/strava/activity-summaries";
import { ActivityType } from "@/strava/models/ActivityType";
import { LocationControls } from "@/components/map-controls/location-controls";
import { StravaButton } from "@/components/strava";
import "leaflet/dist/leaflet.css";
import { ReactElement, useEffect, useState } from "react";
import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import 'rsuite/DateRangePicker/styles/index.css';
import "./styles.css";

import { useStrava } from "@/lib/strava";
import { CustomControl } from "@/components/map-controls/control";
import { Polyline } from "react-leaflet";
import DateRangePicker from 'rsuite/DateRangePicker';
import { addDays, endOfDay, startOfDay, subDays } from "rsuite/esm/internals/utils/date";
export type SelectedDate = [Date, Date]

const StravaOverlay = () => {
  const { db } = useStrava()

  const [earliestDate, setEarliestDate] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<SelectedDate>([new Date(), new Date()])
  const [activityFilter, setActivityFilter] = useState<ActivityType | undefined>(undefined)
  const [overlay, setOverlay] = useState<ReactElement | null>(null)
  useEffect(() => {
    const syncStrava = async () => {
      if (!db) {
        return
      }
      const earliestDate = (await earliestActivity(db))?.startDate
      if (earliestDate) {
        setEarliestDate(new Date(earliestDate))
        setSelectedDate([earliestDate, new Date()])
      }
    }
    syncStrava()
  }, [db])
  useEffect(() => {
    const updateOverlay = async () => {
      if (!db) {
        return
      }
      setOverlay(<Polyline positions={Object.values(await getActivities(db, activityFilter, selectedDate)).filter(el => el.map?.summaryPolyline).map(el => el.map?.summaryPolyline)}></Polyline>)
    }
    updateOverlay()
  }, [activityFilter, db, selectedDate])
  return <>

    <CustomControl position="bottomleft">
      <DateRangePicker
        style={{ width: 230 }}
        defaultValue={[new Date(), new Date()]}
        value={selectedDate}
        placement="topStart"
        cleanable={false}
        editable={true}
        showWeekNumbers={true}
        showOneCalendar={true}
        onOk={range => {
          setSelectedDate(range)
        }}
        onShortcutClick={(range) => {
          setSelectedDate(range.value)
        }}
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
          {
            label: 'All',
            value: [startOfDay(earliestDate), endOfDay(new Date())]
          },
        ]}
      />
    </CustomControl>

    {overlay}
  </>
}

export default function Home() {
  const { status } = useStrava()
  return <MapContainer
    center={[51.505, -0.09]}
    zoom={13}
    className="flex-1"
    zoomControl={false}
  >
    <TileLayer {...mapLayers.CartoDB.Positron} />
    <LocationControls />
    {status === "ready" && <StravaOverlay />}
    <CustomControl position="bottomright"><StravaButton /></CustomControl>
  </MapContainer>
}
