import { useState, useRef, useCallback } from "react";
import * as Location from "expo-location";
import { Magnetometer, Accelerometer, Barometer } from "expo-sensors";

export interface CalibrationState {
  gps: number;
  compass: number;
  accelerometer: number;
  barometer: number;
  elapsed: number;
  isComplete: boolean;
}

const CALIBRATION_DURATION = 30;

export function useCalibration() {
  const [state, setState] = useState<CalibrationState>({
    gps: 0, compass: 0, accelerometer: 0, barometer: 0, elapsed: 0, isComplete: false,
  });

  const startedAt = useRef<number>(0);
  const subs = useRef<{ remove: () => void }[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateField = (
    field: keyof Omit<CalibrationState, "elapsed" | "isComplete">,
    value: number,
  ) => {
    setState((prev) => {
      const next = { ...prev, [field]: Math.min(100, value) };
      const allReady =
        next.gps >= 80 && next.compass >= 80 && next.accelerometer >= 80 && next.barometer >= 80;
      return { ...next, isComplete: allReady && next.elapsed >= CALIBRATION_DURATION };
    });
  };

  const stop = useCallback(() => {
    subs.current.forEach((s) => s.remove());
    subs.current = [];
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const start = useCallback(async () => {
    stop();
    startedAt.current = Date.now();
    setState({ gps: 0, compass: 0, accelerometer: 0, barometer: 0, elapsed: 0, isComplete: false });

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt.current) / 1000);
      setState((prev) => {
        const allReady =
          prev.gps >= 80 && prev.compass >= 80 && prev.accelerometer >= 80 && prev.barometer >= 80;
        return { ...prev, elapsed, isComplete: allReady && elapsed >= CALIBRATION_DURATION };
      });
      if (elapsed >= CALIBRATION_DURATION + 5) {
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, 1000);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      const locSub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 1000 },
        (loc) => {
          const acc = loc.coords.accuracy ?? 999;
          const score = acc < 5 ? 100 : acc < 10 ? 80 : acc < 20 ? 50 : 20;
          updateField("gps", score);
        },
      );
      subs.current.push(locSub);
    } else {
      updateField("gps", 80);
    }

    const magReadings: number[] = [];
    Magnetometer.setUpdateInterval(200);
    const magSub = Magnetometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      magReadings.push(magnitude);
      if (magReadings.length > 10) magReadings.shift();
      if (magReadings.length >= 5) {
        const avg = magReadings.reduce((a, b) => a + b, 0) / magReadings.length;
        const variance = magReadings.reduce((a, b) => a + Math.abs(b - avg), 0) / magReadings.length;
        updateField("compass", variance < 5 ? 100 : variance < 15 ? 70 : 40);
      }
    });
    subs.current.push(magSub);

    const accReadings: number[] = [];
    Accelerometer.setUpdateInterval(100);
    const accSub = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      accReadings.push(magnitude);
      if (accReadings.length > 20) accReadings.shift();
      if (accReadings.length >= 10) {
        const avg = accReadings.reduce((a, b) => a + b, 0) / accReadings.length;
        const variance = accReadings.reduce((a, b) => a + Math.abs(b - avg), 0) / accReadings.length;
        updateField("accelerometer", Math.abs(avg - 1) < 0.1 && variance < 0.05 ? 100 : 60);
      }
    });
    subs.current.push(accSub);

    const isBaroAvail = await Barometer.isAvailableAsync();
    if (isBaroAvail) {
      const barReadings: number[] = [];
      Barometer.setUpdateInterval(500);
      const barSub = Barometer.addListener(({ pressure }) => {
        if (!pressure) return;
        barReadings.push(pressure);
        if (barReadings.length > 6) barReadings.shift();
        updateField("barometer", barReadings.length >= 3 ? 100 : barReadings.length * 30);
      });
      subs.current.push(barSub);
    } else {
      updateField("barometer", 100);
    }
  }, [stop]);

  return { state, start, stop };
}
