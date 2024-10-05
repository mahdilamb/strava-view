"use client"


import { useContext } from 'react';
import Plot from 'react-plotly.js';
import { RunDataContext } from '../layout';
import { StravaActivity } from '@/lib/strava/sync';


export default function SpeedOverTime({ params }: { params: { additionalMetric: keyof StravaActivity } }) {
    console.log(params.additionalMetric)
    const { runData, data, layout } = useContext(RunDataContext)
    console.log(data)
    return <Plot
        data={[{
            ...data[0], transforms: [{
                type: 'groupby',
                groups: runData.map(run=>run.startDate?.getFullYear()),
                styles: [{ target: 2, value: { marker: { color: ['red', 'black', 'red'] } } }]
            }]
        }]
        }
        layout={layout}
        style={{
            height: '100vh',
            width: '100vw'
        }}
        useResizeHandler
    />;
}
