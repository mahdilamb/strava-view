import { Control, Map } from "leaflet";
import { ReactElement, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { useMap } from "react-leaflet";

export const CustomControl = (props: {
  children: ReactElement | ReactElement[] | any;
  position?: "bottomleft" | "topleft" | "topright" | "bottomright";
  className?: string;
}) => {
  const { className, children, ...controlProps } = props;
  controlProps["position"] = controlProps["position"] || "bottomleft";
  const map = useMap();

  useEffect(() => {
    const domElement = document.createElement("div");
    domElement.className = className || "";
    createRoot(domElement).render(children);
    const ControlImpl = Control.extend({
      onAdd: () => {
        return domElement;
      },

      onRemove: () => {
        domElement.remove();
      },
    });
    const controlElement = new ControlImpl(controlProps);
    controlElement.addTo(map);
    return () => {
      controlElement.remove();
    };
  }, [children, className, controlProps, map]);
  return null;
};
