import * as Location from "expo-location";
import { useState, useRef } from "react";

export interface GPSCoord {
  latitude: number;
  longitude: number;
  accuracy: number;
}

const GOOD_ACCURACY_M = 20;  // stop early if this accurate
const TIMEOUT_MS      = 20_000; // accept best-available after 20s

export function useGPS() {
  const [coord, setCoord] = useState<GPSCoord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subRef     = useRef<Location.LocationSubscription | null>(null);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bestRef    = useRef<GPSCoord | null>(null);

  const cleanup = () => {
    subRef.current?.remove();
    subRef.current = null;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const finish = (c: GPSCoord) => {
    cleanup();
    bestRef.current = null;
    setCoord(c);
    setLoading(false);
  };

  const cancelGPS = () => {
    if (!loading) return;
    const best = bestRef.current;
    cleanup();
    bestRef.current = null;
    setLoading(false);
    // Keep the best coord we received so far (if any)
    if (best) setCoord(best);
  };

  const startGPSLock = async () => {
    cleanup();
    bestRef.current = null;
    setLoading(true);
    setError(null);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setError("Izin lokasi ditolak");
      setLoading(false);
      return;
    }

    // After TIMEOUT_MS, accept whatever best reading we have
    timerRef.current = setTimeout(() => {
      const best = bestRef.current;
      if (best) {
        finish(best);
      } else {
        cleanup();
        bestRef.current = null;
        setError("GPS timeout — coba lagi di tempat yang lebih terbuka");
        setLoading(false);
      }
    }, TIMEOUT_MS);

    // watchPositionAsync returns readings immediately as they improve
    subRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 0,
        timeInterval: 1000,
      },
      (loc) => {
        const c: GPSCoord = {
          latitude:  loc.coords.latitude,
          longitude: loc.coords.longitude,
          accuracy:  loc.coords.accuracy ?? 999,
        };
        bestRef.current = c;
        // Finish early if accuracy is already good enough
        if (c.accuracy <= GOOD_ACCURACY_M) finish(c);
      },
    );
  };

  return { coord, loading, error, startGPSLock, cancelGPS };
}
