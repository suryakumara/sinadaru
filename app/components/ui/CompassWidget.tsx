import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import { C } from "../../constants/Colors";

const DIRS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

function cardinalDir(deg: number): string {
  return DIRS[Math.round(deg / 45) % 8];
}

interface Props {
  heading: number;
  size?: number;
}

export function CompassWidget({ heading, size = 120 }: Props) {
  const r = size / 2;
  const arrowH = r - 22;

  // Jarum berputar -heading agar selalu menunjuk ke Utara sebenarnya.
  // Ring N/S/E/W DIAM — tidak ikut berputar.
  // heading=0  (menghadap N) → jarum +0°   → menunjuk atas (ke label N) ✓
  // heading=90 (menghadap E) → jarum -90°  → menunjuk kiri (Utara ada di kiri) ✓
  // heading=270(menghadap W) → jarum +90°  → menunjuk kanan (Utara ada di kanan) ✓
  const needleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withSpring(`${-heading}deg`, { damping: 20, stiffness: 130 }) }],
  }));

  return (
    <View style={{ alignItems: "center" }}>
      <View
        style={[
          s.ring,
          { width: size, height: size, borderRadius: r },
        ]}
      >
        {/* ── Label FIXED (tidak berputar) ── */}
        <Text style={[s.label, s.labelN]}>N</Text>
        <Text style={[s.label, s.labelS]}>S</Text>
        <Text style={[s.label, { top: r - 8, right: 5 }]}>E</Text>
        <Text style={[s.label, { top: r - 8, left: 5 }]}>W</Text>

        {/* ── Tick marks tipis di ring (opsional, FIXED) ── */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const tx = r + (r - 8) * Math.sin(rad) - 1;
          const ty = r - (r - 8) * Math.cos(rad) - 3;
          return (
            <View
              key={deg}
              style={{
                position: "absolute",
                width: 2,
                height: deg % 90 === 0 ? 8 : 5,
                backgroundColor: deg % 90 === 0 ? C.text2 : C.text3,
                top: ty,
                left: tx,
                transform: [{ rotate: `${deg}deg` }],
              }}
            />
          );
        })}

        {/* ── Jarum yang berputar ── */}
        <Animated.View
          style={[
            { position: "absolute", width: size, height: size },
            needleStyle,
          ]}
        >
          {/* Segmen merah (Utara) */}
          <View
            style={{
              position: "absolute",
              width: 8,
              height: arrowH,
              top: r - arrowH,
              left: r - 4,
              backgroundColor: "#ef4444",
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
            }}
          />
          {/* Segmen abu (Selatan) */}
          <View
            style={{
              position: "absolute",
              width: 8,
              height: arrowH,
              top: r,
              left: r - 4,
              backgroundColor: C.text3,
              borderBottomLeftRadius: 4,
              borderBottomRightRadius: 4,
            }}
          />
        </Animated.View>

        {/* ── Pivot tengah ── */}
        <View style={[s.pivot, { top: r - 6, left: r - 6 }]} />
      </View>

      {/* Heading display */}
      <View style={s.headingRow}>
        <Text style={s.headingDeg}>{Math.round(heading)}°</Text>
        <Text style={s.headingCard}>{cardinalDir(heading)}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  ring: {
    backgroundColor: C.surface,
    borderWidth: 2,
    borderColor: C.surface3,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  label:     { position: "absolute", fontSize: 11, fontWeight: "700", color: C.text2 },
  labelN:    { top: 5, alignSelf: "center", color: "#ef4444", left: undefined },
  labelS:    { bottom: 5, alignSelf: "center", left: undefined },
  pivot:     { position: "absolute", width: 12, height: 12, borderRadius: 6, backgroundColor: C.primary },
  headingRow:{ flexDirection: "row", alignItems: "baseline", gap: 4, marginTop: 8 },
  headingDeg:{ color: C.text, fontSize: 24, fontWeight: "800" },
  headingCard:{ color: C.text2, fontSize: 13, fontWeight: "600" },
});
