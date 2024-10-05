"use client"


import { useContext, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { RunDataContext } from './layout';
import lowess from '@stdlib/stats-lowess';


export default function SpeedOverTime() {
    const { data, layout } = useContext(RunDataContext)
    const trendline = lowess(data[0].x?.map(x => Number(x)), data[0].y)
    return <Plot
        data={[...data, {
            ...trendline,
            name: data[0].name ? `LOWESS fit for ${data[0].name}` : undefined
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
