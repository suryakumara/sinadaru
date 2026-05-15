import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMapStore } from "../../store/mapStore";
import { MapOverlay } from "../../components/map/MapOverlay";
import { Map3DView } from "../../components/map/Map3DView";
import { MapModeToggle } from "../../components/map/MapModeToggle";
import { AltitudeBar } from "../../components/ui/AltitudeBar";
import { AppIcon } from "../../components/ui/AppIcon";
import { useBarometer } from "../../hooks/useBarometer";
import { usePDR } from "../../hooks/usePDR";
import { useCompass } from "../../hooks/useCompass";
import { C } from "../../constants/Colors";

export default function MapTab() {
  const { mapMode, setMapMode, mapUri, isTracking, updatePosition, setAltitude, gpsReady, steps } =
    useMapStore();
  const baro = useBarometer(isTracking);
  const { position } = usePDR(isTracking);
  const { heading } = useCompass(true);
  const [searchText, setSearchText] = useState("");

  React.useEffect(() => {
    updatePosition(position.x, position.y, position.steps);
  }, [position]);

  React.useEffect(() => {
    setAltitude(baro.altitude, baro.floor);
  }, [baro.altitude, baro.floor]);

  return (
    <View style={s.root}>
      {/* Map fills screen */}
      <View style={s.mapArea}>
        {mapMode === "2d" ? (
          <MapOverlay heading={heading} />
        ) : (
          <Map3DView
            mapUri={mapUri}
            posX={position.x}
            posY={position.y}
            altitude={baro.altitude}
            heading={heading}
          />
        )}
      </View>

      {/* Top overlay: search bar */}
      <SafeAreaView style={s.topOverlay} edges={["top"]}>
        <View style={s.searchRow}>
          <View style={s.searchBox}>
            <AppIcon name="search" size={16} color={C.text2} />
            <TextInput
              style={s.searchInput}
              placeholder="Cari kios, kategori, atau lokasi"
              placeholderTextColor={C.text2}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          <TouchableOpacity style={s.filterBtn}>
            <AppIcon name="filter" size={18} color={C.text} />
          </TouchableOpacity>
        </View>

        {/* GPS badge */}
        {gpsReady && (
          <View style={s.gpsBadge}>
            <AppIcon name="gps" size={12} color={C.success} />
            <Text style={s.gpsText}>
              GPS LOCKED ±{baro.isAvailable ? baro.altitude.toFixed(1) : "2.1"}m
            </Text>
          </View>
        )}
      </SafeAreaView>

      {/* Right-side action buttons */}
      <View style={s.rightOverlay}>
        <TouchableOpacity style={s.actionBtn}>
          <AppIcon name="eye" size={18} color={C.text} />
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtn}>
          <AppIcon name="layers" size={18} color={C.text} />
        </TouchableOpacity>
        {isTracking && (
          <View style={s.trackingBadge}>
            <Text style={s.trackingSteps}>{steps}</Text>
          </View>
        )}
      </View>

      {/* Altitude bar */}
      {baro.isAvailable && (
        <View style={s.altBarWrapper}>
          <AltitudeBar altitude={baro.altitude} floor={baro.floor} isAvailable={baro.isAvailable} />
        </View>
      )}

      {/* Bottom: 2D/3D toggle */}
      <View style={s.bottomOverlay}>
        <MapModeToggle mode={mapMode} onChange={setMapMode} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: C.bg },
  mapArea:   { ...StyleSheet.absoluteFillObject },

  topOverlay: { position: "absolute", top: 0, left: 0, right: 0, paddingHorizontal: 16, paddingBottom: 8 },
  searchRow:  { flexDirection: "row", alignItems: "center", gap: 10 },
  searchBox:  { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: C.surface + "ee", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, gap: 8, borderWidth: 1, borderColor: C.border },
  searchInput:{ flex: 1, color: C.text, fontSize: 13 },
  filterBtn:  { backgroundColor: C.surface + "ee", width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.border },

  gpsBadge:  { alignSelf: "flex-end", flexDirection: "row", alignItems: "center", backgroundColor: "#14532dee", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, gap: 5, marginTop: 8 },
  gpsText:   { color: C.success, fontSize: 11, fontWeight: "700" },

  rightOverlay:  { position: "absolute", right: 16, top: "40%", gap: 10 },
  actionBtn:     { backgroundColor: C.surface + "dd", width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.border },
  trackingBadge: { backgroundColor: C.primary, width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  trackingSteps: { color: C.white, fontSize: 11, fontWeight: "700" },

  altBarWrapper: { position: "absolute", bottom: 80, left: 16, right: 16 },
  bottomOverlay: { position: "absolute", bottom: 76, left: 0, right: 0, alignItems: "center" },
});
