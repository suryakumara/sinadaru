import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { C } from "../../constants/Colors";

interface Props {
  icon: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: Props) {
  return (
    <View style={s.root}>
      <View style={s.iconBox}>
        <Text style={s.icon}>{icon}</Text>
      </View>
      <Text style={s.title}>{title}</Text>
      {description && <Text style={s.desc}>{description}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity style={s.btn} onPress={onAction}>
          <Text style={s.btnText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  iconBox: { width: 72, height: 72, borderRadius: 22, backgroundColor: C.surface2, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  icon:    { fontSize: 34 },
  title:   { color: C.text, fontSize: 16, fontWeight: "700", textAlign: "center", marginBottom: 6 },
  desc:    { color: C.text2, fontSize: 13, textAlign: "center", lineHeight: 18 },
  btn:     { marginTop: 20, backgroundColor: C.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  btnText: { color: C.white, fontWeight: "700", fontSize: 13 },
});
