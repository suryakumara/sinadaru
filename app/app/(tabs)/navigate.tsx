import React from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet } from "react-native";
import { SensorPanel } from "../../components/navigate/SensorPanel";
import { GPSSetup } from "../../components/navigate/GPSSetup";
import { AppIcon } from "../../components/ui/AppIcon";
import { useMapStore } from "../../store/mapStore";
import { C } from "../../constants/Colors";

export default function NavigateTab() {
  const { isTracking, setTracking, gpsReady, steps, resetPosition } = useMapStore();

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>Position Tracking</Text>
          <View style={s.statusRow}>
            <Text style={s.statusLabel}>Status Tracking </Text>
            <View style={[s.statusBadge, { backgroundColor: gpsReady ? "#14532d" : C.surface2 }]}>
              <View style={[s.statusDot, { backgroundColor: gpsReady ? C.success : C.text3 }]} />
              <Text style={[s.statusText, { color: gpsReady ? C.success : C.text2 }]}>
                {isTracking ? "Aktif" : gpsReady ? "Siap" : "Belum Siap"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <GPSSetup />
        <SensorPanel steps={steps} isTracking={isTracking} />

        {/* Main tracking button */}
        <View style={s.btnWrapper}>
          <TouchableOpacity
            style={[s.mainBtn, { backgroundColor: isTracking ? C.error : C.primary }]}
            onPress={() => setTracking(!isTracking)}
          >
            <AppIcon
              name={isTracking ? "stop" : "play"}
              size={22}
              color={C.white}
            />
            <Text style={s.mainBtnText}>
              {isTracking ? "STOP TRACKING" : "MULAI TRACKING"}
            </Text>
          </TouchableOpacity>

          {!gpsReady && !isTracking && (
            <Text style={s.gpsHint}>
              Kunci GPS di atas agar posisi awal di peta akurat
            </Text>
          )}
        </View>

        {/* Reset button */}
        {isTracking && (
          <TouchableOpacity style={s.resetBtn} onPress={resetPosition}>
            <AppIcon name="reset" size={16} color={C.text2} />
            <Text style={s.resetBtnText}>Reset Posisi ke Titik Awal</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: C.bg },
  header:      { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  title:       { color: C.text, fontSize: 22, fontWeight: "700", letterSpacing: -0.3 },
  statusRow:   { flexDirection: "row", alignItems: "center", marginTop: 4 },
  statusLabel: { color: C.text2, fontSize: 12 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusDot:   { width: 6, height: 6, borderRadius: 3 },
  statusText:  { fontSize: 12, fontWeight: "700" },

  btnWrapper:  { paddingHorizontal: 20, marginBottom: 12 },
  mainBtn:     { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 16, paddingVertical: 16 },
  mainBtnText: { fontSize: 16, fontWeight: "800", letterSpacing: 0.5, color: C.white },
  gpsHint:     { color: C.text3, fontSize: 11, textAlign: "center", marginTop: 8 },

  resetBtn:    { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 20, marginBottom: 12, borderWidth: 1, borderColor: C.border, borderRadius: 14, paddingVertical: 14 },
  resetBtnText:{ color: C.text2, fontSize: 14, fontWeight: "500" },
});
