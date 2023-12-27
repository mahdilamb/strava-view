"use client";
import "leaflet/dist/leaflet.css";


import { useMap } from "react-leaflet/hooks";

import { Animator } from "@/app/timeline";
import { CustomControl } from "./control";

export const Timeline = (props: { animator: Animator }) => {
  const map = useMap();
  const { animator } = props;

  return (
    <CustomControl className="leaflet-bar leaflet-control">
      <a
        href="#"
        onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          animator.reset(map);
          await animator.play(map);
          return false;
        }}
      >
        &#11208;
      </a>
    </CustomControl>
  );
};
