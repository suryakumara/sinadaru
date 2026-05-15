import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { CalibrationScreen } from "../components/calibration/CalibrationScreen";

export default function CalibrationPage() {
  const router = useRouter();

  const handleComplete = async () => {
    await SecureStore.setItemAsync("calibrated", "1");
    router.replace("/(tabs)/map");
  };

  return <CalibrationScreen onComplete={handleComplete} />;
}
