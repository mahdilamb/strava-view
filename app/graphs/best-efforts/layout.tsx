"use client"
import { useStrava } from "@/lib/strava";
import { detailsSynced, getActivityDetails } from "@/lib/strava/activities";
import { activityIds } from "@/lib/strava/activity-summaries";
import { DetailedActivity } from "@/strava";
import { RunContext, StravaButton } from "@/ui/strava";
import React, { useEffect, useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
    const { db, status } = useStrava();
    const [data, setData] = useState<DetailedActivity[] | null>(null)
    useEffect(() => {
        const getRuns = async () => {
            if (status === "ready" && db != null) {
                const syncedIds = new Set(await detailsSynced(db))

                setData(await (activityIds(db, "Run"

                ).then(activities => activities
                    .filter(id => syncedIds.has(id)))
                    .then(async activities => await Promise.all(activities.map(async id => await getActivityDetails(db, id)))
                    ))
                )
            }
        }
        getRuns()
    }, [db, status])
    if (data === null) {
        return <div style={{ width: '100vw', position: "absolute", bottom: 0, overflow: 'hidden' }}>
        <StravaButton></StravaButton>
    </div>
    }
    return (
        <RunContext.Provider value={data}>
            {status === "ready" && children}
            <div style={{ width: '100vw', position: "absolute", bottom: 0, overflow: 'hidden' }}>
                <StravaButton></StravaButton>
            </div>
        </RunContext.Provider>
    )
}
