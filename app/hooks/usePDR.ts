import { Accelerometer } from "expo-sensors";
import { useState, useEffect, useRef } from "react";
import { useCompass } from "./useCompass";

const STEP_LENGTH = 0.75;
const STEP_THRESHOLD = 1.2;

export interface Position {
  x: number;
  y: number;
  steps: number;
}

export function usePDR(active: boolean) {
  const { heading } = useCompass(active);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0, steps: 0 });
  const stepDetected = useRef(false);
  const headingRef = useRef(heading);

  useEffect(() => { headingRef.current = heading; }, [heading]);

  useEffect(() => {
    if (!active) return;
    Accelerometer.setUpdateInterval(50);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      if (magnitude > STEP_THRESHOLD && !stepDetected.current) {
        stepDetected.current = true;
        const rad = (headingRef.current * Math.PI) / 180;
        setPosition((prev) => ({
          x: prev.x + STEP_LENGTH * Math.sin(rad),
          y: prev.y + STEP_LENGTH * Math.cos(rad),
          steps: prev.steps + 1,
        }));
      } else if (magnitude < STEP_THRESHOLD - 0.2) {
        stepDetected.current = false;
      }
    });
    return () => sub.remove();
  }, [active]);

  const resetPosition = () => setPosition({ x: 0, y: 0, steps: 0 });

  return { position, heading, resetPosition };
}
