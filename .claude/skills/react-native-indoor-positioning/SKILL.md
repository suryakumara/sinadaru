---
name: react-native-indoor-positioning
description: Build a React Native Expo TypeScript app for indoor positioning using GPS, compass, accelerometer, and barometer sensors — no external beacons or infrastructure needed. Features 2D/3D map toggle (Three.js projection from uploaded floor plan), device calibration screen (min 30s), and PDR tracking. Use this skill whenever the user wants to create an indoor navigation app, pasar/market mapping app, PDR system, 3D floor plan viewer, or any app combining GPS lock + sensor-based indoor tracking with 2D/3D map overlay. Trigger also when user mentions "mapping pasar", "indoor navigation expo", "upload denah", "GPS + kompas + accelerometer", "peta 3D", "expo-three", or "barometer ketinggian" in React Native context.
---

# React Native Indoor Positioning Skill

Membangun aplikasi indoor positioning dengan Expo + TypeScript yang:

1. **Device Calibration Screen** — kalibrasi semua sensor minimal 30 detik sebelum mulai
2. **GPS lock** di titik awal (pintu masuk)
3. **PDR (Pedestrian Dead Reckoning)** — kompas + accelerometer
4. **Barometer** — deteksi ketinggian / estimasi lantai
5. **Upload denah 2D** + proyeksi otomatis ke **tampilan 3D** (expo-three + Three.js)
6. **Toggle 2D / 3D** di tab Peta — user pilih mode tampilan
7. **Bottom tab navigation** dengan 4 menu utama
8. **UI polished** dengan kompas live, altitude bar, status sensor

---

## Arsitektur Navigasi (Tab Menu)

App menggunakan `expo-router` dengan bottom tab navigation — 4 tab utama:

```
┌─────────────────────────────────────┐
│  🏪 Peta Pasar          [Header]    │
├─────────────────────────────────────┤
│                                     │
│         [Content Area]              │
│                                     │
├─────────────────────────────────────┤
│  🗺️ Peta  📍 Navigasi  🏪 Kios  ⚙️  │
│  (Map)   (Navigate)  (Directory)(Setting)│
└─────────────────────────────────────┘
```

### Tab 1 — Peta (`/map`)

Tampilan denah pasar + dot posisi user real-time. Ini tab utama.

### Tab 2 — Navigasi (`/navigate`)

GPS setup awal, status sensor (kompas, accelerometer), tombol mulai tracking.

### Tab 3 — Direktori Kios (`/directory`)

Daftar kios yang bisa dicari. Tap kios → highlight di peta.

### Tab 4 — Pengaturan (`/settings`)

Upload/ganti denah, kalibrasi skala, reset posisi, info app.

---

## Stack & Dependencies

### Full Stack Architecture

```
┌─────────────────────────────────────────────────────┐
│  MOBILE APP (Expo + React Native)                   │
│  app/          ← expo-router file-based routing     │
│  NativeWind    ← Tailwind CSS untuk styling         │
│  Zustand       ← global state                       │
│  TanStack Query← data fetching + caching            │
│  RHF + Zod     ← forms + validasi                   │
├─────────────────────────────────────────────────────┤
│  API LAYER (Express.js)                             │
│  server/src/   ← Express routes + controllers       │
│  Prisma ORM    ← query builder + migrations         │
│  MySQL         ← database                           │
└─────────────────────────────────────────────────────┘
```

### Setup Mobile App

```bash
# Buat project baru (pakai expo-router template)
npx create-expo-app@latest NamaApp --template tabs
cd NamaApp

# Sensor & lokasi
npx expo install expo-location
npx expo install expo-sensors       # Accelerometer, Magnetometer, Barometer
npx expo install expo-image-picker
npx expo install expo-file-system

# 3D rendering
npm install expo-three three
npm install @types/three

# NativeWind (Tailwind untuk React Native)
npm install nativewind tailwindcss
npx tailwindcss init

# State management
npm install zustand

# Data fetching
npm install @tanstack/react-query

# Forms + validasi
npm install react-hook-form zod @hookform/resolvers
```

> **Catatan:** Gunakan `npx expo install` (bukan `npm install`) untuk package native — Expo akan pilih versi kompatibel otomatis.

### Setup NativeWind

**`tailwind.config.js`:**

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: { extend: {} },
  plugins: [],
};
```

**`babel.config.js`:**

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"],
  };
};
```

**`global.css`** (di root project):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**`app/_layout.tsx`** — import global CSS:

```typescript
import "../global.css";
```

**Contoh penggunaan NativeWind:**

```typescript
// Pakai className seperti Tailwind biasa
<View className="flex-1 bg-slate-50 px-4">
  <Text className="text-xl font-bold text-slate-800">Peta Pasar</Text>
  <TouchableOpacity className="bg-blue-600 rounded-xl p-4 items-center">
    <Text className="text-white font-semibold text-base">Mulai Tracking</Text>
  </TouchableOpacity>
</View>
```

### Setup TanStack Query

**`app/_layout.tsx`** — wrap app dengan QueryClientProvider:

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "../global.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 menit
      retry: 2,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack />
    </QueryClientProvider>
  );
}
```

**Contoh query hook:**

```typescript
// hooks/useKios.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = process.env.EXPO_PUBLIC_API_URL; // misal: http://192.168.1.x:3000

export function useKiosList() {
  return useQuery({
    queryKey: ["kios"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/kios`);
      if (!res.ok) throw new Error("Gagal fetch kios");
      return res.json();
    },
  });
}

export function useCreateKios() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateKiosInput) => {
      const res = await fetch(`${API_BASE}/api/kios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Gagal buat kios");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kios"] }),
  });
}
```

### Setup React Hook Form + Zod

**Contoh form tambah kios:**

```typescript
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const kiosSchema = z.object({
  nama: z.string().min(1, "Nama kios wajib diisi"),
  pemilik: z.string().optional(),
  kategori: z.enum(["sayur", "daging", "ikan", "bumbu", "lainnya"]),
  blok: z.string().min(1, "Blok wajib diisi"),
  nomorKios: z.string().min(1, "Nomor kios wajib diisi"),
});

type KiosForm = z.infer<typeof kiosSchema>;

