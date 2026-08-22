import type { FetchLike } from "./types.js";

export const MAP_SIZE_PIXELS = 3_121;
export const MAPS_ENDPOINT = "https://api.erlc.gg/maps";
export const MAP_IMAGES = Object.freeze({
  fall: Object.freeze({
    blank: "https://api.erlc.gg/maps/fall_blank.png",
    postals: "https://api.erlc.gg/maps/fall_postals.png",
  }),
  winter: Object.freeze({
    blank: "https://api.erlc.gg/maps/snow_blank.png",
    postals: "https://api.erlc.gg/maps/snow_postals.png",
  }),
});

export type MapImageList = string[] | Record<string, string>;

export async function fetchMapImages(fetchImplementation: FetchLike = globalThis.fetch): Promise<MapImageList> {
  const response = await fetchImplementation(MAPS_ENDPOINT, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`Unable to fetch ER:LC map images (${response.status})`);
  return response.json() as Promise<MapImageList>;
}

export interface WorldLocation {
  LocationX: number;
  LocationZ: number;
}

export function describeWorldDirection(location: WorldLocation): {
  horizontal: "left" | "center" | "right";
  vertical: "up" | "center" | "down";
} {
  return {
    horizontal: location.LocationX < 0 ? "left" : location.LocationX > 0 ? "right" : "center",
    vertical: location.LocationZ < 0 ? "up" : location.LocationZ > 0 ? "down" : "center",
  };
}
