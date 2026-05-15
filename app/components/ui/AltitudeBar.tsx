import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { C } from "../../constants/Colors";

interface Props {
  altitude: number;
  floor: number;
  isAvailable: boolean;
}

export function AltitudeBar({ altitude, floor, isAvailable }: Props) {
  if (!isAvailable) return null;
  return (
    <View style={s.row}>
      <Text style={s.label}>Ketinggian</Text>
      <Text style={[s.value, { color: "#38bdf8" }]}>
        {altitude >= 0 ? "+" : ""}{altitude.toFixed(1)} m
      </Text>
      <View style={s.divider} />
      <Text style={s.label}>Lantai</Text>
      <Text style={[s.value, { color: C.success }]}>{floor}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  row:     { flexDirection: "row", alignItems: "center", backgroundColor: C.surface + "cc", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, gap: 8 },
  label:   { color: C.text2, fontSize: 11 },
  value:   { fontSize: 12, fontWeight: "700" },
  divider: { width: 1, height: 12, backgroundColor: C.border },
});
