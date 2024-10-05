import { sleep } from "@/lib/animations";
import { LatLngExpression } from "leaflet";
import { useEffect, useState } from "react";
import { Circle } from "react-leaflet";
import { Polyline, PolylineProps } from "react-leaflet/Polyline";

export const TracedPolyline = (
  props: PolylineProps & { duration?: number; markerRadius?: number },
) => {
  const { duration, positions, markerRadius } = props;

  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  var framePerRender = 1;
  var pause = (duration ?? 100) / positions.length;
  if (pause < 1) {
    framePerRender = Math.ceil(1 / pause);
    pause = 1;
  }
  useEffect(() => {
    const nextFrame = async () => {
      if (!playing) {
        return;
      }
      await sleep(pause);
      var newFrame = frame + framePerRender;
      if (newFrame >= positions.length) {
        setPlaying(false);
        return;
      }
      setFrame(newFrame);
    };
    nextFrame();
  }, [frame, framePerRender, pause, playing, positions.length]);
  if (!playing) {
    return <Polyline {...props} positions={positions}></Polyline>;
  }
  return (
    <>
      <Polyline {...props} positions={positions.slice(0, frame)}></Polyline>
      <Circle
        color={props.color}
        center={positions[frame] as LatLngExpression}
        radius={markerRadius ?? 4}
      ></Circle>
    </>
  );
};
