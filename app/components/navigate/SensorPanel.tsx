import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ProgressBar } from "react-native-paper";
import { CompassWidget } from "../ui/CompassWidget";
import { AppIcon, AppIconName } from "../ui/AppIcon";
import { useCompass } from "../../hooks/useCompass";
import { useBarometer } from "../../hooks/useBarometer";
import { C } from "../../constants/Colors";

const DIRS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
function cardinalDir(deg: number) { return DIRS[Math.round(deg / 45) % 8]; }

const SENSOR_BADGES: { label: string; icon: AppIconName }[] = [
  { label: "Compass",       icon: "compass" },
  { label: "Accelerometer", icon: "steps"   },
  { label: "Barometer",     icon: "barometer" },
];

function StatBlock({ icon, value, unit }: { icon: AppIconName; value: string; unit: string }) {
  return (
    <View style={s.statBlock}>
      <AppIcon name={icon} size={20} color={C.text2} />
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statUnit}>{unit}</Text>
    </View>
  );
}

interface Props {
  steps: number;
  isTracking: boolean;
  accuracy?: number;
}

export function SensorPanel({ steps, isTracking, accuracy = 92 }: Props) {
  const { heading } = useCompass(true);
  const baro = useBarometer(isTracking);
  const distanceM = (steps * 0.75).toFixed(1);

  return (
    <View>
      {/* Compass + Stats */}
      <View style={s.mainRow}>
        <View style={s.compassCol}>
          <CompassWidget heading={heading} size={140} />
          <Text style={s.headingLabel}>
            {Math.round(heading)}° {cardinalDir(heading)}
          </Text>
        </View>
        <View style={s.statsGrid}>
          <StatBlock icon="steps"    value={String(steps)}  unit="langkah" />
          <StatBlock icon="distance" value={distanceM}       unit="meter"   />
          <StatBlock
            icon="floor"
            value={baro.isAvailable ? String(baro.floor) : "-"}
            unit="lantai"
          />
          <StatBlock
            icon="altitude"
            value={baro.isAvailable
              ? `${baro.altitude >= 0 ? "+" : ""}${baro.altitude.toFixed(1)}`
              : "N/A"}
            unit="m alt"
          />
        </View>
      </View>

      {/* Sensor accuracy bar */}
      <View style={s.accuracyRow}>
        <AppIcon name="accuracy" size={14} color={C.text2} />
        <Text style={s.accuracyLabel}>Sensor Akurasi</Text>
        <Text style={[s.accuracyPct, { color: accuracy >= 80 ? C.success : C.warning }]}>
          {accuracy}%
        </Text>
      </View>
      <ProgressBar
        progress={accuracy / 100}
        color={accuracy >= 80 ? C.success : C.warning}
        style={s.progressBar}
      />

      {/* Sensor badges */}
      <View style={s.badgeRow}>
        {SENSOR_BADGES.map(({ label, icon }) => (
          <View key={label} style={s.badge}>
            <AppIcon name={icon} size={22} color={C.success} />
            <View>
              <Text style={s.badgeLabel}>{label}</Text>
              <Text style={[s.badgeStatus, { color: C.success }]}>Stabil</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  mainRow:      { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, gap: 16 },
  compassCol:   { alignItems: "center" },
  headingLabel: { color: C.text2, fontSize: 11, fontWeight: "600", marginTop: 4 },
  statsGrid:    { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statBlock:    { width: "46%", backgroundColor: C.surface2, borderRadius: 12, padding: 10, alignItems: "center", gap: 4 },
  statValue:    { color: C.text, fontSize: 18, fontWeight: "700" },
  statUnit:     { color: C.text2, fontSize: 10 },

  accuracyRow:  { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 20, marginBottom: 6 },
  accuracyLabel:{ color: C.text2, fontSize: 12, fontWeight: "600", flex: 1 },
  accuracyPct:  { fontSize: 12, fontWeight: "700" },
  progressBar:  { marginHorizontal: 20, height: 6, borderRadius: 3, backgroundColor: C.surface2, marginBottom: 16 },

  badgeRow:     { flexDirection: "row", justifyContent: "space-around", paddingHorizontal: 16, paddingBottom: 16, gap: 10 },
  badge:        { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: C.surface, borderRadius: 12, padding: 10, gap: 8 },
  badgeLabel:   { color: C.text, fontSize: 11, fontWeight: "600" },
  badgeStatus:  { fontSize: 10, fontWeight: "700", marginTop: 1 },
});
