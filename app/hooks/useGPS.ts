import * as Location from "expo-location";
import { useState } from "react";

export interface GPSCoord {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export function useGPS() {
  const [coord, setCoord] = useState<GPSCoord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startGPSLock = async () => {
    setLoading(true);
    setError(null);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setError("Izin lokasi ditolak");
      setLoading(false);
      return;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    setCoord({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy ?? 999,
    });
    setLoading(false);
  };

  return { coord, loading, error, startGPSLock };
}
