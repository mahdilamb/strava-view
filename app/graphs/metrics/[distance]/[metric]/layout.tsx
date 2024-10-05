"use client"

import { notFound } from 'next/navigation';

import { sec2dt } from "@/lib/dates";
import { DISTANCES } from "@/lib/distances";
import { StravaActivity } from "@/lib/strava/sync";
import { RunContext } from '@/ui/strava';
import { PlotData } from 'plotly.js';
import { createContext, useContext, useMemo } from 'react';

export const RunDataContext = createContext<{ runData: StravaActivity[], data: Partial<PlotData>[], layout: Partial<Plotly.Layout> }>(undefined as any)

export default function SpeedOverTime({ children, params }: {
    children: React.ReactNode
    params: {
        distance: keyof typeof DISTANCES | '-',
        metric: keyof StravaActivity
    }
}) {
    const { metric: rawMetric, distance } = params
    const metric = decodeURIComponent(rawMetric)
    let xMetric: keyof StravaActivity
    let yMetric: keyof StravaActivity
    if (metric.includes(':')) {
        [xMetric, yMetric] = metric.split(':')
    } else {
        [xMetric, yMetric] = ['startDate', metric]
    }
    console.log([xMetric, yMetric])
    const runs = useContext(RunContext)
    const DISTANCE = DISTANCES[distance.replace('-', ' ').toLowerCase()]
    if (DISTANCE === undefined && distance !== '-') {
        notFound()
    }
    const runData = useMemo(() => {
        if (runs !== null) {
            const distanceFilter: (distance: number) => void = DISTANCE === undefined ? (_ => true) : (distance => distance >= (DISTANCE * .95) && distance < (DISTANCE * 1.05))


            return runs
                .filter(run => distanceFilter(run.distance))

        }
    }
        , [runs, DISTANCE])


    if (runData === undefined) {
        return
    }
    const data = {
        x: [],
        y: [],
        mode: "markers",
    }
    runData.forEach(run => {
        data.x.push(xMetric.endsWith('Time') ? sec2dt(run[xMetric]) : run[xMetric])
        data.y.push(yMetric.endsWith('Time') ? sec2dt(run[yMetric]) : run[yMetric])
    })
    const layout: Partial<Plotly.Layout> = {}
    if (yMetric.endsWith('Time')) {
        layout['yaxis'] = { 'tickformat': '%H:%M:%S' }
    }
    if (xMetric.endsWith('Time')) {
        layout['xaxis'] = { 'tickformat': '%H:%M:%S' }
    }
    return <RunDataContext.Provider value={
        { runData: runData, data: [data], layout: layout }
    }>{children}</RunDataContext.Provider>;
}
