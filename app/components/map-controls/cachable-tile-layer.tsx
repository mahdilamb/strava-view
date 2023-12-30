import { TileLayer, TileLayerOptions } from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { LRUCache } from "../../utils";

export const CacheableTileLayer = (
  props: TileLayerOptions & { url: string },
) => {
  const map = useMap();
  useEffect(() => {
    const cache = LRUCache<string, Blob>((url) => {
      const req = new XMLHttpRequest();
      req.overrideMimeType(
        `image/${url.split(".").at(-1)}; charset=x-user-defined`,
      );

      req.open("GET", url, false);
      req.send();
      return new Blob([
        Uint8Array.from(req.response, (c) => c.charCodeAt(0)).buffer,
      ]);
    }, 64);

    const LayerImpl = TileLayer.extend({
      getTileUrl: function (coords: { [dim: string]: number | string }) {
        var url = props.url;
        url
          .match(/{[^}]*?}/gi)
          ?.map((arg) => [arg, arg.slice(1, -1)])
          .forEach(([arg, a]) => {
            switch (a) {
              case "x":
              case "y":
              case "z":
                url = url.replace(arg, coords[a]);
                break;
              case "s":
                url = url.replace(
                  arg,
                  props.subdomains[0],
                  // Math.floor(Math.random() * props.subdomains?.length)
                );

                break;
              case "r":
                url = url.replace(arg, "@2x");
                break;
              default:
                throw `Unsupported arg: ${arg}`;
            }
          });

        return window.URL.createObjectURL(cache(url));
      },
      getAttribution: () => props.attribution,
    });
    const tileLayer = new LayerImpl();
    const addLayer = async () => {
      tileLayer.addTo(map);
    };
    addLayer();
    return () => {
      tileLayer.remove();
    };
  }, [map, props.attribution, props.subdomains, props.url]);
  return null;
};
