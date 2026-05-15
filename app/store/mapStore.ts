import { create } from "zustand";

interface MapStore {
  originLat: number | null;
  originLng: number | null;
  gpsReady: boolean;
  setOrigin: (lat: number, lng: number) => void;

  posX: number;
  posY: number;
  steps: number;
  updatePosition: (x: number, y: number, steps: number) => void;
  resetPosition: () => void;

  altitude: number;
  floor: number;
  setAltitude: (alt: number, floor: number) => void;

  mapUri: string | null;
  mapOriginX: number;
  mapOriginY: number;
  imageWidth: number;
  imageHeight: number;
  scaleX: number;
  scaleY: number;
  setMapUri: (uri: string, w: number, h: number) => void;
  setMapOrigin: (x: number, y: number) => void;
  setScale: (sx: number, sy: number) => void;

  mapMode: "2d" | "3d";
  setMapMode: (mode: "2d" | "3d") => void;

  isTracking: boolean;
  setTracking: (v: boolean) => void;

  calibrated: boolean;
  setCalibrated: (v: boolean) => void;

  highlightedKiosId: string | null;
  setHighlightedKios: (id: string | null) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  originLat: null,
  originLng: null,
  gpsReady: false,
  setOrigin: (lat, lng) => set({ originLat: lat, originLng: lng, gpsReady: true }),

  posX: 0,
  posY: 0,
  steps: 0,
  updatePosition: (x, y, steps) => set({ posX: x, posY: y, steps }),
  resetPosition: () => set({ posX: 0, posY: 0, steps: 0, gpsReady: false }),

  altitude: 0,
  floor: 1,
  setAltitude: (altitude, floor) => set({ altitude, floor }),

  mapUri: null,
  mapOriginX: 100,
  mapOriginY: 500,
  imageWidth: 800,
  imageHeight: 600,
  scaleX: 0.05,
  scaleY: 0.05,
  setMapUri: (uri, w, h) => set({ mapUri: uri, imageWidth: w, imageHeight: h }),
  setMapOrigin: (x, y) => set({ mapOriginX: x, mapOriginY: y }),
  setScale: (sx, sy) => set({ scaleX: sx, scaleY: sy }),

  mapMode: "2d",
  setMapMode: (mapMode) => set({ mapMode }),

  isTracking: false,
  setTracking: (v) => set({ isTracking: v }),

  calibrated: false,
  setCalibrated: (v) => set({ calibrated: v }),

  highlightedKiosId: null,
  setHighlightedKios: (id) => set({ highlightedKiosId: id }),
}));
