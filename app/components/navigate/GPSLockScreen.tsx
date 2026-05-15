import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  Dimensions,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  interpolate,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { C } from "../../constants/Colors";

const { width, height } = Dimensions.get("window");

// ── Deterministic particle positions (no Math.random per render) ─────────────
const PARTICLES: { id: number; x: number; y: number; size: number; delay: number; dur: number }[] =
  Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: ((i * 79 + 41) % (width - 16)) + 8,
    y: ((i * 137 + 60) % (height * 0.62)) + 30,
    size: (i % 3) + 2,
    delay: (i * 190) % 2200,
    dur: 1800 + (i * 230) % 1400,
  }));

// ── Perspective grid dots ────────────────────────────────────────────────────
const GRID: { id: number; x: number; y: number; opacity: number }[] = (() => {
  const pts: { id: number; x: number; y: number; opacity: number }[] = [];
  let id = 0;
  const cx = width / 2;
  const baseY = height * 0.58;
  for (let row = 0; row < 5; row++) {
    const spread = (row + 1) * (width * 0.22);
    const y = baseY + row * 28;
    const cols = row + 2;
    for (let col = 0; col < cols; col++) {
      const x = cx - spread / 2 + (spread / Math.max(cols - 1, 1)) * col;
      pts.push({ id: id++, x, y, opacity: 0.15 + row * 0.06 });
    }
  }
  return pts;
})();

// ── Sub-components ────────────────────────────────────────────────────────────

function Particle({ x, y, size, delay, dur }: (typeof PARTICLES)[number]) {
  const opacity = useSharedValue(0);
  const ty = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.9, { duration: dur * 0.4 }),
          withTiming(0.4, { duration: dur * 0.4 }),
          withTiming(0, { duration: dur * 0.2 }),
        ),
        -1,
      ),
    );
    ty.value = withDelay(
      delay,
      withRepeat(
        withTiming(-14, { duration: dur, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      ),
    );
    return () => {
      cancelAnimation(opacity);
      cancelAnimation(ty);
    };
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: ty.value }],
  }));

  return (
    <Animated.View
      style={[
        s.particle,
        { top: y, left: x, width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    />
  );
}

function PulseRing({ delay, maxSize }: { delay: number; maxSize: number }) {
  const scale = useSharedValue(0.1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 2200, easing: Easing.out(Easing.ease) }),
        -1,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.7, { duration: 400 }),
          withTiming(0, { duration: 1800, easing: Easing.out(Easing.ease) }),
        ),
        -1,
      ),
    );
    return () => {
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
    width: maxSize,
    height: maxSize,
    borderRadius: maxSize / 2,
    marginLeft: -maxSize / 2,
    marginTop: -maxSize / 2,
  }));

  return <Animated.View style={[s.ring, style]} />;
}

function PinIcon() {
  const glow = useSharedValue(0.5);
  const float = useSharedValue(0);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200 }),
        withTiming(0.5, { duration: 1200 }),
      ),
      -1,
      true,
    );
    float.value = withRepeat(
      withTiming(-10, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    return () => {
      cancelAnimation(glow);
      cancelAnimation(float);
    };
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glow.value, [0.5, 1], [0.25, 0.6]),
    transform: [{ scale: interpolate(glow.value, [0.5, 1], [1, 1.3]) }],
  }));

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: float.value }],
  }));

  return (
    <Animated.View style={[s.pinWrapper, floatStyle]}>
      {/* Glow halo behind pin */}
      <Animated.View style={[s.glowHalo, glowStyle]} />
      <Ionicons name="location" size={80} color="#38bdf8" />
    </Animated.View>
  );
}

function ProgressBar({ durationMs }: { durationMs: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(0.88, {
      duration: durationMs,
      easing: Easing.out(Easing.quad),
    });
    return () => cancelAnimation(progress);
  }, []);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={s.progressTrack}>
      <Animated.View style={[s.progressFill, barStyle]} />
    </View>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface Props {
  visible: boolean;
  onDismiss: () => void;
  onCancel: () => void;
  /** minimum ms to show screen before allowing dismiss; default 3000 */
  minDurationMs?: number;
}