export function TambahKiosForm() {
  const { control, handleSubmit, formState: { errors } } = useForm<KiosForm>({
    resolver: zodResolver(kiosSchema),
    defaultValues: { kategori: "lainnya" },
  });

  const createKios = useCreateKios();

  const onSubmit = (data: KiosForm) => {
    createKios.mutate(data);
  };

  return (
    <View className="p-4 gap-4">
      <Controller
        control={control}
        name="nama"
        render={({ field: { onChange, value } }) => (
          <View>
            <TextInput
              className="border border-slate-300 rounded-xl px-4 py-3 text-slate-800"
              placeholder="Nama kios"
              onChangeText={onChange}
              value={value}
            />
            {errors.nama && (
              <Text className="text-red-500 text-xs mt-1">{errors.nama.message}</Text>
            )}
          </View>
        )}
      />
      {/* field lain... */}
      <TouchableOpacity
        className="bg-blue-600 rounded-xl p-4 items-center"
        onPress={handleSubmit(onSubmit)}
        disabled={createKios.isPending}
      >
        <Text className="text-white font-semibold">
          {createKios.isPending ? "Menyimpan..." : "Simpan Kios"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

## API Layer — Express.js + Prisma + MySQL

### Struktur Folder Backend

```
server/
├── src/
│   ├── app.ts                     # Express app setup (CORS, middleware)
│   ├── server.ts                  # Entry point (connect DB → listen)
│   ├── lib/
│   │   └── prisma.ts              # Prisma singleton client
│   ├── routes/
│   │   ├── index.ts               # Mount semua router ke /api
│   │   ├── pasar.routes.ts        # GET/POST/PATCH/DELETE /api/pasars
│   │   └── kios.routes.ts         # GET/POST/PATCH/DELETE /api/kios
│   ├── controllers/
│   │   ├── pasar.controller.ts
│   │   └── kios.controller.ts
│   ├── middlewares/
│   │   ├── validate.ts            # Zod validation middleware
│   │   └── errorHandler.ts        # Global error handler
│   ├── validations/
│   │   ├── pasar.validation.ts
│   │   └── kios.validation.ts
│   └── utils/
│       └── response.ts            # sendSuccess / sendError helpers
├── prisma/
│   └── schema.prisma
├── .env
├── package.json
└── tsconfig.json
```

### Setup Backend

```bash
cd server
npm init -y
npm install express cors dotenv zod jsonwebtoken multer
npm install prisma @prisma/client mysql2
npm install -D typescript ts-node nodemon @types/node @types/express @types/cors @types/jsonwebtoken @types/multer
npx prisma init --datasource-provider mysql
```

### `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Pasar {
  id        String   @id @default(cuid())
  nama      String
  alamat    String?
  deskripsi String?  @db.Text
  denahUrl  String?  @map("denah_url") @db.VarChar(500)
  scaleX    Float    @default(0.05) @map("scale_x")
  scaleY    Float    @default(0.05) @map("scale_y")
  originX   Float    @default(100)  @map("origin_x")
  originY   Float    @default(500)  @map("origin_y")
  kios      Kios[]
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt      @map("updated_at")

  @@map("pasars")
}

model Kios {
  id        String   @id @default(cuid())
  nama      String
  pemilik   String?
  kategori  Kategori @default(LAINNYA)
  blok      String
  nomor     String   @map("nomor_kios")
  posisiX   Float?   @map("posisi_x")
  posisiY   Float?   @map("posisi_y")
  deskripsi String?  @db.Text
  pasarId   String   @map("pasar_id")
  pasar     Pasar    @relation(fields: [pasarId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt      @map("updated_at")

  @@map("kios")
}

enum Kategori {
  SAYUR
  DAGING
  IKAN
  BUMBU
  LAINNYA
}
```

### `.env` (server)

```env
DATABASE_URL="mysql://root:password@127.0.0.1:3306/nama_database"
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
PORT=5001
FRONTEND_URL=http://localhost:5173
```

### `src/lib/prisma.ts`

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### `src/utils/response.ts`

```typescript
import { Response } from "express";

export function sendSuccess(res: Response, data: unknown, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function sendError(res: Response, message: string, status = 500, details?: unknown) {
  return res.status(status).json({ success: false, message, ...(details ? { details } : {}) });
}
```

### `src/middlewares/validate.ts`

```typescript
import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Validasi gagal",
        details: result.error.flatten().fieldErrors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
```

### `src/middlewares/errorHandler.ts`

```typescript
import { Request, Response, NextFunction } from "express";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error("[Error]", err.message);
  if ((err as any).code === "P2025") {
    res.status(404).json({ success: false, message: "Data tidak ditemukan" });
    return;
  }
  if ((err as any).code === "P2002") {
    res.status(409).json({ success: false, message: "Data duplikat" });
    return;
  }
  res.status(500).json({ success: false, message: "Internal server error" });
}
```

### `src/app.ts`

```typescript
import express from "express";
import cors from "cors";
import "dotenv/config";
import apiRoutes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "*",
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api", apiRoutes);
app.use(errorHandler);

export default app;
```

### `src/server.ts`

```typescript
import "dotenv/config";
import app from "./app";
import { prisma } from "./lib/prisma";

const PORT = Number(process.env.PORT) || 5001;

async function main() {
  await prisma.$connect();
  console.log("Database connected");
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

### `src/routes/index.ts`

```typescript
import { Router } from "express";
import pasarRoutes from "./pasar.routes";
import kiosRoutes from "./kios.routes";

const router = Router();
router.use("/pasars", pasarRoutes);
router.use("/kios", kiosRoutes);
export default router;
```

### API Endpoints

| Method | Endpoint        | Deskripsi                                      |
| ------ | --------------- | ---------------------------------------------- |
| GET    | /api/pasars     | Semua pasar (+ jumlah kios)                    |
| GET    | /api/pasars/:id | Detail pasar + daftar kios                     |
| POST   | /api/pasars     | Buat pasar baru                                |
| PATCH  | /api/pasars/:id | Update pasar                                   |
| DELETE | /api/pasars/:id | Hapus pasar (cascade kios)                     |
| GET    | /api/kios       | Semua kios (filter: pasarId, kategori, search) |
| GET    | /api/kios/:id   | Detail satu kios                               |
| POST   | /api/kios       | Buat kios baru                                 |
| PATCH  | /api/kios/:id   | Update kios                                    |
| DELETE | /api/kios/:id   | Hapus kios                                     |

### Migrasi Database

```bash
npx prisma migrate dev --name init   # buat tabel + generate client
npx prisma generate                  # re-generate client setelah schema berubah
npx prisma studio                    # GUI browser untuk inspect data
```

### `package.json` scripts

```json
{
  "scripts": {
    "dev": "nodemon --watch src --ext ts --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio"
  }
}
```

### Environment Mobile App

**`.env`** (di root Expo project):

```env
EXPO_PUBLIC_API_URL=http://192.168.1.x:5001
```

> Gunakan IP lokal (bukan `localhost`) agar HP fisik bisa akses server Express di laptop yang sama.

---

## Struktur Folder

```
NamaApp/
├── app/
│   ├── _layout.tsx              # Root layout + tab navigator
│   ├── calibration.tsx          # Layar kalibrasi device (muncul saat pertama buka)
│   └── (tabs)/
│       ├── _layout.tsx          # Tab bar config (icon, label, warna)
│       ├── map.tsx              # Tab 1: Peta 2D/3D + posisi user + toggle mode
│       ├── navigate.tsx         # Tab 2: GPS setup + status sensor
│       ├── directory.tsx        # Tab 3: Direktori & pencarian kios
│       └── settings.tsx         # Tab 4: Upload denah, kalibrasi, reset
├── components/
│   ├── ui/
│   │   ├── Header.tsx           # Header dengan judul + tombol aksi
│   │   ├── StatusBar.tsx        # Bar GPS/sensor status (warna indikator)
│   │   ├── CompassWidget.tsx    # Jarum kompas live berputar
│   │   ├── AltitudeBar.tsx      # Bar indikator ketinggian dari barometer
│   │   └── EmptyState.tsx       # State kosong (belum ada denah, dll)
│   ├── calibration/
│   │   ├── CalibrationScreen.tsx  # Layar kalibrasi full (30 detik countdown)
│   │   ├── SensorProgress.tsx     # Progress bar tiap sensor
│   │   └── CalibrationTimer.tsx   # Countdown ring visual
│   ├── map/
│   │   ├── MapOverlay.tsx       # Mode 2D: denah + dot posisi user
│   │   ├── Map3DView.tsx        # Mode 3D: Three.js proyeksi denah
│   │   ├── MapModeToggle.tsx    # Toggle switch 2D ↔ 3D
│   │   ├── UserDot.tsx          # Animasi dot posisi (pulse effect)
│   │   └── ScaleSlider.tsx      # Slider kalibrasi skala meter/pixel
│   ├── directory/
│   │   ├── KiosCard.tsx         # Card satu kios (nama, nomor, kategori)
│   │   ├── SearchBar.tsx        # Input pencarian kios
│   │   └── CategoryFilter.tsx   # Filter chip kategori (Sayur, Daging, dll)
│   └── navigate/
│       ├── GPSSetup.tsx         # Panel GPS lock
│       └── SensorPanel.tsx      # Panel status accelerometer + kompas + barometer
├── hooks/
│   ├── useGPS.ts                # GPS lock dengan akurasi check
│   ├── useCompass.ts            # Magnetometer → heading derajat
│   ├── usePDR.ts                # Pedestrian Dead Reckoning
│   ├── useBarometer.ts          # Barometer → altitude + estimasi lantai
│   ├── useCalibration.ts        # Orkestrasi kalibrasi semua sensor (30 detik)
│   └── useMapConfig.ts          # State konfigurasi denah (persist)
├── store/
│   └── mapStore.ts              # Zustand store — shared state antar tab
├── utils/
│   ├── coordConverter.ts        # Konversi meter PDR → pixel denah
│   └── floorEstimator.ts        # Estimasi lantai dari data barometer
└── assets/
    └── maps/                    # Gambar denah yang disimpan lokal
```

---

## Tab Navigator Setup

### `app/(tabs)/_layout.tsx`

```typescript
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0',
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerShown: false, // pakai Header custom per screen
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          title: 'Peta',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="navigate"
        options={{
          title: 'Navigasi',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="navigate" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="directory"
        options={{
          title: 'Kios',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="storefront" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Pengaturan',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

---

---

## Device Calibration Screen

App wajib menampilkan layar kalibrasi saat pertama kali dibuka. Kalibrasi berjalan **minimal 30 detik** untuk semua sensor sebelum user boleh masuk ke tab utama.

### Flow Kalibrasi

```
┌────────────────────────────────────┐
│  🔧 Kalibrasi Perangkat            │  ← Full screen, tidak bisa di-skip
├────────────────────────────────────┤
│                                    │
│     ┌─────────────────────┐        │
│     │   [Ring countdown]  │        │
│     │      28 detik       │        │  ← Countdown visual 30→0
│     └─────────────────────┘        │
│                                    │
│  🛰️ GPS           ████████░░  85%  │  ← Tiap sensor punya progress
│  🧭 Kompas        ██████████ 100%  │
│  📊 Akselerometer ██████████ 100%  │
│  🌡️ Barometer     ██████░░░░  60%  │
│                                    │
│  Pegang HP diam, berdiri di        │
│  area terbuka...                   │  ← Instruksi kontekstual
│                                    │
│  [ Mulai Kalibrasi Ulang ]         │  ← Tombol restart (jika gagal)
└────────────────────────────────────┘
```

Setelah semua sensor ≥ 80% ATAU 30 detik tercapai → otomatis masuk ke tab utama.

### `hooks/useCalibration.ts`

```typescript
import { useState, useEffect, useRef, useCallback } from "react";
import * as Location from "expo-location";
import { Magnetometer, Accelerometer, Barometer } from "expo-sensors";

export interface CalibrationState {
  gps: number; // 0–100
  compass: number;
  accelerometer: number;
  barometer: number;
  elapsed: number; // detik yang sudah lewat
  isComplete: boolean;
}

const CALIBRATION_DURATION = 30; // detik minimum

export function useCalibration() {
  const [state, setState] = useState<CalibrationState>({
    gps: 0,
    compass: 0,
    accelerometer: 0,
    barometer: 0,
    elapsed: 0,
    isComplete: false,
  });

  const startedAt = useRef<number>(0);
  const subs = useRef<{ remove: () => void }[]>([]);

  const updateField = (
    field: keyof Omit<CalibrationState, "elapsed" | "isComplete">,
    value: number,
  ) => {
    setState((prev) => {
      const next = { ...prev, [field]: Math.min(100, value) };
      const allReady =
        next.gps >= 80 && next.compass >= 80 && next.accelerometer >= 80 && next.barometer >= 80;
      const timeUp = next.elapsed >= CALIBRATION_DURATION;
      return { ...next, isComplete: allReady && timeUp };
    });
  };

  const start = useCallback(async () => {
    subs.current.forEach((s) => s.remove());
    subs.current = [];
    startedAt.current = Date.now();
    setState({ gps: 0, compass: 0, accelerometer: 0, barometer: 0, elapsed: 0, isComplete: false });

    // --- Countdown timer ---
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt.current) / 1000);
      setState((prev) => {
        const allReady =
          prev.gps >= 80 && prev.compass >= 80 && prev.accelerometer >= 80 && prev.barometer >= 80;
        return {
          ...prev,
          elapsed,
          isComplete: allReady && elapsed >= CALIBRATION_DURATION,
        };
      });
      if (elapsed >= CALIBRATION_DURATION + 5) clearInterval(timer);
    }, 1000);

    // --- GPS ---
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      const locSub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 1000 },
        (loc) => {
          const acc = loc.coords.accuracy ?? 999;
          // Akurasi < 5m = 100%, < 10m = 80%, < 20m = 50%
          const score = acc < 5 ? 100 : acc < 10 ? 80 : acc < 20 ? 50 : 20;
          updateField("gps", score);
        },
      );
      subs.current.push(locSub);
    }

    // --- Kompas (Magnetometer) ---
    const readings: number[] = [];
    Magnetometer.setUpdateInterval(200);
    const magSub = Magnetometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      readings.push(magnitude);
      if (readings.length > 10) readings.shift();
      // Variasi rendah = stabil = kalibrasi baik
      if (readings.length >= 5) {
        const avg = readings.reduce((a, b) => a + b, 0) / readings.length;
        const variance = readings.reduce((a, b) => a + Math.abs(b - avg), 0) / readings.length;
        const score = variance < 5 ? 100 : variance < 15 ? 70 : 40;
        updateField("compass", score);
      }
    });
    subs.current.push(magSub);

    // --- Accelerometer ---
    const accReadings: number[] = [];
    Accelerometer.setUpdateInterval(100);
    const accSub = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      accReadings.push(magnitude);
      if (accReadings.length > 20) accReadings.shift();
      if (accReadings.length >= 10) {
        // HP diam → magnitude ≈ 1 (gravitasi), variance kecil
        const avg = accReadings.reduce((a, b) => a + b, 0) / accReadings.length;
        const variance =
          accReadings.reduce((a, b) => a + Math.abs(b - avg), 0) / accReadings.length;
        const score = Math.abs(avg - 1) < 0.1 && variance < 0.05 ? 100 : 60;
        updateField("accelerometer", score);
      }
    });
    subs.current.push(accSub);

    // --- Barometer ---
    const barReadings: number[] = [];
    Barometer.setUpdateInterval(500);
    const barSub = Barometer.addListener(({ pressure }) => {
      if (pressure) {
        barReadings.push(pressure);
        if (barReadings.length > 6) barReadings.shift();
        // Setelah 3+ sampel stabil = kalibrasi OK
        const score = barReadings.length >= 3 ? 100 : barReadings.length * 30;
        updateField("barometer", score);
      }
    });
    subs.current.push(barSub);

    return () => {
      clearInterval(timer);
      subs.current.forEach((s) => s.remove());
    };
  }, []);

  const stop = useCallback(() => {
    subs.current.forEach((s) => s.remove());
    subs.current = [];
  }, []);

  return { state, start, stop };
}
```

### `components/calibration/CalibrationScreen.tsx`

```typescript
import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useCalibration } from "../../hooks/useCalibration";
import { router } from "expo-router";

