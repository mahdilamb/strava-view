"use client"
import { useStrava } from "@/lib/strava";
import { getActivities } from "@/lib/strava/activity-summaries";
import { StravaActivity } from "@/lib/strava/sync";
import { RunContext, StravaButton } from "@/components/strava";
import React, { useEffect, useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
    const { db, status } = useStrava();
    const [data, setData] = useState<StravaActivity[] | null>(null)

    useEffect(() => {
        const getRuns = async () => {
            if (status === "ready" && db != null) {
                setData(await getActivities(db, "Run")
                )
            }
        }
        getRuns()
    }, [db, status])

    return (
        <>{data != null && <RunContext.Provider value={data}>
            {status === "ready" && children}

        </RunContext.Provider>}
            <div style={{ width: '100vw', position: "absolute", bottom: 0, overflow: 'hidden' }}>
                <StravaButton></StravaButton>
            </div></>
    )
}
