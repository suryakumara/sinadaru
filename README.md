# Navigasi Pasar

Aplikasi navigasi indoor untuk pasar tradisional menggunakan GPS, PDR (Pedestrian Dead Reckoning), kompas, dan barometer — tanpa infrastruktur beacon eksternal.

## Fitur Utama

- Kalibrasi sensor otomatis (GPS, kompas, akselerometer, barometer)
- Tracking posisi indoor dengan PDR (step detection + heading)
- Tampilan peta 2D dan proyeksi 3D (Three.js)
- Direktori kios dengan pencarian dan filter kategori
- Estimasi lantai menggunakan barometer
- Backend REST API dengan Express + Prisma + MySQL

---

## Struktur Proyek

```
navigasi-pasar/
├── app/        # React Native (Expo) — aplikasi mobile
└── server/     # Express.js — REST API backend
```

---

## Quick Start

Setelah setup selesai (lihat bagian di bawah), jalankan dengan dua perintah ini:

```bash
# Terminal 1 — jalankan backend
cd server && npm run dev

# Terminal 2 — jalankan aplikasi mobile
cd app && npx expo start
```

Scan QR code di terminal dengan aplikasi **Expo Go** di HP.

---

## Prasyarat

Pastikan sudah terinstall:

| Tool        | Versi minimum | Cek                                       |
| ----------- | ------------- | ----------------------------------------- |
| Node.js     | 18.x          | `node -v`                                 |
| npm         | 9.x           | `npm -v`                                  |
| MySQL       | 8.x           | `mysql --version`                         |
| Expo CLI    | latest        | `npx expo --version`                      |
| Expo Go app | latest        | Install di HP dari App Store / Play Store |

---

## Setup Backend (server/)

### 1. Masuk ke folder server

```bash
cd server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Buat file environment

```bash
cp .env.example .env
```

Edit `.env` sesuaikan dengan konfigurasi MySQL kamu:

```env
DATABASE_URL="mysql://root:PASSWORD@127.0.0.1:3306/navigasi_pasar"
PORT=5001
FRONTEND_URL=http://localhost:5173
JWT_ACCESS_SECRET=ganti_ini_dengan_string_acak
JWT_REFRESH_SECRET=ganti_ini_dengan_string_acak_berbeda
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf
```

### 4. Buat database MySQL

```sql
CREATE DATABASE navigasi_pasar;
```

### 5. Jalankan migrasi Prisma

```bash
npm run db:migrate
```

### 6. Generate Prisma client

```bash
npm run db:generate
```

### 7. Jalankan server development

```bash
npm run dev
```

Server berjalan di: `http://localhost:5001`

Health check: `GET http://localhost:5001/health`

---

## Setup Aplikasi Mobile (app/)

### 1. Masuk ke folder app

```bash
cd app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Buat file environment

```bash
cp .env.example .env
```

Edit `.env` dan isi dengan IP lokal komputer kamu (bukan `localhost`):

```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:5001
```

> **Cara cari IP lokal:**
>
> - **Mac/Linux:** `ifconfig | grep "inet "`
> - **Windows:** `ipconfig` lalu lihat "IPv4 Address"
>
> HP dan komputer harus terhubung ke **WiFi yang sama**.

### 4. Jalankan aplikasi

```bash
npm start
```

Kemudian scan QR code dengan aplikasi **Expo Go** di HP.

---

## Scripts yang Tersedia

### Backend (`server/`)

| Script          | Perintah              | Fungsi                                       |
| --------------- | --------------------- | -------------------------------------------- |
| Development     | `npm run dev`         | Jalankan server dengan auto-reload (nodemon) |
| Build           | `npm run build`       | Compile TypeScript ke JavaScript             |
| Production      | `npm start`           | Jalankan hasil build (`dist/server.js`)      |
| Migrasi DB      | `npm run db:migrate`  | Jalankan Prisma migration                    |
| Generate client | `npm run db:generate` | Generate Prisma client                       |
| Prisma Studio   | `npm run db:studio`   | Buka UI database browser                     |

### Mobile App (`app/`)

| Script  | Perintah          | Fungsi                              |
| ------- | ----------------- | ----------------------------------- |
| Start   | `npm start`       | Mulai Expo dev server               |
| Android | `npm run android` | Jalankan di Android emulator/device |
| iOS     | `npm run ios`     | Jalankan di iOS simulator/device    |
| Web     | `npm run web`     | Jalankan di browser                 |

---

## API Endpoints

Base URL: `http://localhost:5001`