const SENSORS = [
  { key: "gps" as const,           label: "🛰️ GPS",            hint: "Berdiri di area terbuka" },
  { key: "compass" as const,        label: "🧭 Kompas",          hint: "Putar HP membentuk angka 8" },
  { key: "accelerometer" as const,  label: "📊 Akselerometer",   hint: "Pegang HP diam dan rata" },
  { key: "barometer" as const,      label: "🌡️ Barometer",       hint: "Tunggu beberapa detik..." },
];

export function CalibrationScreen() {
  const { state, start, stop } = useCalibration();
  const remaining = Math.max(0, 30 - state.elapsed);

  useEffect(() => {
    const cleanup = start();
    return () => { cleanup.then((fn) => fn?.()); stop(); };
  }, []);

  useEffect(() => {
    if (state.isComplete) {
      stop();
      router.replace("/(tabs)/map");
    }
  }, [state.isComplete]);

  return (
    <View className="flex-1 bg-slate-900 items-center justify-center px-6">
      <Text className="text-white text-2xl font-bold mb-2">🔧 Kalibrasi Perangkat</Text>
      <Text className="text-slate-400 text-sm text-center mb-8">
        Tunggu hingga semua sensor siap untuk akurasi terbaik
      </Text>

      {/* Countdown ring */}
      <View className="w-32 h-32 rounded-full border-4 border-blue-500 items-center justify-center mb-8">
        <Text className="text-white text-4xl font-bold">{remaining}</Text>
        <Text className="text-slate-400 text-xs">detik</Text>
      </View>

      {/* Sensor progress */}
      <View className="w-full gap-3 mb-8">
        {SENSORS.map(({ key, label, hint }) => {
          const score = state[key];
          const isReady = score >= 80;
          return (
            <View key={key}>
              <View className="flex-row justify-between mb-1">
                <Text className="text-white text-sm">{label}</Text>
                <Text className={isReady ? "text-green-400 text-sm" : "text-yellow-400 text-sm"}>
                  {isReady ? "✅ Siap" : `${score}%`}
                </Text>
              </View>
              <View className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <View
                  className={`h-full rounded-full ${isReady ? "bg-green-500" : "bg-blue-500"}`}
                  style={{ width: `${score}%` }}
                />
              </View>
              {!isReady && (
                <Text className="text-slate-500 text-xs mt-1">{hint}</Text>
              )}
            </View>
          );
        })}
      </View>

      <TouchableOpacity
        className="bg-slate-700 rounded-xl px-6 py-3"
        onPress={() => start()}
      >
        <Text className="text-white font-medium">🔄 Mulai Kalibrasi Ulang</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Routing — tampilkan kalibrasi saat pertama buka

**`app/_layout.tsx`:**

```typescript
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "../global.css";

export default function RootLayout() {
  const [checked, setChecked] = useState(false);
  const [needsCalibration, setNeedsCalibration] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("calibrated").then((val) => {
      setNeedsCalibration(!val);
      setChecked(true);
    });
  }, []);

  if (!checked) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {needsCalibration && <Stack.Screen name="calibration" />}
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
```

**`app/calibration.tsx`:**

```typescript
import { CalibrationScreen } from "../components/calibration/CalibrationScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function CalibrationPage() {
  // CalibrationScreen akan redirect ke /(tabs)/map setelah selesai
  // Tandai sudah pernah kalibrasi supaya tidak muncul lagi
  const router = useRouter();

  const handleComplete = async () => {
    await AsyncStorage.setItem("calibrated", "1");
    router.replace("/(tabs)/map");
  };

  return <CalibrationScreen onComplete={handleComplete} />;
}
```

---

## UI Components Detail

### `components/ui/Header.tsx`

Header reusable dengan title, subtitle opsional, dan slot tombol kanan.

```typescript
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

interface Props {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
}

export function Header({ title, subtitle, rightAction }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {rightAction && <View>{rightAction}</View>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: '#ffffff' },
  container: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  subtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
});
```

### `components/ui/StatusBar.tsx`

Bar hijau/kuning/merah sebagai indikator status GPS dan sensor.

```typescript
// Status: 'ready' | 'searching' | 'error' | 'inactive'
// Warna:   hijau    kuning        merah     abu-abu

interface StatusItem {
  label: string;
  status: "ready" | "searching" | "error" | "inactive";
  value?: string;
}

// Contoh penggunaan:
// <StatusBar items={[
//   { label: 'GPS', status: 'ready', value: '±8m' },
//   { label: 'Kompas', status: 'ready', value: '245°' },
//   { label: 'Tracking', status: 'searching' },
// ]} />
```

### `components/ui/CompassWidget.tsx`

Kompas visual berputar mengikuti heading real-time.

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface Props {
  heading: number; // 0-360 derajat
}

export function CompassWidget({ heading }: Props) {
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withSpring(`${-heading}deg`) }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.compass, animStyle]}>
        <Text style={styles.north}>N</Text>
        <Text style={styles.needle}>▲</Text>
        <Text style={styles.south}>S</Text>
      </Animated.View>
      <Text style={styles.degree}>{heading.toFixed(0)}°</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  compass: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center' },
  north: { color: '#ef4444', fontWeight: '700', fontSize: 16 },
  needle: { color: '#ef4444', fontSize: 24 },
  south: { color: '#64748b', fontWeight: '700' },
  degree: { fontSize: 14, color: '#475569', marginTop: 4 },
});
```

### `components/ui/EmptyState.tsx`

Komponen state kosong yang reusable.

```typescript
// Tampil jika belum ada denah, belum ada kios, dll
// Props: icon (emoji), title, description, actionLabel, onAction
```

---

## Screen Detail

### Tab 1 — `app/(tabs)/map.tsx` (Peta)

```
┌────────────────────────────────┐
│ 🏪 Peta Pasar    [📍 Reset]   │  ← Header
├────────────────────────────────┤
│ GPS ✅  Kompas ✅  Tracking 🟡 │  ← StatusBar 3 indikator
├────────────────────────────────┤
│                                │
│   [Gambar Denah Pasar]         │  ← MapOverlay (scrollable/zoomable)
│         🔵 (posisi user)       │
│                                │
├────────────────────────────────┤
│ 👟 42 langkah  📐 X:3.2 Y:1.8m│  ← Info bar bawah
└────────────────────────────────┘
```

**Fitur interaksi peta:**

- Pinch-to-zoom pada denah
- Tap tahan untuk set manual posisi user (override PDR)
- Tombol reset posisi di header kanan

### Tab 2 — `app/(tabs)/navigate.tsx` (Navigasi)

```
┌────────────────────────────────┐
│ 📍 Setup Navigasi              │  ← Header
├────────────────────────────────┤
│  ┌──────────────────────────┐  │
│  │ 🛰️ GPS Lock              │  │  ← GPS Setup Card
│  │ Berdiri di pintu masuk   │  │
│  │ [  Kunci Posisi Awal  ]  │  │
│  │ Akurasi: ±8.2 meter ✅   │  │
│  └──────────────────────────┘  │
│                                │
│  ┌──────────────────────────┐  │
│  │ 🧭 Sensor Status         │  │  ← Sensor Panel
│  │ ┌────────┐  ┌─────────┐ │  │
│  │ │Kompas  │  │ Steps   │ │  │
│  │ │  245°  │  │  42     │ │  │
│  │ └────────┘  └─────────┘ │  │
│  │  [CompassWidget live]    │  │
│  └──────────────────────────┘  │
│                                │
│  [ ▶️ Mulai Tracking ]         │  ← Tombol aksi utama
└────────────────────────────────┘
```

### Tab 3 — `app/(tabs)/directory.tsx` (Direktori Kios)

```
┌────────────────────────────────┐
│ 🏪 Direktori Kios              │
├────────────────────────────────┤
│ 🔍 Cari nama atau nomor kios   │  ← SearchBar
├────────────────────────────────┤
│ [Semua] [Sayur] [Daging] [dll] │  ← CategoryFilter chips
├────────────────────────────────┤
│ ┌──────────────────────────┐   │
│ │ 🛖 Kios A-12             │   │  ← KiosCard
│ │ Bu Sari — Sayur Mayur    │   │
│ │ Lantai 1, Blok A         │   │
│ │              [Lihat Peta]│   │
│ └──────────────────────────┘   │
│ ┌──────────────────────────┐   │
│ │ 🛖 Kios B-03             │   │
│ │ Pak Wayan — Daging Sapi  │   │
│ │              [Lihat Peta]│   │
│ └──────────────────────────┘   │
└────────────────────────────────┘
```

**Data kios disimpan lokal** sebagai JSON array di `AsyncStorage`:

```typescript
interface Kios {
  id: string;
  nama: string;
  pemilik?: string;
  kategori: "sayur" | "daging" | "ikan" | "bumbu" | "lainnya";
  blok: string;
  nomorKios: string;
  posisiX?: number; // meter dari titik awal
  posisiY?: number;
}
```

### Tab 4 — `app/(tabs)/settings.tsx` (Pengaturan)

```
┌────────────────────────────────┐
│ ⚙️ Pengaturan                  │
├────────────────────────────────┤
│ DENAH PASAR                    │
│ ┌──────────────────────────┐   │
│ │ 🗺️ Upload Denah Baru     │ > │  ← Buka image picker
│ │ 📐 Kalibrasi Skala       │ > │  ← Slider meter/pixel
│ │ 📍 Set Ulang Titik Awal  │ > │  ← Tap ulang di denah
│ └──────────────────────────┘   │
│                                │
│ SENSOR                         │
│ ┌──────────────────────────┐   │
│ │ 👟 Panjang Langkah       │   │
│ │ [====●========] 0.75m    │   │  ← Slider kalibrasi step
│ └──────────────────────────┘   │
│                                │
│ DATA                           │
│ ┌──────────────────────────┐   │
│ │ 🔄 Reset Posisi          │ > │
│ │ 🗑️ Hapus Semua Data      │ > │
│ └──────────────────────────┘   │
│                                │
│ TENTANG                        │
│  Versi 1.0.0 · Peta Pasar     │
└────────────────────────────────┘
```

---

### `hooks/useGPS.ts`

```typescript
import * as Location from "expo-location";
import { useState } from "react";

