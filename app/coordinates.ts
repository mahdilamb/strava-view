import { LatLngBounds } from "leaflet";

export const combineBounds = (bounds: LatLngBounds[]): LatLngBounds[] => {
  /**
   * Combine multiple bounding boxes based on whether or not they overlap.
   * @param {LatLngBounds[]} bounds The input bounds.
   * @returns {LatLngBounds[]} A new array containing bounds, detached from the input.
   */

  const output: LatLngBounds[] = [];
  bounds.forEach((boundCopy) => {
    boundCopy = new LatLngBounds(
      boundCopy.getSouthWest(),
      boundCopy.getNorthEast(),
    );
    var overlaps = output
      .map((group, i) => (group.intersects(boundCopy) ? i : undefined))
      .filter((group) => group !== undefined)
      .reverse() as number[];
    if (overlaps.length) {
      output.push(
        overlaps
          .map((i) => output.splice(i, 1)[0])
          .reduce((prev, current) => prev.extend(current), boundCopy),
      );
    } else {
      output.push(boundCopy);
    }
  });
  return output;
};
