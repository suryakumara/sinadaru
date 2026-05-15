import { Magnetometer } from "expo-sensors";
import { useState, useEffect } from "react";

export function useCompass(active = true) {
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    if (!active) return;
    Magnetometer.setUpdateInterval(100);
    const sub = Magnetometer.addListener(({ x, y }) => {
      // atan2(x, y) → bearing clockwise from North (0° = N, 90° = E)
      // atan2(y, x) is math-convention (0° = East) and would place N at West
      let angle = Math.atan2(x, y) * (180 / Math.PI);
      if (angle < 0) angle += 360;
      setHeading(angle);
    });
    return () => sub.remove();
  }, [active]);

  return { heading };
}
