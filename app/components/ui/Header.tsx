import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { C } from "../../constants/Colors";

interface Props {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  accent?: boolean;
}

export function Header({ title, subtitle, rightAction, accent }: Props) {
  return (
    <SafeAreaView style={s.safeArea}>
      {accent && <View style={s.accentBar} />}
      <View style={s.container}>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>{title}</Text>
          {subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
        </View>
        {rightAction && <View style={{ marginLeft: 12 }}>{rightAction}</View>}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea:   { backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  accentBar:  { height: 2, backgroundColor: C.primary },
  container:  { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
  title:      { color: C.text, fontSize: 18, fontWeight: "700", letterSpacing: -0.2 },
  subtitle:   { color: C.text2, fontSize: 11, marginTop: 2 },
});