export interface GPSCoord {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export function useGPS() {
  const [coord, setCoord] = useState<GPSCoord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startGPSLock = async () => {
    setLoading(true);
    setError(null);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setError("Izin lokasi ditolak");
      setLoading(false);
      return;
    }

    // Tunggu GPS akurat (accuracy < 10 meter)
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    setCoord({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy ?? 999,
    });
    setLoading(false);
  };

  return { coord, loading, error, startGPSLock };
}
```

### `components/GPSSetup.tsx`

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useGPS } from '../hooks/useGPS';

interface Props {
  onGPSReady: (lat: number, lng: number) => void;
}

export function GPSSetup({ onGPSReady }: Props) {
  const { coord, loading, error, startGPSLock } = useGPS();

  const handleLock = async () => {
    await startGPSLock();
  };

  React.useEffect(() => {
    if (coord && coord.accuracy < 15) {
      onGPSReady(coord.latitude, coord.longitude);
    }
  }, [coord]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📍 Setup Posisi Awal</Text>
      <Text style={styles.subtitle}>
        Berdiri di pintu masuk pasar, lalu tekan tombol di bawah
      </Text>

      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Mengunci GPS...</Text>
        </View>
      )}

      {coord && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>✅ GPS terkunci!</Text>
          <Text style={styles.infoText}>Akurasi: {coord.accuracy?.toFixed(1)} meter</Text>
          <Text style={styles.coordText}>
            {coord.latitude.toFixed(6)}, {coord.longitude.toFixed(6)}
          </Text>
          {coord.accuracy > 15 && (
            <Text style={styles.warningText}>
              ⚠️ Akurasi kurang baik, coba di area terbuka
            </Text>
          )}
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLock}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Mencari GPS...' : '🛰️ Kunci Posisi Awal'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#f8fafc' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, color: '#1e293b' },
  subtitle: { fontSize: 14, textAlign: 'center', color: '#64748b', marginBottom: 32 },
  loadingBox: { alignItems: 'center', marginBottom: 24 },
  loadingText: { marginTop: 12, color: '#2563eb', fontSize: 16 },
  infoBox: { backgroundColor: '#e0f2fe', borderRadius: 12, padding: 16, marginBottom: 24 },
  infoText: { fontSize: 16, color: '#0369a1', marginBottom: 4 },
  coordText: { fontSize: 12, color: '#475569', marginTop: 4 },
  warningText: { fontSize: 13, color: '#b45309', marginTop: 8 },
  errorText: { color: '#dc2626', textAlign: 'center', marginBottom: 16 },
  button: { backgroundColor: '#2563eb', padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#93c5fd' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
```

