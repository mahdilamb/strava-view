import fs from "fs";
import { parseGPXv1_1, parseTCXv2, schema } from "gpx-tcx";
import { GPXv1_1Document, TCXv2Document } from "gpx-tcx/lib/schemas";
export const loadFile = (path: string) => {
  const schemaType: schema = path.endsWith(".gpx") ? "GPXv1.1" : "TCXv2";

  const schema =
    schemaType === "GPXv1.1"
      ? parseGPXv1_1(fs.readFileSync(path, "utf8"))
      : parseTCXv2(fs.readFileSync(path, "utf8"));

  if (schemaType === "GPXv1.1") {
    console.dir(
      (schema as GPXv1_1Document).gpx.trk?.flatMap(
        (trk) =>
          trk.trkseg?.flatMap(
            (seg) =>
              seg.trkpt?.map((pt) => [
                (pt as any)["$"].lat,
                (pt as any)["$"].lon,
                pt.ele[0],
              ]),
          ),
      ),
      { depth: null },
    );
  } else {
    console.dir(
      (schema as TCXv2Document).TrainingCenterDatabase.Activities?.at(0)
        ?.Activity?.at(0)
        ?.Lap.flatMap(
          (lap) =>
            lap.Track?.flatMap((track) =>
              track.Trackpoint.map((pt) => [
                pt.Position?.at(0)?.LatitudeDegrees,
                pt.Position?.at(0)?.LongitudeDegrees,
                pt.AltitudeMeters
              ]),
            ),
        ),
      { depth: null },
    );
  }
};
