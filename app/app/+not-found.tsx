import { Link, Stack } from "expo-router";
import { View, Text } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 items-center justify-center p-5">
        <Text className="text-xl font-bold text-slate-800 mb-4">Halaman tidak ditemukan</Text>
        <Link href="/(tabs)/map">
          <Text className="text-blue-600 text-sm">Kembali ke Peta →</Text>
        </Link>
      </View>
    </>
  );
}
