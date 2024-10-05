"use client"

import { useStrava } from '@/lib/strava';
import { detailsSynced } from '@/lib/strava/activities';
import { activityIds, getActivities } from '@/lib/strava/activity-summaries';
import { StravaActivity } from '@/lib/strava/sync';
import { DetailedActivity } from '@/strava';
import { faSync } from '@fortawesome/free-solid-svg-icons/faSync';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { createContext, createRef, forwardRef, useEffect, useMemo, useState } from 'react';


const ImageProps = {
    width: 120, height: 20, display: 'inline', style: {
        borderRadius: 4,
    }
}
const zeroPad = (a: number, width: number) => a.toString().padStart(width, '0')

const toIsoDate = (date: Date) => {
    return `${date.getFullYear()}-${zeroPad(date.getMonth(), 2)}-${zeroPad(date.getDate(), 2)}`
}

const StravaSyncStatusItem = (props: StravaActivity & { detailsSynced?: () => Promise<void> }) => {
    return <li style={{ fontSize: 'small' }}>{props.detailsSynced && <button onClick={props.detailsSynced}>sync</button>} {props.name}</li>
}
const StravaSyncStatus = forwardRef((_, ref) => {

    const [activities, setActivities] = useState<{ [date: string]: StravaActivity[] }>()
    const { lastSynchronized, db, syncDetails } = useStrava()
    const [syncedDetails, setSyncedDetails] = useState<{ [id: number]: boolean } | null>(null)


    useMemo(async () => {
        if (!db) {
            return
        }
        getActivities(db, 'Run').then((data => {
            setActivities(Object.groupBy(data, (activity) => toIsoDate(activity.startDateLocal)))
        }))
    }, [lastSynchronized])
    useEffect(() => {
        const initDetailedSyncStatus = async () => {
            if (syncedDetails === null && db) {
                const [summaries, details] = (await Promise.all<[number[], number[]]>([await activityIds(db), await detailsSynced(db)]))
                const synced = new Set<number>(details)
                setSyncedDetails(Object.fromEntries(summaries.map((id) => { return [id, synced.has(id)] })))
            }
        }
        initDetailedSyncStatus()
    }, [syncedDetails, db])
    return <div ref={ref} style={{ background: 'blue', width: 240, minHeight: 160, position: 'absolute', bottom: 20, right: 0 }}>
        <ul style={{ maxHeight: 160, height: 160, overflowY: 'auto', width: '100%' }}>{
            activities && Object.entries(activities).sort(function (a, b) {
                return (b[0]).localeCompare(a[0]);
            }).map(([date, dateActivities]) => <li key={date}><ul ><li style={{ position: 'sticky', top: 0 }}>{date}</li>{dateActivities.map(activity => <StravaSyncStatusItem key={activity.id} {...activity} detailsSynced={!syncedDetails || syncedDetails[activity.id] ? undefined : (async () => {
                await syncDetails([activity.id]).then(data => {
                    setSyncedDetails({ ...syncedDetails, ...data })
                })
            })}></StravaSyncStatusItem>)}</ul></li>)}</ul>
    </div>

})

export const StravaButton = () => {
    const { status, authUrl, lastSynchronized, sync, syncDetails } = useStrava()
    const [hovered, setHovered] = useState(false);

    const syncing = status === "syncing"
    const ref = createRef<HTMLDivElement>()
    useEffect(() => {
        if (!ref.current) {
            return
        }
        ref.current.remove()
        document.body.appendChild(ref.current)
    }, [])
    return <>{
        // true &&
        hovered &&
        <StravaSyncStatus ref={ref}></StravaSyncStatus>}
        <div style={{ display: 'inline-flex', float: 'right' }}>
            {authUrl ? <a href={authUrl}><Image src={"/images/logos/strava/btn_strava_connectwith_orange/btn_strava_connectwith_orange.svg"} {...ImageProps} alt={"Log into Strava"}></Image></a> : <Image src={"/images/logos/strava/powered by Strava/pwrdBy_strava_light/api_logo_pwrdBy_strava_horiz_light.svg"} {...ImageProps} alt={"Powered by Strava"} unoptimized title={lastSynchronized?.toLocaleString()}></Image>}

            {<FontAwesomeIcon onMouseOver={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                icon={faSync} spin={syncing} color={"#fc4c02"} opacity={syncing || hovered ? 1.0 : .2} size="lg" onClick={async () => sync && await sync().then(async () => syncDetails && await syncDetails())
                } />}
        </div></>

}

export const RunContext = createContext<DetailedActivity[]>(null as any as DetailedActivity[])