---

## Phase 2: PDR — Sensor Tracking

### `hooks/useCompass.ts`

```typescript
import { Magnetometer } from "expo-sensors";
import { useState, useEffect } from "react";

export function useCompass() {
  const [heading, setHeading] = useState(0); // derajat dari Utara

  useEffect(() => {
    Magnetometer.setUpdateInterval(100);
    const sub = Magnetometer.addListener(({ x, y }) => {
      let angle = Math.atan2(y, x) * (180 / Math.PI);
      if (angle < 0) angle += 360;
      setHeading(angle);
    });
    return () => sub.remove();
  }, []);

  return { heading };
}
```

### `hooks/usePDR.ts`

```typescript
import { Accelerometer } from "expo-sensors";
import { useState, useEffect, useRef } from "react";
import { useCompass } from "./useCompass";

const STEP_LENGTH = 0.75; // meter per langkah (rata-rata)
const STEP_THRESHOLD = 1.2; // threshold deteksi langkah

export interface Position {
  x: number; // meter dari titik awal (Timur+)
  y: number; // meter dari titik awal (Utara+)
  steps: number;
}

export function usePDR(active: boolean) {
  const { heading } = useCompass();
  const [position, setPosition] = useState<Position>({ x: 0, y: 0, steps: 0 });
  const lastMagnitude = useRef(0);
  const stepDetected = useRef(false);
  const headingRef = useRef(heading);

  useEffect(() => {
    headingRef.current = heading;
  }, [heading]);

  useEffect(() => {
    if (!active) return;

    Accelerometer.setUpdateInterval(50);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);

      // Deteksi langkah: naik lalu turun melewati threshold
      if (magnitude > STEP_THRESHOLD && !stepDetected.current) {
        stepDetected.current = true;
        const rad = (headingRef.current * Math.PI) / 180;
        setPosition((prev) => ({
          x: prev.x + STEP_LENGTH * Math.sin(rad),
          y: prev.y + STEP_LENGTH * Math.cos(rad),
          steps: prev.steps + 1,
        }));
      } else if (magnitude < STEP_THRESHOLD - 0.2) {
        stepDetected.current = false;
      }
      lastMagnitude.current = magnitude;
    });

    return () => sub.remove();
  }, [active]);

  const resetPosition = () => setPosition({ x: 0, y: 0, steps: 0 });

  return { position, heading, resetPosition };
}
```

