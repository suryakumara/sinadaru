import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { AppIcon } from "../ui/AppIcon";
import { C } from "../../constants/Colors";

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder = "Cari kios atau kategori" }: Props) {
  return (
    <View style={s.container}>
      <AppIcon name="search" size={16} color={C.text2} />
      <TextInput
        style={s.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.text2}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, marginHorizontal: 16, marginBottom: 12, gap: 10, borderWidth: 1, borderColor: C.border },
  input:     { flex: 1, color: C.text, fontSize: 13 },
});
