import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Alert, TextInput,
  StyleSheet, SafeAreaView,
} from "react-native";
import Slider from "@react-native-community/slider";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { useMapStore } from "../../store/mapStore";
import { useCreateKios } from "../../hooks/useKios";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { C } from "../../constants/Colors";
import { AppIcon, AppIconName } from "../../components/ui/AppIcon";

const kiosSchema = z.object({
  nama:    z.string().min(1, "Nama wajib diisi"),
  pemilik: z.string().optional(),
  blok:    z.string().min(1, "Blok wajib diisi"),
  nomor:   z.string().min(1, "Nomor wajib diisi"),
  pasarId: z.string().min(1, "Pasar ID wajib diisi"),
  kategori: z.enum(["SAYUR", "DAGING", "IKAN", "BUMBU", "LAINNYA"]),
});

type KiosForm = z.infer<typeof kiosSchema>;

const FORM_FIELDS: {
  key: keyof Pick<KiosForm, "nama" | "pemilik" | "blok" | "nomor" | "pasarId">;
  label: string;
  placeholder: string;
}[] = [
  { key: "nama",    label: "Nama Kios",  placeholder: "e.g. Toko Ibu Sari" },
  { key: "pemilik", label: "Pemilik",    placeholder: "Nama pemilik (opsional)" },
  { key: "blok",    label: "Blok",       placeholder: "e.g. A" },
  { key: "nomor",   label: "Nomor Kios", placeholder: "e.g. 12" },
  { key: "pasarId", label: "Pasar ID",   placeholder: "ID pasar dari sistem" },
];

const KATEGORI_OPTS = [
  { value: "SAYUR",   label: "Sayur",   icon: "cat-sayur"   as AppIconName },
  { value: "DAGING",  label: "Daging",  icon: "cat-daging"  as AppIconName },
  { value: "IKAN",    label: "Ikan",    icon: "cat-ikan"    as AppIconName },
  { value: "BUMBU",   label: "Bumbu",   icon: "cat-bumbu"   as AppIconName },
  { value: "LAINNYA", label: "Lainnya", icon: "cat-lainnya" as AppIconName },
] as const;

function SectionHeader({ title }: { title: string }) {
  return <Text style={s.sectionHeader}>{title}</Text>;
}

function SettingsRow({
  icon, label, description, onPress, chevron = true, destructive,
}: {
  icon: AppIconName;
  label: string;
  description?: string;
  onPress?: () => void;
  chevron?: boolean;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.7}>
      <View style={s.rowIcon}>
        <AppIcon name={icon} size={18} color={destructive ? C.error : C.text2} />
      </View>
      <View style={s.rowContent}>
        <Text style={[s.rowLabel, destructive && { color: C.error }]}>{label}</Text>
        {description && <Text style={s.rowDesc}>{description}</Text>}
      </View>
      {chevron && <Text style={s.chevron}>›</Text>}
    </TouchableOpacity>
  );
}