---

## Phase 2b: Barometer — Ketinggian & Estimasi Lantai

Barometer mengukur tekanan udara. Perubahan tekanan ≈ perubahan ketinggian (~1 hPa per 8 meter).

### `hooks/useBarometer.ts`

```typescript
import { Barometer } from "expo-sensors";
import { useState, useEffect, useRef } from "react";

export interface BarometerData {
  pressure: number; // hPa saat ini
  altitude: number; // meter relatif dari baseline
  floor: number; // estimasi lantai (1, 2, 3, ...)
  isAvailable: boolean;
}

const FLOOR_HEIGHT = 3.5; // meter per lantai (rata-rata gedung pasar)
const BASELINE_SAMPLES = 10; // sampel untuk baseline di lantai 1

export function useBarometer(active: boolean) {
  const [data, setData] = useState<BarometerData>({
    pressure: 0,
    altitude: 0,
    floor: 1,
    isAvailable: false,
  });
  const baselinePressure = useRef<number | null>(null);
  const samples = useRef<number[]>([]);

  useEffect(() => {
    Barometer.isAvailableAsync().then((available) => {
      if (!available) {
        setData((prev) => ({ ...prev, isAvailable: false }));
        return;
      }
      setData((prev) => ({ ...prev, isAvailable: true }));
    });
  }, []);

  useEffect(() => {
    if (!active) return;

    Barometer.setUpdateInterval(500);
    const sub = Barometer.addListener(({ pressure }) => {
      if (!pressure) return;

      // Kumpulkan sampel awal untuk baseline lantai 1
      if (baselinePressure.current === null) {
        samples.current.push(pressure);
        if (samples.current.length >= BASELINE_SAMPLES) {
          baselinePressure.current =
            samples.current.reduce((a, b) => a + b, 0) / samples.current.length;
        }
        return;
      }

      // Rumus: altitude = 44330 × (1 - (P/P0)^0.1903)
      // Versi sederhana untuk selisih kecil: ΔAlt ≈ (P0 - P) × 8.5
      const deltaAlt = (baselinePressure.current - pressure) * 8.5;
      const floor = Math.max(1, Math.round(1 + deltaAlt / FLOOR_HEIGHT));

      setData({
        pressure,
        altitude: deltaAlt,
        floor,
        isAvailable: true,
      });
    });

    return () => sub.remove();
  }, [active]);

  const resetBaseline = () => {
    baselinePressure.current = null;
    samples.current = [];
  };

  return { ...data, resetBaseline };
}
```

### `utils/floorEstimator.ts`

```typescript
// Konversi tekanan udara → ketinggian absolut dan estimasi lantai

export function pressureToAltitude(pressure: number, baselinePressure: number): number {
  return (baselinePressure - pressure) * 8.5; // meter
}

export function altitudeToFloor(altitudeMeters: number, floorHeightM = 3.5): number {
  return Math.max(1, Math.round(1 + altitudeMeters / floorHeightM));
}

// Rata-rata bergerak untuk haluskan noise barometer
export function movingAverage(readings: number[], windowSize = 5): number {
  const slice = readings.slice(-windowSize);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}
```

### `components/ui/AltitudeBar.tsx`

```typescript
import React from "react";
import { View, Text } from "react-native";

interface Props {
  altitude: number;   // meter dari baseline
  floor: number;      // estimasi lantai
  isAvailable: boolean;
}

export function AltitudeBar({ altitude, floor, isAvailable }: Props) {
  if (!isAvailable) return null;

  return (
    <View className="flex-row items-center bg-slate-800 rounded-xl px-4 py-2 gap-3">
      <Text className="text-white text-xs">🌡️ Ketinggian</Text>
      <Text className="text-blue-400 text-sm font-bold">
        {altitude >= 0 ? "+" : ""}{altitude.toFixed(1)} m
      </Text>
      <View className="h-4 w-px bg-slate-600" />
      <Text className="text-white text-xs">Lantai</Text>
      <Text className="text-green-400 text-sm font-bold">{floor}</Text>
    </View>
  );
}
```

---

## Phase 3: Upload & Tampilkan Map 2D

### `utils/coordConverter.ts`

```typescript
// Konversi posisi PDR (meter) → koordinat pixel di atas gambar denah

export interface MapConfig {
  imageWidth: number; // pixel lebar gambar
  imageHeight: number; // pixel tinggi gambar
  scaleX: number; // meter per pixel (horizontal)
  scaleY: number; // meter per pixel (vertikal)
  originX: number; // pixel posisi titik awal (pintu masuk) di gambar
  originY: number; // pixel posisi titik awal di gambar
}

export function metersToPixels(
  posX: number,
  posY: number,
  config: MapConfig,
): { px: number; py: number } {
  return {
    px: config.originX + posX / config.scaleX,
    py: config.originY - posY / config.scaleY, // Y terbalik di layar
  };
}
```

### `components/MapOverlay.tsx`

