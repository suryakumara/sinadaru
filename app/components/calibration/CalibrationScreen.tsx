import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from "react-native";
import { ProgressBar } from "react-native-paper";
import { useCalibration } from "../../hooks/useCalibration";
import { AppIcon, AppIconName } from "../ui/AppIcon";
import { C } from "../../constants/Colors";

const SENSORS: {
  key: "gps" | "compass" | "accelerometer" | "barometer";
  label: string;
  iconName: AppIconName;
  hint: string;
}[] = [
  { key: "gps",           label: "GPS",           iconName: "gps",      hint: "Berdiri di area terbuka" },
  { key: "compass",       label: "Compass",       iconName: "compass",  hint: "Putar HP membentuk angka 8" },
  { key: "accelerometer", label: "Accelerometer", iconName: "steps",    hint: "Pegang HP diam dan rata" },
  { key: "barometer",     label: "Barometer",     iconName: "barometer",hint: "Tunggu beberapa detik..." },
];

const DURATION = 30;

function statusLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Stabil",      color: C.success };
  if (score >= 40) return { label: "Mendeteksi",  color: C.warning };
  return              { label: "Mencari...",   color: C.text3 };
}

interface Props {
  onComplete: () => void;
}

export function CalibrationScreen({ onComplete }: Props) {
  const { state, start, stop } = useCalibration();
  const remaining = Math.max(0, DURATION - state.elapsed);
  const progress = Math.min(1, state.elapsed / DURATION);
  const overallScore = Math.round(
    SENSORS.reduce((s, { key }) => s + state[key], 0) / SENSORS.length
  );

  useEffect(() => {
    start();
    return () => stop();
  }, []);

  useEffect(() => {
    if (state.isComplete) {
      stop();
      onComplete();
    }
  }, [state.isComplete]);

  const ringColor =
    overallScore >= 80 ? C.success : overallScore >= 40 ? C.warning : C.primary;

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Kalibrasi Sensor</Text>
        <Text style={s.subtitle}>
          {SENSORS.find(({ key }) => state[key] < 80)?.hint ?? "Semua sensor siap!"}
        </Text>
      </View>

      {/* Circular progress */}
      <View style={s.ringWrapper}>
        <View style={[s.ringOuter, { borderColor: C.surface2 }]}>
          <View style={[s.ringInner, { borderColor: ringColor }]}>
            <Text style={[s.ringPct, { color: ringColor }]}>{overallScore}%</Text>
            <Text style={s.ringSubLabel}>Sisa waktu</Text>
            <Text style={[s.ringTime, { color: C.text }]}>{remaining} detik</Text>
          </View>
        </View>
      </View>

      {/* Sensor rows */}
      <View style={s.sensorList}>
        {SENSORS.map(({ key, label, iconName }) => {
          const score = state[key];
          const { label: stLabel, color } = statusLabel(score);
          return (
            <View key={key} style={s.sensorRow}>
              <View style={s.sensorLeft}>
                <AppIcon name={iconName} size={20} color={color} />
                <Text style={s.sensorLabel}>{label}</Text>
              </View>
              <View style={s.sensorRight}>
                <Text style={[s.sensorStatus, { color }]}>{stLabel}</Text>
                <AppIcon name="chevron" size={16} color={C.text3} />
              </View>
            </View>
          );
        })}
      </View>

      {/* Overall progress bar */}
      <View style={s.progressWrapper}>
        <ProgressBar
          progress={progress}
          color={ringColor}
          style={s.progressBar}
        />
      </View>

      {/* Tip */}
      <View style={s.tipBox}>
        <AppIcon name="tip" size={20} color={C.text2} />
        <Text style={s.tipText}>Jauhkan dari benda logam saat kalibrasi</Text>
      </View>

      {/* Buttons */}
      <View style={s.footer}>
        <TouchableOpacity style={s.restartBtn} onPress={() => start()}>
          <AppIcon name="reset" size={16} color={C.text2} style={{ marginRight: 8 }} />
          <Text style={s.restartText}>Mulai Ulang</Text>
        </TouchableOpacity>
        {state.elapsed >= DURATION && (
          <TouchableOpacity style={s.skipBtn} onPress={onComplete}>
            <Text style={s.skipText}>Lewati →</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: C.bg, paddingHorizontal: 20 },
  header:      { alignItems: "center", paddingTop: 32, paddingBottom: 16 },
  title:       { color: C.text, fontSize: 22, fontWeight: "700", letterSpacing: -0.3 },
  subtitle:    { color: C.text2, fontSize: 13, marginTop: 6, textAlign: "center" },

  ringWrapper: { alignItems: "center", marginVertical: 20 },
  ringOuter:   { width: 156, height: 156, borderRadius: 78, borderWidth: 10, alignItems: "center", justifyContent: "center" },
  ringInner:   { width: 136, height: 136, borderRadius: 68, borderWidth: 6, alignItems: "center", justifyContent: "center", backgroundColor: C.surface },
  ringPct:     { fontSize: 38, fontWeight: "800" },
  ringSubLabel:{ color: C.text2, fontSize: 11, marginTop: 2 },
  ringTime:    { fontSize: 18, fontWeight: "700", marginTop: 2 },

  sensorList:  { backgroundColor: C.surface, borderRadius: 16, overflow: "hidden", marginBottom: 16 },
  sensorRow:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  sensorLeft:  { flexDirection: "row", alignItems: "center", gap: 12 },
  sensorLabel: { color: C.text, fontSize: 14, fontWeight: "500" },
  sensorRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  sensorStatus:{ fontSize: 13, fontWeight: "600" },

  progressWrapper: { marginBottom: 16 },
  progressBar:     { height: 4, borderRadius: 2, backgroundColor: C.surface2 },

  tipBox:      { flexDirection: "row", alignItems: "center", backgroundColor: C.surface2, borderRadius: 12, padding: 12, gap: 10, marginBottom: 20 },
  tipText:     { color: C.text2, fontSize: 12, flex: 1 },

  footer:      { gap: 10, paddingBottom: 16 },
  restartBtn:  { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: C.surface2, borderRadius: 14, paddingVertical: 14 },
  restartText: { color: C.text2, fontWeight: "600", fontSize: 14 },
  skipBtn:     { alignItems: "center", paddingVertical: 8 },
  skipText:    { color: C.text3, fontSize: 13 },
});
