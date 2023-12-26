
import { LatLngBounds, Map, Polygon, Polyline, bounds, polyline, rectangle } from "leaflet";
import { SummaryActivityDecoded } from "./service";
import { ActivityTarget } from "./components/target";


export type Animator = {
    play: (map: Map) => Promise<void>
    reset: (map: Map) => void
    steps: number
}

export const activityAnimator = (activities: SummaryActivityDecoded[], targets: ActivityTarget[]) => {
    activities = activities.filter(activity => activity.map.summaryPolyline)
    const activityTargets: (ActivityTarget | undefined)[] = activities.map(activity => {
        var assignedTarget;
        targets.forEach(target => {
            if (target.predicate(activity)) {
                assignedTarget = target
            }
        })
        return assignedTarget
    })
    const polygons = activities.map(activity => {
        return new Polygon(activity.map.summaryPolyline)
    })
    const lineBounds = polygons.map(polygon => polygon.getBounds())
    var groups: LatLngBounds[] = []
    if (lineBounds.length) {
        groups.push(lineBounds[0])
        lineBounds.slice(1).forEach(bound => {
            if (!groups.some((overlap) => {
                if (overlap.overlaps(bound)) {
                    overlap.extend(bound)
                    return true
                }
                return false
            })) {
                groups.push(bound)
            }
        })
    }
    var reset = (map: Map) => {
        map.setView({ lat: 51.505, lng: -0.09 }, 13)
    }
    var play = async (map: Map) => { }
    var steps = 0
    if (groups.length) {
        var annotations: Polyline[] = []
        const allBounds = groups.reduce((prev, current) => prev.extend(current), new LatLngBounds(groups[0].getSouthWest(), groups[0].getNorthEast()))
        reset = (map: Map) => {
            map.fitBounds(allBounds)
            annotations.forEach(ann => ann.remove())
            annotations = []
        }
        const boundGroups = (lineBounds.map(bound => groups.find(group => group.contains(bound))) as LatLngBounds[])

        var annotation;
        play = async (map: Map) => {
            map.fitBounds(boundGroups[0], { animate: true, duration: 100 })
            annotations.push((annotation = polyline(activities[0].map.summaryPolyline, { color: activityTargets[0]?.color || "grey" })))
            annotation.addTo(map)
            for (var i = 1; i < activities.length; ++i) {
                const duration = boundGroups[i] === boundGroups[i - 1] ? 1 : 1200
                map.fitBounds(boundGroups[i], { animate: true, duration: duration })
                await new Promise(r => setTimeout(r, duration * .2));
                annotations.push((annotation = polyline(activities[i].map.summaryPolyline, {
                    color: activityTargets[i]?.color || "grey",
                    opacity: .7,
                    weight: 4
                })))
                annotation.addTo(map)

                await new Promise(r => setTimeout(r, duration * .5));
                // targets.forEach(target => target.count[1](activityTargets.slice(0, i).filter(activityTarget => activityTarget?.name === target.name).length))
            }
            map.fitBounds(allBounds, { animate: true, duration: 600 })

        }
        steps = activities.length
    }
    return {
        reset: reset,
        play: play,
        steps: steps
    }
}
