import React from "react";
import { ScrollView, TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { AppIcon, AppIconName } from "../ui/AppIcon";
import { C } from "../../constants/Colors";

const CATEGORIES: { key: string; label: string; icon?: AppIconName }[] = [
  { key: "",        label: "Semua"   },
  { key: "SAYUR",   label: "Sayur",  icon: "cat-sayur"   },
  { key: "DAGING",  label: "Daging", icon: "cat-daging"  },
  { key: "IKAN",    label: "Ikan",   icon: "cat-ikan"    },
  { key: "BUMBU",   label: "Bumbu",  icon: "cat-bumbu"   },
  { key: "LAINNYA", label: "Lainnya",icon: "cat-lainnya" },
];

interface Props {
  selected: string;
  onSelect: (key: string) => void;
}

export function CategoryFilter({ selected, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.content}
      style={s.scroll}
    >
      {CATEGORIES.map(({ key, label, icon }) => {
        const isActive = selected === key;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onSelect(key)}
            style={[s.chip, isActive && s.chipActive]}
          >
            {icon && (
              <AppIcon
                name={icon}
                size={14}
                color={isActive ? C.white : C.text2}
              />
            )}
            <Text style={[s.chipText, isActive && s.chipTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll:         { marginBottom: 8 },
  content:        { paddingHorizontal: 16, gap: 8 },
  chip:           { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  chipActive:     { backgroundColor: C.primary, borderColor: C.primary },
  chipText:       { color: C.text2, fontSize: 12, fontWeight: "600" },
  chipTextActive: { color: C.white },
});
