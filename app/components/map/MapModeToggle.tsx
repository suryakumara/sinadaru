import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { C } from "../../constants/Colors";

interface Props {
  mode: "2d" | "3d";
  onChange: (mode: "2d" | "3d") => void;
}

export function MapModeToggle({ mode, onChange }: Props) {
  return (
    <View style={s.container}>
      {(["2d", "3d"] as const).map((m) => (
        <TouchableOpacity
          key={m}
          onPress={() => onChange(m)}
          style={[s.btn, mode === m && s.btnActive]}
        >
          <Text style={[s.label, mode === m && s.labelActive]}>
            {m.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container:  { flexDirection: "row", backgroundColor: C.surface + "ee", borderRadius: 14, padding: 3, borderWidth: 1, borderColor: C.border },
  btn:        { paddingHorizontal: 20, paddingVertical: 7, borderRadius: 10 },
  btnActive:  { backgroundColor: C.primary },
  label:      { color: C.text2, fontWeight: "700", fontSize: 13 },
  labelActive:{ color: C.white },
});