```typescript
import React, { useState } from 'react';
import {
  View, Image, TouchableOpacity, Text, StyleSheet,
  Dimensions, PanResponder, Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Position } from '../hooks/usePDR';
import { MapConfig, metersToPixels } from '../utils/coordConverter';

interface Props {
  position: Position;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export function MapOverlay({ position }: Props) {
  const [mapUri, setMapUri] = useState<string | null>(null);
  const [mapConfig, setMapConfig] = useState<MapConfig>({
    imageWidth: 800,
    imageHeight: 600,
    scaleX: 0.05,  // 1 pixel = 0.05 meter (20px per meter)
    scaleY: 0.05,
    originX: 100,  // titik awal di gambar (bisa diset manual)
    originY: 500,
  });
  const [settingOrigin, setSettingOrigin] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      setMapUri(result.assets[0].uri);
      Alert.alert(
        'Set Titik Awal',
        'Tap pada gambar denah untuk menandai posisi pintu masuk (titik awal kamu)',
        [{ text: 'OK', onPress: () => setSettingOrigin(true) }]
      );
    }
  };

  const handleMapTap = (evt: any) => {
    if (!settingOrigin) return;
    const { locationX, locationY } = evt.nativeEvent;
    // Konversi koordinat tap ke koordinat gambar asli
    const scaleRatio = mapConfig.imageWidth / SCREEN_WIDTH;
    setMapConfig(prev => ({
      ...prev,
      originX: locationX * scaleRatio,
      originY: locationY * scaleRatio,
    }));
    setSettingOrigin(false);
    Alert.alert('✅ Titik awal disimpan!', 'Posisi pintu masuk sudah ditandai.');
  };

  const dotPosition = metersToPixels(position.x, position.y, mapConfig);
  const displayScale = SCREEN_WIDTH / mapConfig.imageWidth;

  return (
    <View style={styles.container}>
      {!mapUri ? (
        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          <Text style={styles.uploadIcon}>🗺️</Text>
          <Text style={styles.uploadText}>Upload Denah Pasar</Text>
          <Text style={styles.uploadSubtext}>Tap untuk pilih gambar dari galeri</Text>
        </TouchableOpacity>
      ) : (
        <View>
          <TouchableOpacity activeOpacity={1} onPress={handleMapTap}>
            <View style={styles.mapContainer}>
              <Image
                source={{ uri: mapUri }}
                style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.75 }}
                resizeMode="contain"
              />
              {/* Dot posisi user */}
              <View
                style={[
                  styles.userDot,
                  {
                    left: dotPosition.px * displayScale - 10,
                    top: dotPosition.py * displayScale - 10,
                  },
                ]}
              />
            </View>
          </TouchableOpacity>

          {settingOrigin && (
            <View style={styles.banner}>
              <Text style={styles.bannerText}>👆 Tap pada denah untuk set posisi pintu masuk</Text>
            </View>
          )}

          <View style={styles.infoBar}>
            <Text style={styles.infoText}>👟 {position.steps} langkah</Text>
            <Text style={styles.infoText}>
              📍 X: {position.x.toFixed(1)}m, Y: {position.y.toFixed(1)}m
            </Text>
            <TouchableOpacity onPress={pickImage}>
              <Text style={styles.changeMap}>Ganti Denah</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  uploadButton: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    margin: 24, borderRadius: 16, borderWidth: 2,
    borderColor: '#cbd5e1', borderStyle: 'dashed', padding: 48,
    backgroundColor: '#fff',
  },
  uploadIcon: { fontSize: 48, marginBottom: 12 },
  uploadText: { fontSize: 18, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
  uploadSubtext: { fontSize: 13, color: '#94a3b8' },
  mapContainer: { position: 'relative' },
  userDot: {
    position: 'absolute', width: 20, height: 20,
    borderRadius: 10, backgroundColor: '#2563eb',
    borderWidth: 3, borderColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4,
  },
  banner: { backgroundColor: '#fef3c7', padding: 12, alignItems: 'center' },
  bannerText: { color: '#92400e', fontWeight: '500' },
  infoBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 12, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#e2e8f0',
  },
  infoText: { fontSize: 12, color: '#475569' },
  changeMap: { fontSize: 12, color: '#2563eb', fontWeight: '600' },
});
```

---

## Phase 4: Shared State (Zustand Store)

Karena posisi, GPS, dan denah dipakai di semua tab — gunakan Zustand store.

```bash
npm install zustand
```

### `store/mapStore.ts`

```typescript
import { create } from "zustand";

interface MapStore {
  // GPS
  originLat: number | null;
  originLng: number | null;
  gpsReady: boolean;
  setOrigin: (lat: number, lng: number) => void;

  // PDR Position
  posX: number;
  posY: number;
  steps: number;
  updatePosition: (x: number, y: number, steps: number) => void;
  resetPosition: () => void;

  // Barometer / Altitude
  altitude: number; // meter dari baseline lantai 1
  floor: number; // estimasi lantai saat ini
  setAltitude: (alt: number, floor: number) => void;

  // Map Config
  mapUri: string | null;
  mapOriginX: number;
  mapOriginY: number;
  scaleX: number;
  scaleY: number;
  setMapUri: (uri: string) => void;
  setMapOrigin: (x: number, y: number) => void;
  setScale: (sx: number, sy: number) => void;

  // Map Mode — 2D atau 3D
  mapMode: "2d" | "3d";
  setMapMode: (mode: "2d" | "3d") => void;

  // Tracking
  isTracking: boolean;
  setTracking: (v: boolean) => void;

  // Calibration
  calibrated: boolean;
  setCalibrated: (v: boolean) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  originLat: null,
  originLng: null,
  gpsReady: false,
  setOrigin: (lat, lng) => set({ originLat: lat, originLng: lng, gpsReady: true }),

  posX: 0,
  posY: 0,
  steps: 0,
  updatePosition: (x, y, steps) => set({ posX: x, posY: y, steps }),
  resetPosition: () => set({ posX: 0, posY: 0, steps: 0, gpsReady: false }),

  altitude: 0,
  floor: 1,
  setAltitude: (altitude, floor) => set({ altitude, floor }),

  mapUri: null,
  mapOriginX: 100,
  mapOriginY: 500,
  scaleX: 0.05,
  scaleY: 0.05,
  setMapUri: (uri) => set({ mapUri: uri }),
  setMapOrigin: (x, y) => set({ mapOriginX: x, mapOriginY: y }),
  setScale: (sx, sy) => set({ scaleX: sx, scaleY: sy }),

  mapMode: "2d",
  setMapMode: (mapMode) => set({ mapMode }),

  isTracking: false,
  setTracking: (v) => set({ isTracking: v }),

  calibrated: false,
  setCalibrated: (v) => set({ calibrated: v }),
}));
```

---

## Phase 5: Tampilan 3D — expo-three + Three.js

Denah 2D yang diupload diproyeksikan ke scene 3D: lantai jadi plane horizontal, dinding jadi box-box yang berdiri, dan dot user bergerak di atas lantai 3D.

### Konsep proyeksi 2D → 3D

```
Denah 2D (gambar PNG/JPG)
        │
        ▼  texture pada PlaneGeometry (lantai)
┌──────────────────────────┐
│  Three.js Scene          │
│  - PlaneGeometry (lantai)│  ← texture = gambar denah
│  - BoxGeometry (dinding) │  ← dideteksi dari pixel gelap di denah
│  - SphereGeometry (user) │  ← posisi dari PDR store
│  - AmbientLight          │
│  - DirectionalLight      │
│  - PerspectiveCamera     │  ← bisa diputar/zoom dengan gesture
└──────────────────────────┘
```

### Install

```bash
npm install expo-three three
npm install @types/three
npm install expo-gl              # GL context untuk Expo
npx expo install expo-gl
```

### `components/map/Map3DView.tsx`

