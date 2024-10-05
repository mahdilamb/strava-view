'use client'

import { sec2dt } from '@/lib/dates';
import { RunContext } from '@/ui/strava';
import lowess from '@stdlib/stats-lowess';
import { PlotData } from 'plotly.js';
import { useContext, useEffect, useState } from 'react';
import Plot from 'react-plotly.js'

const DISTANCES = ["400m", "5K", "10K", "Half-Marathon", 'Marathon']

export default function SpeedOverTime() {
    const runs = useContext(RunContext)
    const data = DISTANCES.map((distance) => {
        return {
            x: [],
            y: [],
            name: distance,
            mode: "markers",
        };
    })
    runs.forEach(run => {
        run.bestEfforts?.forEach(be => {
            DISTANCES.forEach((name, index) => {
                if (be.name === name) {
                    const bestEffortResults = data[index]
                    bestEffortResults.x.push(be.startDate)
                    bestEffortResults.y.push(be.movingTime)
                }
            })
        })
    })
    if (data === null) {
        return
    }
    const plotData = data?.map(trace => { return { ...trace, y: trace.y.map(sec2dt) } })
    const trendLines = data?.map(d => lowess(d.x?.map(x => Number(x)), d.y)).map(d => {
        return { x: d.x?.map(v=>new Date(v)), y: d.y?.map(sec2dt) }
    })
    return <Plot
        data={[...plotData, ...trendLines?.map((trendLine, i) => { return { ...trendLine, name: plotData[i].name ? `LOWESS fit for ${plotData[i].name}` : undefined } })]}
        layout={{
            yaxis: {
                tickformat: '%H:%M:%S'
            }
        }}
        style={{
            height: '100vh',
            width: '100vw'
        }}
        useResizeHandler
    />;
}
