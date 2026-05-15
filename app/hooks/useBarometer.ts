import { Barometer } from "expo-sensors";
import { useState, useEffect, useRef } from "react";

const FLOOR_HEIGHT = 3.5;
const BASELINE_SAMPLES = 10;

export interface BarometerData {
  pressure: number;
  altitude: number;
  floor: number;
  isAvailable: boolean;
}

export function useBarometer(active: boolean) {
  const [data, setData] = useState<BarometerData>({
    pressure: 0, altitude: 0, floor: 1, isAvailable: false,
  });
  const baselinePressure = useRef<number | null>(null);
  const samples = useRef<number[]>([]);

  useEffect(() => {
    Barometer.isAvailableAsync().then((available) => {
      setData((prev) => ({ ...prev, isAvailable: available }));
    });
  }, []);

  useEffect(() => {
    if (!active) return;
    Barometer.setUpdateInterval(500);
    const sub = Barometer.addListener(({ pressure }) => {
      if (!pressure) return;

      if (baselinePressure.current === null) {
        samples.current.push(pressure);
        if (samples.current.length >= BASELINE_SAMPLES) {
          baselinePressure.current =
            samples.current.reduce((a, b) => a + b, 0) / samples.current.length;
        }
        return;
      }

      const deltaAlt = (baselinePressure.current - pressure) * 8.5;
      const floor = Math.max(1, Math.round(1 + deltaAlt / FLOOR_HEIGHT));
      setData((prev) => ({ ...prev, pressure, altitude: deltaAlt, floor }));
    });
    return () => sub.remove();
  }, [active]);

  const resetBaseline = () => {
    baselinePressure.current = null;
    samples.current = [];
  };

  return { ...data, resetBaseline };
}