```typescript
import React, { useRef, useEffect } from "react";
import { View, PanResponder, Dimensions } from "react-native";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";

interface Props {
  mapUri: string | null;
  posX: number;  // meter
  posY: number;
  altitude: number; // meter dari barometer
}

const { width: W, height: H } = Dimensions.get("window");

export function Map3DView({ mapUri, posX, posY, altitude }: Props) {
  const rendererRef = useRef<Renderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const userDotRef = useRef<THREE.Mesh | null>(null);
  const animFrameRef = useRef<number>(0);

  // Camera orbit state
  const camTheta = useRef(Math.PI / 4);  // rotasi horizontal
  const camPhi = useRef(Math.PI / 3);    // elevasi
  const camRadius = useRef(15);
  const lastTouch = useRef<{ x: number; y: number } | null>(null);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      lastTouch.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
    },
    onPanResponderMove: (e) => {
      if (!lastTouch.current) return;
      const dx = e.nativeEvent.pageX - lastTouch.current.x;
      const dy = e.nativeEvent.pageY - lastTouch.current.y;
      camTheta.current -= dx * 0.005;
      camPhi.current = Math.max(0.2, Math.min(Math.PI / 2, camPhi.current - dy * 0.005));
      lastTouch.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
    },
  });

  const onContextCreate = async (gl: any) => {
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setClearColor(0x1e293b);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, W / (H * 0.6), 0.1, 1000);
    cameraRef.current = camera;

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Lantai — texture dari gambar denah
    if (mapUri) {
      const texture = await new THREE.TextureLoader().loadAsync(mapUri);
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.MeshLambertMaterial({ map: texture, side: THREE.DoubleSide })
      );
      floor.rotation.x = -Math.PI / 2;
      scene.add(floor);

      // Grid dinding sederhana di tepi denah
      const wallMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.4 });
      const wallH = 3;
      const wallThickness = 0.2;
      const wallDefs = [
        { pos: [0, wallH / 2, -10] as [number, number, number], size: [20, wallH, wallThickness] as [number, number, number] },
        { pos: [0, wallH / 2, 10] as [number, number, number],  size: [20, wallH, wallThickness] as [number, number, number] },
        { pos: [-10, wallH / 2, 0] as [number, number, number], size: [wallThickness, wallH, 20] as [number, number, number] },
        { pos: [10, wallH / 2, 0] as [number, number, number],  size: [wallThickness, wallH, 20] as [number, number, number] },
      ];
      wallDefs.forEach(({ pos, size }) => {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(...size), wallMat);
        wall.position.set(...pos);
        scene.add(wall);
      });
    }

    // User dot (sphere biru berpendar)
    const userDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x3b82f6 })
    );
    scene.add(userDot);
    userDotRef.current = userDot;

    // Render loop
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      // Update posisi user dot
      if (userDotRef.current) {
        userDotRef.current.position.set(posX * 2, 0.3 + altitude * 0.1, -posY * 2);
      }

      // Update kamera orbit
      if (cameraRef.current) {
        const r = camRadius.current;
        cameraRef.current.position.set(
          r * Math.sin(camPhi.current) * Math.sin(camTheta.current),
          r * Math.cos(camPhi.current),
          r * Math.sin(camPhi.current) * Math.cos(camTheta.current)
        );
        cameraRef.current.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    animate();
  };

  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  // Update dot posisi realtime tanpa recreate scene
  useEffect(() => {
    if (userDotRef.current) {
      userDotRef.current.position.set(posX * 2, 0.3 + altitude * 0.1, -posY * 2);
    }
  }, [posX, posY, altitude]);

  return (
    <View className="flex-1" {...panResponder.panHandlers}>
      <GLView
        style={{ width: W, height: H * 0.6 }}
        onContextCreate={onContextCreate}
      />
    </View>
  );
}
```

### `components/map/MapModeToggle.tsx`

Toggle 2D ↔ 3D di header tab Peta.

```typescript
import React from "react";
import { View, TouchableOpacity, Text } from "react-native";

interface Props {
  mode: "2d" | "3d";
  onChange: (mode: "2d" | "3d") => void;
}

export function MapModeToggle({ mode, onChange }: Props) {
  return (
    <View className="flex-row bg-slate-100 rounded-xl p-1">
      {(["2d", "3d"] as const).map((m) => (
        <TouchableOpacity
          key={m}
          onPress={() => onChange(m)}
          className={`px-4 py-1.5 rounded-lg ${mode === m ? "bg-blue-600" : ""}`}
        >
          <Text className={`font-semibold text-sm ${mode === m ? "text-white" : "text-slate-500"}`}>
            {m.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
```

### `app/(tabs)/map.tsx` — dengan toggle 2D/3D

```typescript
import React from "react";
import { View } from "react-native";
import { useMapStore } from "../../store/mapStore";
import { MapOverlay } from "../../components/map/MapOverlay";
import { Map3DView } from "../../components/map/Map3DView";
import { MapModeToggle } from "../../components/map/MapModeToggle";
import { AltitudeBar } from "../../components/ui/AltitudeBar";
import { Header } from "../../components/ui/Header";
import { useBarometer } from "../../hooks/useBarometer";

export default function MapTab() {
  const { posX, posY, steps, mapUri, mapMode, setMapMode } = useMapStore();
  const barometer = useBarometer(true);

  return (
    <View className="flex-1 bg-slate-50">
      <Header
        title="Peta Pasar"
        rightAction={
          <MapModeToggle mode={mapMode} onChange={setMapMode} />
        }
      />

      <View className="px-4 py-2">
        <AltitudeBar
          altitude={barometer.altitude}
          floor={barometer.floor}
          isAvailable={barometer.isAvailable}
        />
      </View>

      {mapMode === "2d" ? (
        <MapOverlay position={{ x: posX, y: posY, steps }} />
      ) : (
        <Map3DView
          mapUri={mapUri}
          posX={posX}
          posY={posY}
          altitude={barometer.altitude}
        />
      )}
    </View>
  );
}
```

---

## Setup `app.json` — Izin Sensor & Lokasi

```json
{
  "expo": {
    "name": "PetaPasar",
    "slug": "peta-pasar",
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Izin lokasi dibutuhkan untuk menentukan posisi awal di pasar."
        }
      ],
      [
        "expo-sensors",
        {
          "motionPermission": "Sensor gerak digunakan untuk tracking langkah dan orientasi di dalam pasar."
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSMotionUsageDescription": "Sensor gerak digunakan untuk tracking langkah kamu di dalam pasar.",
        "NSLocationWhenInUseUsageDescription": "Lokasi GPS digunakan untuk menentukan titik awal navigasi."
      }
    },
    "android": {
      "permissions": ["ACCESS_FINE_LOCATION", "ACTIVITY_RECOGNITION", "BODY_SENSORS"]
    }
  }
}
```

> **Catatan Barometer:** Barometer adalah sensor pasif — tidak butuh izin khusus di iOS/Android. Tersedia di sebagian besar HP modern. Cek ketersediaan dengan `Barometer.isAvailableAsync()` sebelum digunakan.

---

## Cara Run

```bash
# Development
npx expo start

# Scan QR Expo Go di HP (bukan QR anchor — ini QR dari terminal Expo)
# Pastikan HP dan laptop di WiFi yang sama
```

---

## Kalibrasi & Tips

### Set skala denah yang akurat:

Di tab Pengaturan → Kalibrasi Skala:

- Ukur jarak nyata di pasar (misal: lebar los = 3 meter)
- Ukur berapa pixel jarak yang sama di gambar denah
- `scaleX = 3 / jumlahPixel`
- Gunakan slider di Settings untuk fine-tune

### Kalibrasi panjang langkah:

- Default 0.75m per langkah (rata-rata orang dewasa)
- Bisa diubah di Settings → Sensor → slider Panjang Langkah
- Test: jalan 10 langkah nyata, ukur apakah 10 × nilai slider ≈ jarak sebenarnya

### Kompas di dalam ruangan:

- Jauhkan HP dari logam besar saat pertama kali buka app
- Minta user putar HP membentuk angka 8 di udara untuk kalibrasi magnetometer
- Tampilkan instruksi ini di layar Navigate sebelum tracking dimulai

### Mengurangi drift tanpa infrastruktur tambahan:

- Minta user tap manual posisi mereka di peta jika merasa sudah melenceng
- Fitur "tap tahan → set posisi manual" di Tab Peta sudah cukup untuk drift kecil

---

## Roadmap Pengembangan

1. **Direktori kios dari admin** — form tambah/edit kios di tab Settings
2. **Multi-lantai** — toggle pilih lantai, tiap lantai punya denah sendiri
3. **Highlight kios dari direktori** — tap kios di Tab 3 → dot merah muncul di peta
4. **Export posisi** — simpan riwayat jalur user sebagai gambar
5. **Backend sync** — upload denah dan data kios dari web admin panel
