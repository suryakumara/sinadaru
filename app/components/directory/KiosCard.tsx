import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Kios } from "../../hooks/useKios";
import { AppIcon, AppIconName } from "../ui/AppIcon";
import { C } from "../../constants/Colors";

const KATEGORI_CFG: Record<
  Kios["kategori"],
  { icon: AppIconName; label: string; bg: string; fg: string }
> = {
  SAYUR:   { icon: "cat-sayur",   label: "Sayur & Buah",   bg: "#14532d", fg: "#4ade80" },
  DAGING:  { icon: "cat-daging",  label: "Daging & Ayam",  bg: "#7f1d1d", fg: "#f87171" },
  IKAN:    { icon: "cat-ikan",    label: "Ikan & Seafood",  bg: "#0c4a6e", fg: "#38bdf8" },
  BUMBU:   { icon: "cat-bumbu",   label: "Bumbu & Rempah", bg: "#78350f", fg: "#fbbf24" },
  LAINNYA: { icon: "cat-lainnya", label: "Sembako & Umum", bg: "#312e81", fg: "#a78bfa" },
};

interface Props {
  kios: Kios;
  highlighted?: boolean;
  onViewMap?: () => void;
}

export function KiosCard({ kios, highlighted, onViewMap }: Props) {
  const cfg = KATEGORI_CFG[kios.kategori];

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[s.card, highlighted && s.cardHighlighted]}
      onPress={onViewMap}
    >
      {/* Thumbnail with category icon */}
      <View style={[s.thumb, { backgroundColor: cfg.bg }]}>
        <AppIcon name={cfg.icon} size={26} color={cfg.fg} />
      </View>

      {/* Content */}
      <View style={s.content}>
        <Text style={s.code}>{kios.blok}{kios.nomor}</Text>
        <Text style={s.name} numberOfLines={1}>{kios.nama}</Text>
        <Text style={[s.kategori, { color: cfg.fg }]}>{cfg.label}</Text>
      </View>

      {/* Right: floor + map button */}
      <View style={s.right}>
        <View style={s.floorBadge}>
          <AppIcon name="floor" size={11} color={C.text2} />
          <Text style={s.floorText}>Lantai 1</Text>
        </View>
        {onViewMap && (
          <TouchableOpacity style={s.mapBtn} onPress={onViewMap}>
            <AppIcon name="map" size={11} color={C.primary} />
            <Text style={s.mapBtnText}>Peta</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card:            { flexDirection: "row", alignItems: "center", backgroundColor: C.surface, marginHorizontal: 16, marginBottom: 8, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: C.border, gap: 12 },
  cardHighlighted: { borderColor: C.primary, backgroundColor: C.surface2 },

  thumb:    { width: 52, height: 52, borderRadius: 12, alignItems: "center", justifyContent: "center" },

  content:  { flex: 1, gap: 2 },
  code:     { color: C.text2, fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
  name:     { color: C.text, fontSize: 14, fontWeight: "700" },
  kategori: { fontSize: 11, fontWeight: "500" },

  right:       { alignItems: "flex-end", gap: 6 },
  floorBadge:  { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: C.surface2, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  floorText:   { color: C.text2, fontSize: 10, fontWeight: "600" },
  mapBtn:      { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: C.primary + "33", borderRadius: 8, paddingHorizontal: 7, paddingVertical: 4 },
  mapBtnText:  { color: C.primary, fontSize: 10, fontWeight: "700" },
});
