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

/** Response returned by ER:LC's public map-image listing endpoint. */
export interface MapImagesResponse {
  /** Absolute URLs for the currently published official ER:LC map images. */
  maps: string[];
}

/**
 * Fetches the current official map-image URLs from ER:LC.
 *
 * This public endpoint does not require a Server-Key. A custom Fetch-compatible
 * implementation may be supplied for testing or controlled runtimes.
 */
export async function fetchMapImages(
  fetchImplementation: FetchLike = globalThis.fetch,
): Promise<MapImagesResponse> {
  const response = await fetchImplementation(MAPS_ENDPOINT, {
    headers: { accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Unable to fetch ER:LC map images (${response.status})`);
  const body: unknown = await response.json();
  if (
    typeof body !== "object" ||
    body === null ||
    !("maps" in body) ||
    !Array.isArray(body.maps) ||
    !body.maps.every((entry) => typeof entry === "string")
  ) {
    throw new Error("ER:LC returned an invalid map images response");
  }
  return { maps: [...body.maps] };
}

/** World coordinates exposed by ER:LC player location data. */
export interface WorldLocation {
  LocationX: number;
  LocationZ: number;
}

/**
 * Describes which side of ER:LC's documented world axes contains a location.
 * This helper intentionally does not invent a world-to-pixel scale.
 */
export function describeWorldDirection(location: WorldLocation): {
  horizontal: "left" | "center" | "right";
  vertical: "up" | "center" | "down";
} {
  return {
    horizontal: location.LocationX < 0 ? "left" : location.LocationX > 0 ? "right" : "center",
    vertical: location.LocationZ < 0 ? "up" : location.LocationZ > 0 ? "down" : "center",
  };
}