### Pasar

| Method | Endpoint          | Fungsi             |
| ------ | ----------------- | ------------------ |
| GET    | `/api/pasars`     | Daftar semua pasar |
| GET    | `/api/pasars/:id` | Detail pasar       |
| POST   | `/api/pasars`     | Tambah pasar baru  |
| PATCH  | `/api/pasars/:id` | Update pasar       |
| DELETE | `/api/pasars/:id` | Hapus pasar        |

### Kios

| Method | Endpoint        | Fungsi                                                |
| ------ | --------------- | ----------------------------------------------------- |
| GET    | `/api/kios`     | Daftar kios (filter: `pasarId`, `kategori`, `search`) |
| GET    | `/api/kios/:id` | Detail kios                                           |
| POST   | `/api/kios`     | Tambah kios baru                                      |
| PATCH  | `/api/kios/:id` | Update kios                                           |
| DELETE | `/api/kios/:id` | Hapus kios                                            |

**Contoh filter:**

```
GET /api/kios?pasarId=xxx&kategori=SAYUR&search=tomat
```

**Kategori yang tersedia:** `SAYUR` `DAGING` `IKAN` `BUMBU` `LAINNYA`

---

## Stack Teknologi

### Mobile (app/)

| Library               | Kegunaan                                |
| --------------------- | --------------------------------------- |
| Expo + expo-router    | Framework + file-based routing          |
| React Native          | UI mobile cross-platform                |
| NativeWind            | Tailwind CSS untuk React Native         |
| react-native-paper    | Material Design components (dark theme) |
| Zustand               | State management global                 |
| TanStack Query        | Data fetching + caching                 |
| React Hook Form + Zod | Form handling + validasi                |
| expo-sensors          | Akselerometer, magnetometer, barometer  |
| expo-location         | GPS lock posisi awal                    |
| expo-three + Three.js | Rendering 3D floor plan                 |
| expo-secure-store     | Penyimpanan data sensitif               |

### Backend (server/)

| Library       | Kegunaan              |
| ------------- | --------------------- |
| Express.js v5 | REST API framework    |
| Prisma v6     | ORM database          |
| MySQL         | Database              |
| Zod           | Validasi request body |
| JWT           | Autentikasi token     |
| CORS          | Cross-origin request  |

---

## Cara Penggunaan Aplikasi

1. **Kalibrasi** — Saat pertama buka, aplikasi akan menjalankan kalibrasi sensor selama 30 detik. Ikuti petunjuk di layar.
2. **Tab Peta** — Lihat denah pasar dalam mode 2D atau 3D. Upload denah dari tab Pengaturan.
3. **Tab Navigasi** — Kunci posisi GPS di pintu masuk, lalu tekan **Mulai Tracking** untuk memulai navigasi indoor.
4. **Tab Kios** — Cari dan filter kios. Tap "Lihat Peta" untuk highlight posisi kios di peta.
5. **Tab Pengaturan** — Upload denah baru, tambah kios, dan atur kalibrasi sensor.

---

## Troubleshooting

**HP tidak bisa connect ke server:**

- Pastikan HP dan komputer di WiFi yang sama
- Cek IP di `.env` sudah benar (bukan `localhost`)
- Pastikan server sudah berjalan (`npm run dev`)
- Cek firewall tidak memblokir port 5001

**Sensor tidak terdeteksi:**

- Pastikan izin sensor sudah diberikan di pengaturan HP
- Coba kalibrasi ulang dari tab Pengaturan → Kalibrasi Ulang Sensor
- Barometer tidak tersedia di semua HP (fitur lantai akan dinonaktifkan otomatis)

**Error `prisma generate`:**

```bash
npx prisma generate
```

**Reset kalibrasi (jika aplikasi stuck):**

- Tab Pengaturan → Kalibrasi Ulang Sensor → Reset

---

## Lisensi

MIT License — bebas digunakan untuk keperluan akademik dan komersial.