export function GPSLockScreen({ visible, onDismiss, onCancel, minDurationMs = 3000 }: Props) {
  const startedAt = useRef<number | null>(null);
  const pendingDismiss = useRef(false);

  // Track when we first become visible
  useEffect(() => {
    if (visible) {
      startedAt.current = Date.now();
      pendingDismiss.current = false;
    }
  }, [visible]);

  // Caller signals ready; enforce minimum duration
  const handleReadyToDismiss = () => {
    const elapsed = startedAt.current ? Date.now() - startedAt.current : 0;
    const remaining = Math.max(0, minDurationMs - elapsed);
    setTimeout(onDismiss, remaining);
  };

  // Expose dismiss handler via ref trick — parent calls onDismiss directly.
  // If parent fires before minDuration, we delay it here.
  useEffect(() => {
    if (!visible && startedAt.current !== null) {
      const elapsed = Date.now() - startedAt.current;
      if (elapsed < minDurationMs) {
        const t = setTimeout(onDismiss, minDurationMs - elapsed);
        return () => clearTimeout(t);
      }
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent={false} animationType="fade" statusBarTranslucent>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <LinearGradient
        colors={["#040d1a", "#0b1120", "#071428"]}
        style={s.root}
      >
        {/* Grid dots */}
        {GRID.map((pt) => (
          <View
            key={pt.id}
            style={[s.gridDot, { top: pt.y, left: pt.x, opacity: pt.opacity }]}
          />
        ))}

        {/* Floating particles */}
        {PARTICLES.map((p) => (
          <Particle key={p.id} {...p} />
        ))}

        {/* ── Center content ── */}
        <View style={s.content}>
          {/* Title */}
          <Text style={s.title}>Indoor</Text>
          <Text style={s.title}>Positioning</Text>
          <Text style={s.subtitle}>GPS + Sensor Fusion</Text>

          {/* Pulse rings + pin */}
          <View style={s.pinArea}>
            <PulseRing delay={0} maxSize={200} />
            <PulseRing delay={700} maxSize={160} />
            <PulseRing delay={1400} maxSize={110} />
            <PinIcon />
          </View>

          {/* Description */}
          <Text style={s.desc}>
            Membangun pengalaman{"\n"}navigasi indoor tanpa batas
          </Text>

          {/* Progress bar */}
          <ProgressBar durationMs={minDurationMs} />
          <Text style={s.loadingText}>Mencari sinyal GPS...</Text>

          {/* Cancel button */}
          <TouchableOpacity style={s.cancelBtn} onPress={onCancel} activeOpacity={0.7}>
            <Text style={s.cancelText}>Batalkan</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },

  particle: { position: "absolute", backgroundColor: "#38bdf8" },
  gridDot:  { position: "absolute", width: 4, height: 4, borderRadius: 2, backgroundColor: "#38bdf8" },

  content: { flex: 1, alignItems: "center", justifyContent: "space-between", paddingVertical: 72, paddingHorizontal: 32 },

  title:    { color: "#ffffff", fontSize: 38, fontWeight: "900", lineHeight: 42, letterSpacing: -1, textAlign: "center" },
  subtitle: { color: "#38bdf8", fontSize: 15, fontWeight: "500", letterSpacing: 0.5, marginTop: 8 },

  pinArea: {
    alignItems: "center",
    justifyContent: "center",
    width: 220,
    height: 220,
  },
  ring: {
    position: "absolute",
    borderWidth: 1.5,
    borderColor: "#38bdf8",
    left: "50%",
    top: "50%",
  },
  pinWrapper: { alignItems: "center", justifyContent: "center", zIndex: 2 },
  glowHalo: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#38bdf8",
  },

  desc: {
    color: "#7f9bbc",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
  },

  progressTrack: {
    width: "100%",
    height: 5,
    backgroundColor: "#1a2e4a",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 3,
    shadowColor: "#3b82f6",
    shadowRadius: 6,
    shadowOpacity: 0.8,
  },
  loadingText: { color: "#4a6a8a", fontSize: 12, fontWeight: "500", marginTop: 6 },

  cancelBtn:  { marginTop: 16, paddingVertical: 12, paddingHorizontal: 32, borderRadius: 12, borderWidth: 1, borderColor: "#1e3a5f" },
  cancelText: { color: "#4a6a8a", fontSize: 14, fontWeight: "600", textAlign: "center" },
});
