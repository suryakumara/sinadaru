import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface Props {
  x: number;
  y: number;
}

export function UserDot({ x, y }: Props) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.8, { duration: 900, easing: Easing.out(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 2 - pulse.value,
  }));

  return (
    <View
      style={{ position: "absolute", left: x - 12, top: y - 12, width: 24, height: 24 }}
    >
      <Animated.View
        style={[pulseStyle]}
        className="absolute inset-0 rounded-full bg-blue-400"
      />
      <View className="absolute inset-1 rounded-full bg-blue-600 border-2 border-white" />
    </View>
  );
}