export default function SettingsTab() {
  const { setMapUri, resetPosition, scaleX, scaleY, setScale } = useMapStore();
  const [showAddKios, setShowAddKios] = useState(false);
  const [stepLength, setStepLength] = useState(0.75);
  const createKios = useCreateKios();
  const router = useRouter();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<KiosForm>({
    resolver: zodResolver(kiosSchema),
    defaultValues: { kategori: "LAINNYA" as const },
  });

  const pickDenah = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      const a = result.assets[0];
      setMapUri(a.uri, a.width ?? 800, a.height ?? 600);
      Alert.alert("Denah Diupload", "Buka tab Peta lalu tap pintu masuk untuk mengatur posisi awal.");
    }
  };

  const handleResetCalibration = () => {
    Alert.alert("Reset Kalibrasi?", "Proses kalibrasi 30 detik akan dijalankan ulang saat aplikasi dibuka kembali.", [
      { text: "Batal", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: async () => {
          await SecureStore.deleteItemAsync("calibrated");
          router.replace("/calibration");
        },
      },
    ]);
  };

  const onSubmitKios = (data: KiosForm) => {
    createKios.mutate(data, {
      onSuccess: () => {
        Alert.alert("Berhasil", "Kios baru berhasil ditambahkan.");
        reset();
        setShowAddKios(false);
      },
      onError: () => Alert.alert("Gagal", "Periksa koneksi ke server dan coba lagi."),
    });
  };

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Pengaturan</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* PETA & DENAH */}
        <SectionHeader title="PETA & DENAH" />
        <View style={s.section}>
          <SettingsRow icon="upload" label="Upload / Ganti Denah" description="Pilih gambar denah dari galeri" onPress={pickDenah} />
          <SettingsRow
            icon="scale"
            label="Kalibrasi Skala Denah"
            description={`Skala: ${scaleX.toFixed(3)} m/px`}
            onPress={() => Alert.alert("Kalibrasi Skala", "Scale = jarak nyata (m) ÷ pixel di denah")}
          />
          <SettingsRow
            icon="building"
            label="Pengelolaan Lantai"
            description="Atur jumlah dan tinggi antar lantai"
            onPress={() => Alert.alert("Segera Hadir", "Fitur ini akan tersedia di versi berikutnya.")}
          />
        </View>

        {/* SENSOR */}
        <SectionHeader title="SENSOR" />
        <View style={s.section}>
          {/* Step length slider */}
          <View style={s.sliderRow}>
            <View style={s.sliderHeader}>
              <View style={s.rowIcon}>
                <AppIcon name="stepLength" size={18} color={C.text2} />
              </View>
              <View style={s.rowContent}>
                <Text style={s.rowLabel}>Panjang Langkah</Text>
                <Text style={s.rowDesc}>{stepLength.toFixed(2)} m per langkah</Text>
              </View>
            </View>
            <Slider
              style={s.slider}
              minimumValue={0.4}
              maximumValue={1.2}
              value={stepLength}
              onValueChange={setStepLength}
              minimumTrackTintColor={C.primary}
              maximumTrackTintColor={C.surface3}
              thumbTintColor={C.primary}
              step={0.01}
            />
            <View style={s.sliderLabels}>
              <Text style={s.sliderLabel}>0.40 m</Text>
              <Text style={s.sliderLabel}>1.20 m</Text>
            </View>
          </View>

          <SettingsRow icon="compass" label="Kalibrasi Kompas" description="Putar perangkat membentuk angka 8" onPress={handleResetCalibration} />
          <SettingsRow icon="satellite" label="Sensitivitas Sensor" description="Tinggi" onPress={() => {}} />
        </View>

        {/* POSISI */}
        <SectionHeader title="POSISI" />
        <View style={s.section}>
          <SettingsRow
            icon="reset"
            label="Reset Posisi"
            description="Kembalikan ke titik awal GPS"
            onPress={() => { resetPosition(); Alert.alert("Posisi Direset"); }}
          />
          <SettingsRow
            icon="edit"
            label="Koreksi Posisi Manual"
            description="Tap lokasi di peta untuk koreksi"
            onPress={() => Alert.alert("Segera Hadir", "Fitur ini akan tersedia di versi berikutnya.")}
          />
        </View>

        {/* DATA KIOS */}
        <SectionHeader title="DATA KIOS" />
        <View style={s.section}>
          <SettingsRow
            icon={showAddKios ? "close" : "add"}
            label={showAddKios ? "Tutup Form" : "Tambah Kios Baru"}
            description="Input data kios untuk direktori"
            onPress={() => setShowAddKios(!showAddKios)}
          />
        </View>

        {showAddKios && (
          <View style={s.formCard}>
            <Text style={s.formTitle}>Tambah Kios Baru</Text>

            {FORM_FIELDS.map(({ key, label, placeholder }) => (
              <Controller
                key={key}
                control={control}
                name={key}
                render={({ field: { onChange, value } }) => (
                  <View style={s.fieldGroup}>
                    <Text style={s.fieldLabel}>{label}</Text>
                    <TextInput
                      style={[s.fieldInput, errors[key] && s.fieldInputError]}
                      placeholder={placeholder}
                      onChangeText={onChange}
                      value={value ?? ""}
                      placeholderTextColor={C.text3}
                    />
                    {errors[key] && (
                      <Text style={s.fieldError}>{errors[key]?.message}</Text>
                    )}
                  </View>
                )}
              />
            ))}

            {/* Kategori */}
            <View style={s.fieldGroup}>
              <Text style={s.fieldLabel}>Kategori</Text>
              <Controller
                control={control}
                name="kategori"
                render={({ field: { onChange, value } }) => (
                  <View style={s.kategoriRow}>
                    {KATEGORI_OPTS.map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        onPress={() => onChange(opt.value)}
                        style={[s.kategoriChip, value === opt.value && s.kategoriChipActive]}
                      >
                        <AppIcon
                          name={opt.icon}
                          size={13}
                          color={value === opt.value ? C.white : C.text2}
                        />
                        <Text style={[s.kategoriText, value === opt.value && s.kategoriTextActive]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
            </View>

            <TouchableOpacity
              style={[s.submitBtn, createKios.isPending && s.submitBtnDisabled]}
              onPress={handleSubmit(onSubmitKios)}
              disabled={createKios.isPending}
            >
              <Text style={s.submitText}>
                {createKios.isPending ? "Menyimpan..." : "Simpan Kios"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TENTANG */}
        <SectionHeader title="TENTANG" />
        <View style={[s.section, { marginBottom: 32 }]}>
          <View style={s.aboutCard}>
            <Text style={s.aboutName}>Navigasi Pasar</Text>
            <Text style={s.aboutVersion}>Versi 1.0.0</Text>
            <View style={s.aboutDivider} />
            <Text style={s.aboutStack}>GPS + PDR + Barometer + 3D Map</Text>
            <Text style={s.aboutDesc}>Indoor positioning untuk pasar tradisional</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: C.bg },
  header:        { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  title:         { color: C.text, fontSize: 22, fontWeight: "700" },

  sectionHeader: { color: C.text3, fontSize: 11, fontWeight: "700", letterSpacing: 1.2, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 },

  section:  { backgroundColor: C.surface, marginHorizontal: 16, borderRadius: 14, borderWidth: 1, borderColor: C.border, overflow: "hidden" },
  row:      { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  rowIcon:  { width: 34, height: 34, borderRadius: 9, backgroundColor: C.surface2, alignItems: "center", justifyContent: "center", marginRight: 12 },
  rowContent:  { flex: 1 },
  rowLabel:    { color: C.text, fontSize: 14, fontWeight: "600" },
  rowDesc:     { color: C.text2, fontSize: 11, marginTop: 2 },
  chevron:     { color: C.text3, fontSize: 20 },

  sliderRow:    { paddingHorizontal: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  sliderHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  slider:       { width: "100%", height: 32 },
  sliderLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: -4 },
  sliderLabel:  { color: C.text3, fontSize: 10 },

  formCard:      { marginHorizontal: 16, marginTop: 8, backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16 },
  formTitle:     { color: C.text, fontSize: 16, fontWeight: "700", marginBottom: 16 },
  fieldGroup:    { marginBottom: 14 },
  fieldLabel:    { color: C.text2, fontSize: 11, fontWeight: "600", marginBottom: 6 },
  fieldInput:    { backgroundColor: C.surface2, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: C.text, fontSize: 13, borderWidth: 1, borderColor: C.border },
  fieldInputError: { borderColor: C.error },
  fieldError:    { color: C.error, fontSize: 11, marginTop: 4 },
  kategoriRow:   { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  kategoriChip:  { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border },
  kategoriChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  kategoriText:  { color: C.text2, fontSize: 12, fontWeight: "600" },
  kategoriTextActive: { color: C.white },
  submitBtn:     { backgroundColor: C.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 4 },
  submitBtnDisabled: { backgroundColor: C.surface3 },
  submitText:    { color: C.white, fontWeight: "700", fontSize: 14 },

  aboutCard:   { padding: 16 },
  aboutName:   { color: C.text, fontSize: 15, fontWeight: "700" },
  aboutVersion:{ color: C.text2, fontSize: 12, marginTop: 2 },
  aboutDivider:{ height: 1, backgroundColor: C.border, marginVertical: 12 },
  aboutStack:  { color: C.text2, fontSize: 12 },
  aboutDesc:   { color: C.text3, fontSize: 11, marginTop: 3 },
});
