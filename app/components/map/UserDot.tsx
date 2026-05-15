import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

const CONTAINER = 80;
const DOT       = 18;
const CONE_H    = 26;
const CONE_W    = 10; // half-width

interface Props {
  x: number;
  y: number;
  heading?: number; // 0 = North, 90 = East, clockwise
}

export function UserDot({ x, y, heading = 0 }: Props) {
  const pulse      = useSharedValue(1);
  const headingAnim = useSharedValue(heading);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.9, { duration: 900, easing: Easing.out(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  useEffect(() => {
    // Shortest-path rotation to avoid spinning through 360° on wrap-around
    const current = headingAnim.value;
    let diff = heading - (((current % 360) + 360) % 360);
    if (diff > 180)  diff -= 360;
    if (diff < -180) diff += 360;
    headingAnim.value = withTiming(current + diff, { duration: 250, easing: Easing.out(Easing.ease) });
  }, [heading]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 2 - pulse.value,
  }));

  const rotateStyle = useAnimatedStyle(() => ({
    // Rotate the whole container — dot stays circular, cone rotates with it
    transform: [{ rotate: `${headingAnim.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: x - CONTAINER / 2,
          top: y - CONTAINER / 2,
          width: CONTAINER,
          height: CONTAINER,
        },
        rotateStyle,
      ]}
    >
      {/* Direction cone: triangle pointing UP (= toward heading direction) */}
      <View
        style={{
          position: "absolute",
          top: CONTAINER / 2 - DOT / 2 - CONE_H,
          left: CONTAINER / 2 - CONE_W,
          width: 0,
          height: 0,
          borderStyle: "solid",
          borderLeftWidth: CONE_W,
          borderRightWidth: CONE_W,
          borderBottomWidth: CONE_H,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderBottomColor: "rgba(59,130,246,0.55)",
        }}
      />

      {/* Pulsing halo ring */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: CONTAINER / 2 - DOT,
            left: CONTAINER / 2 - DOT,
            width: DOT * 2,
            height: DOT * 2,
            borderRadius: DOT,
            backgroundColor: "rgba(59,130,246,0.22)",
          },
          pulseStyle,
        ]}
      />

      {/* Blue dot with white border */}
      <View
        style={{
          position: "absolute",
          top: CONTAINER / 2 - DOT / 2,
          left: CONTAINER / 2 - DOT / 2,
          width: DOT,
          height: DOT,
          borderRadius: DOT / 2,
          backgroundColor: "#3b82f6",
          borderWidth: 3,
          borderColor: "#ffffff",
          shadowColor: "#3b82f6",
          shadowRadius: 8,
          shadowOpacity: 0.8,
          elevation: 4,
        }}
      />
    </Animated.View>
  );
}
