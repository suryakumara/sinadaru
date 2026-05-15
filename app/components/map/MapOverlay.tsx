import React, { useState } from "react";
import {
  View, Image, TouchableOpacity, Text, Dimensions, Alert, ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { metersToPixels } from "../../utils/coordConverter";
import { useMapStore } from "../../store/mapStore";
import { UserDot } from "./UserDot";
import { EmptyState } from "../ui/EmptyState";

const { width: W } = Dimensions.get("window");

export function MapOverlay() {
  const {
    posX, posY, steps,
    mapUri, mapOriginX, mapOriginY, imageWidth, imageHeight, scaleX, scaleY,
    setMapUri, setMapOrigin,
    highlightedKiosId,
  } = useMapStore();

  const [settingOrigin, setSettingOrigin] = useState(false);

  const displayScale = W / imageWidth;
  const displayH = imageHeight * displayScale;

  const { px, py } = metersToPixels(posX, posY, {
    imageWidth, imageHeight, scaleX, scaleY,
    originX: mapOriginX, originY: mapOriginY,
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setMapUri(asset.uri, asset.width ?? 800, asset.height ?? 600);
      Alert.alert(
        "Set Titik Awal",
        "Tap pada denah untuk menandai posisi pintu masuk",
        [{ text: "OK", onPress: () => setSettingOrigin(true) }],
      );
    }
  };

  const handleTap = (evt: any) => {
    if (!settingOrigin) return;
    const { locationX, locationY } = evt.nativeEvent;
    setMapOrigin(locationX / displayScale, locationY / displayScale);
    setSettingOrigin(false);
    Alert.alert("✅ Titik awal disimpan!");
  };

  if (!mapUri) {
    return (
      <EmptyState
        icon="🗺️"
        title="Belum ada denah"
        description="Upload denah pasar dari tab Pengaturan"
        actionLabel="Upload Denah"
        onAction={pickImage}
      />
    );
  }

  return (
    <View className="flex-1">
      <ScrollView
        maximumZoomScale={4}
        minimumZoomScale={1}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity activeOpacity={1} onPress={handleTap}>
          <View style={{ width: W, height: displayH, position: "relative" }}>
            <Image
              source={{ uri: mapUri }}
              style={{ width: W, height: displayH }}
              resizeMode="contain"
            />
            <UserDot x={px * displayScale} y={py * displayScale} />
          </View>
        </TouchableOpacity>
      </ScrollView>

      {settingOrigin && (
        <View className="absolute top-0 left-0 right-0 bg-yellow-100 px-4 py-3 items-center">
          <Text className="text-yellow-800 font-medium text-sm">
            👆 Tap pada denah untuk set titik awal (pintu masuk)
          </Text>
        </View>
      )}

      <View className="flex-row justify-between items-center px-4 py-3 bg-white border-t border-slate-200">
        <Text className="text-xs text-slate-500">👟 {steps} langkah</Text>
        <Text className="text-xs text-slate-500">
          X: {posX.toFixed(1)}m  Y: {posY.toFixed(1)}m
        </Text>
        <TouchableOpacity onPress={pickImage}>
          <Text className="text-xs text-blue-600 font-semibold">Ganti Denah</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
