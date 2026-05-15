import React, { useState } from "react";
import { View, FlatList, Text, ActivityIndicator, StyleSheet, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { SearchBar } from "../../components/directory/SearchBar";
import { CategoryFilter } from "../../components/directory/CategoryFilter";
import { KiosCard } from "../../components/directory/KiosCard";
import { useKiosList } from "../../hooks/useKios";
import { useMapStore } from "../../store/mapStore";
import { AppIcon } from "../../components/ui/AppIcon";
import { C } from "../../constants/Colors";

export default function DirectoryTab() {
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("");
  const router = useRouter();
  const { setHighlightedKios, highlightedKiosId } = useMapStore();

  const { data, isLoading, isError } = useKiosList(undefined, search, kategori || undefined);
  const kiosList = data?.data ?? [];

  const handleViewMap = (id: string) => {
    setHighlightedKios(id);
    router.push("/(tabs)/map");
  };

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Direktori Kios</Text>
        <Text style={s.subtitle}>{isLoading ? "Memuat..." : `${kiosList.length} kios`}</Text>
      </View>

      <SearchBar value={search} onChangeText={setSearch} />
      <CategoryFilter selected={kategori} onSelect={setKategori} />

      {isLoading && (
        <View style={s.centered}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={s.loadingText}>Memuat data kios...</Text>
        </View>
      )}

      {isError && (
        <View style={s.centered}>
          <AppIcon name="warning" size={40} color={C.warning} />
          <Text style={s.emptyTitle}>Gagal memuat data</Text>
          <Text style={s.emptyDesc}>Periksa koneksi ke server</Text>
        </View>
      )}

      {!isLoading && !isError && kiosList.length === 0 && (
        <View style={s.centered}>
          <AppIcon name="store" size={40} color={C.text2} />
          <Text style={s.emptyTitle}>Belum ada kios</Text>
          <Text style={s.emptyDesc}>Tambah kios baru dari tab Pengaturan</Text>
        </View>
      )}

      <FlatList
        data={kiosList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <KiosCard
            kios={item}
            highlighted={item.id === highlightedKiosId}
            onViewMap={() => handleViewMap(item.id)}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 4, paddingBottom: 28 }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: C.bg },
  header:      { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16 },
  title:       { color: C.text, fontSize: 22, fontWeight: "700", letterSpacing: -0.3 },
  subtitle:    { color: C.text2, fontSize: 12, fontWeight: "500" },
  centered:    { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  loadingText: { color: C.text2, fontSize: 13, marginTop: 8 },
  emptyTitle:  { color: C.text, fontSize: 16, fontWeight: "700" },
  emptyDesc:   { color: C.text2, fontSize: 12 },
});
