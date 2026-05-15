import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { C } from "../../constants/Colors";

type Status = "ready" | "searching" | "error" | "inactive";

interface StatusItem {
  label: string;
  status: Status;
  value?: string;
}

interface Props {
  items: StatusItem[];
}

const DOT_COLOR: Record<Status, string> = {
  ready:    C.success,
  searching:C.warning,
  error:    C.error,
  inactive: C.text3,
};

const TEXT_COLOR: Record<Status, string> = {
  ready:    C.success,
  searching:C.warning,
  error:    C.error,
  inactive: C.text3,
};

export function SensorStatusBar({ items }: Props) {
  return (
    <View style={s.row}>
      {items.map((item) => (
        <View key={item.label} style={s.item}>
          <View style={[s.dot, { backgroundColor: DOT_COLOR[item.status] }]} />
          <Text style={[s.label, { color: TEXT_COLOR[item.status] }]}>
            {item.label}{item.value ? ` ${item.value}` : ""}
          </Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row:   { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  item:  { flexDirection: "row", alignItems: "center", gap: 5 },
  dot:   { width: 7, height: 7, borderRadius: 4 },
  label: { fontSize: 11, fontWeight: "600" },
});
