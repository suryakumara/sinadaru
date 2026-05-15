import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useGPS } from "../../hooks/useGPS";
import { useMapStore } from "../../store/mapStore";
import { GPSLockScreen } from "./GPSLockScreen";
import { C } from "../../constants/Colors";

const MIN_SCREEN_MS = 3000;

export function GPSSetup() {
  const { coord, loading, error, startGPSLock } = useGPS();
  const { setOrigin, gpsReady } = useMapStore();

  const [showScreen, setShowScreen] = useState(false);
  const screenStartedAt = useRef<number | null>(null);
  const dismissPending = useRef(false);

  // Lock GPS when accurate coord received
  useEffect(() => {
    if (coord && coord.accuracy < 15) {
      setOrigin(coord.latitude, coord.longitude);
      // GPS ready — request dismiss (enforces min duration inside GPSLockScreen)
      setShowScreen(false);
    }
  }, [coord]);

  // Show loading screen when loading starts
  useEffect(() => {
    if (loading) {
      screenStartedAt.current = Date.now();
      dismissPending.current = false;
      setShowScreen(true);
    }
  }, [loading]);

  const handleStart = () => {
    startGPSLock();
  };

  const accuracyLabel = coord
    ? coord.accuracy <= 10 ? "Sangat Baik"
    : coord.accuracy <= 20 ? "Cukup Baik"
    : "Kurang Baik"
    : null;
  const accuracyColor = coord
    ? coord.accuracy <= 10 ? C.success
    : coord.accuracy <= 20 ? C.warning
    : C.error
    : C.text2;

  return (
    <>
      {/* Full-screen GPS loading screen (modal) */}
      <GPSLockScreen
        visible={showScreen}
        minDurationMs={MIN_SCREEN_MS}
        onDismiss={() => setShowScreen(false)}
      />

      {/* Compact card shown in scroll view */}
      <View style={s.card}>
        <View style={[s.accentBar, { backgroundColor: gpsReady ? C.success : C.primary }]} />

        <View style={s.body}>
          <View style={s.titleRow}>
            <Text style={s.title}>Kunci Posisi Awal</Text>
            {gpsReady && (
              <View style={s.lockedBadge}>
                <Text style={s.lockedText}>GPS Terkunci</Text>
              </View>
            )}
          </View>
          <Text style={s.desc}>Berdiri di pintu masuk pasar lalu kunci posisi GPS</Text>

          {/* GPS info after lock */}
          {coord && gpsReady && (
            <View style={s.infoBox}>
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Koordinat</Text>
                <View style={[s.accuracyBadge, { backgroundColor: accuracyColor + "22" }]}>
                  <Text style={[s.accuracyText, { color: accuracyColor }]}>{accuracyLabel}</Text>
                </View>
              </View>
              <Text style={s.coords}>
                {coord.latitude.toFixed(6)}, {coord.longitude.toFixed(6)}
              </Text>
              <Text style={s.accuracy}>Akurasi ±{coord.accuracy.toFixed(1)} meter</Text>
            </View>
          )}

          {error && (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled, gpsReady && s.btnSuccess]}
            onPress={handleStart}
            disabled={loading}
          >
            <Text style={s.btnText}>
              {loading ? "Mencari GPS..." : gpsReady ? "Kunci Ulang Posisi" : "Kunci Posisi Awal"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const s = StyleSheet.create({
  card:         { marginHorizontal: 16, marginBottom: 12, backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: "hidden" },
  accentBar:    { height: 3 },
  body:         { padding: 16 },
  titleRow:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  title:        { color: C.text, fontSize: 15, fontWeight: "700" },
  lockedBadge:  { backgroundColor: C.successDim, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  lockedText:   { color: C.success, fontSize: 11, fontWeight: "700" },
  desc:         { color: C.text2, fontSize: 12, marginBottom: 12 },

  infoBox:      { backgroundColor: C.surface2, borderRadius: 10, padding: 12, marginBottom: 12 },
  infoRow:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  infoLabel:    { color: C.text2, fontSize: 11, fontWeight: "600", letterSpacing: 0.3 },
  accuracyBadge:{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  accuracyText: { fontSize: 11, fontWeight: "700" },
  coords:       { color: C.text, fontSize: 12, fontFamily: "monospace" },
  accuracy:     { color: C.text2, fontSize: 10, marginTop: 3 },

  errorBox:     { backgroundColor: "#7f1d1d44", borderRadius: 10, padding: 10, marginBottom: 12 },
  errorText:    { color: C.error, fontSize: 12 },

  btn:          { backgroundColor: C.primary, borderRadius: 12, paddingVertical: 13, alignItems: "center" },
  btnDisabled:  { backgroundColor: C.surface3 },
  btnSuccess:   { backgroundColor: "#16a34a" },
  btnText:      { color: C.white, fontWeight: "700", fontSize: 13 },
});
