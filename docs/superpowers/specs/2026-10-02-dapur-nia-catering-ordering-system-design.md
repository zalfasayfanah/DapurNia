# Desain Sistem & Spesifikasi Teknis
# Aplikasi Pemesanan Katering Dapur Nia

**Tanggal:** 2026-10-02  
**Status:** Disetujui (Approved)  
**Referensi:** PRD Dapur Nia, Minutes of Meeting Dapur Nia  

---

## 1. Ringkasan Eksekutif & Tujuan Sistem

Aplikasi Pemesanan Katering Dapur Nia adalah aplikasi web ramah ponsel (*mobile-first SPA / PWA*) yang dibangun khusus untuk melayani warga Kompleks Perumahan Griya Indah. Aplikasi ini mengotomatisasi pemesanan makan siang harian, mengendalikan kuota porsi harian (maksimal 60 porsi), menegakkan 3 Aturan Mutlak bisnis, serta memfasilitasi verifikasi pembayaran manual dan pembuatan 2 laporan harian bagi Bu Dina (Pemilik) dan Mbak Rani (Staf Dapur).

---

## 2. Tiga Aturan Mutlak Sistem (Pantangan Keras)

Sistem wajib menolak penyimpanan data jika terjadi pelanggaran terhadap ketiga aturan ini (ditegakkan di sisi klien dan sisi server):

1. **Total Tagihan Tidak Boleh Kurang dari Rp0 (`totalAmount >= 0`):**
   $$\text{totalAmount} = \max(0, \text{subtotalMenu} + \text{deliveryFee} - \text{discount})$$
   Sistem menolak pesanan jika `subtotalMenu <= 0` atau `totalAmount < 0`. Tarif ongkos kirim dipatok tetap Rp10.000.
2. **Sisa Porsi Tidak Boleh Kurang dari 0 (`remainingStock >= 0`):**
   Pengurangan porsi dilakukan secara atomik terisolasi (*atomic transaction*). Jika 2 orang berebut porsi terakhir pada milidetik yang sama, hanya 1 orang yang berhasil; pesanan lainnya ditolak sopan dan stok tetap 0 (tidak pernah menjadi $-1$).
3. **Status Pesanan Tidak Boleh Melompat (*Sequential State Machine*):**
   Urutan status pesanan adalah:
   $$\text{WAITING\_PAYMENT} \longrightarrow \text{PROCESSING} \longrightarrow \text{SHIPPED} \longrightarrow \text{COMPLETED}$$
   atau beralih ke $\text{CANCELLED}$ sesuai hak akses peran. Dilarang melompat dari `WAITING_PAYMENT` langsung ke `SHIPPED` atau `COMPLETED`.

---

## 3. Matriks Peran Pengguna & Hak Akses (RBAC)

| Hak Akses / Fitur | Pelanggan (Guest) | Staf Dapur (Rani - `staff`) | Pemilik (Dina - `owner`) |
| :--- | :---: | :---: | :---: |
| Akses tanpa Login / Sandi | ✅ (Via No. WhatsApp) | ❌ (Wajib Login) | ❌ (Wajib Login) |
| Melihat Menu & Sisa Porsi | ✅ | ✅ | ✅ |
| Membuat Pesanan & Upload Bukti Bayar | ✅ | ❌ | ❌ |
| Memeriksa Bukti Transfer Masuk | ❌ | ✅ (Prioritas Teratas) | ✅ |
| Konfirmasi Bayar (`WAITING_PAYMENT` $\rightarrow$ `PROCESSING`) | ❌ | ✅ | ✅ |
| Menolak Bukti Bayar (`WAITING_PAYMENT` $\rightarrow$ `CANCELLED`) | ❌ | ✅ | ✅ |
| Mengubah Status ke `SHIPPED` & `COMPLETED` | ❌ | ✅ | ✅ |
| Membatalkan Pesanan Terkonfirmasi (`PROCESSING` / `SHIPPED` $\rightarrow$ `CANCELLED`) | ❌ | ❌ (Dilarang Mutlak) | ✅ (Akses Darurat) |
| Mengubah Harga Menu & Kuota Harian | ❌ | ❌ (Dilarang Mutlak) | ✅ |
| Membuka Laporan Porsi & Kas Harian | ❌ | ❌ (Dilarang Mutlak) | ✅ |

---

## 4. Arsitektur Perangkat Lunak (*Clean Architecture*)

Aplikasi menggunakan stack **Vite + React + TypeScript + Tailwind CSS + shadcn/ui** dengan pembagian layer yang modular:

```
src/
├── domain/                    # Domain Layer (Murni TypeScript, Bebas Framework)
│   ├── types/                 # Interface Order, Menu, Customer, Report, Role
│   ├── rules/                 # 3 Aturan Mutlak & State Machine Guard
│   └── validators/            # Validasi form, jam server, nomor WA, alamat kompleks
├── services/                  # Service / Repository Interface (Abstraksi)
│   ├── IOrderRepository.ts
│   ├── IMenuRepository.ts
│   ├── ICustomerRepository.ts
│   └── IReportRepository.ts
├── infrastructure/            # Adapter Implementations
│   ├── mock/                  # In-Memory Reactive Adapter (TDD & Fast Local Dev)
│   │   ├── MockOrderAdapter.ts
│   │   ├── MockMenuAdapter.ts
│   │   ├── MockCustomerAdapter.ts
│   │   └── MockReportAdapter.ts
│   └── firebase/              # Firebase Client SDK Adapter
│       ├── config.ts          # Membaca .env (VITE_FIREBASE_*)
│       ├── FirebaseOrderAdapter.ts
│       ├── FirebaseMenuAdapter.ts
│       ├── FirebaseCustomerAdapter.ts
│       └── FirebaseReportAdapter.ts
├── context/                   # Service Provider & Auth Context
│   ├── ServiceContext.tsx     # Dependency Injection Switch (Mock / Firebase)
│   └── AuthContext.tsx        # Sesi Bu Dina, Mbak Rani, & Guest
├── components/                # Reusable UI Components (shadcn/ui + Accessibility)
│   ├── ui/                    # Button, Dialog, Card, Badge, Input, Table, etc.
│   └── common/                # Header, StatusBadge, OrderTimeline, PhotoUploader
├── features/                  # Modul Fitur Berdasarkan Pengguna
│   ├── customer/              # MenuCatalog, OrderForm, PaymentProofUpload, OrderTracker
│   ├── staff/                 # KitchenQueue, PaymentVerificationModal, StatusActions
│   └── owner/                 # MenuManager, EmergencyCancelModal, DailyReports
└── lib/                       # Helpers, formatters (Rupiah, Date), constants
```

---

## 5. Skema Data & Model Domain

### 5.1 `Customer`
* `whatsapp`: `string` (Normalized, misal `"081234567890"` - Primary Identifier)
* `name`: `string`
* `address`: `string` (Alamat dalam kompleks)
* `createdAt`: `string` (ISO timestamp)
* `updatedAt`: `string` (ISO timestamp)

### 5.2 `MenuItem`
* `id`: `string`
* `name`: `string`
* `price`: `number` (Float/Double, misal `25000.00`)
* `remainingStock`: `number` (Integer $\ge 0$)
* `initialQuota`: `number` (Integer, misal `60`)
* `imageUrl`?: `string`
* `isActive`: `boolean`
* `updatedAt`: `string`

### 5.3 `Order`
* `id`: `string`
* `orderNumber`: `string` (misal `"DN-20261002-001"`)
* `customerId`: `string`
* `customerSnapshot`: `Customer`
* `items`: `Array<{ menuId: string, menuName: string, unitPrice: number, quantity: number, subtotal: number }>`
* `subtotalMenu`: `number`
* `deliveryFee`: `number` (Flat `10000.00`)
* `discount`: `number` (Default `0.00`)
* `totalAmount`: `number` ($\ge 0$)
* `status`: `OrderStatus` (`"WAITING_PAYMENT"` | `"PROCESSING"` | `"SHIPPED"` | `"COMPLETED"` | `"CANCELLED"`)
* `paymentProofUrl`?: `string`
* `orderDate`: `string` (`"YYYY-MM-DD"`)
* `orderTime`: `string`
* `confirmedBy`?: `string` (`"Dina"` | `"Rani"`)
* `cancellationReason`?: `string`
* `cancelledBy`?: `string` (`"SYSTEM"` | `"Dina"` | `"Rani"`)
* `cancelledAt`?: `string`

---

## 6. Aturan Operasional Bisnis & Kasus Khusus (*Edge Cases*)

1. **Batas Waktu Pemesanan Pukul 12.00 WIB:**
   * Waktu pembuatan pesanan divalidasi berdasarkan jam server.
   * Di atas pukul 12.00 WIB, tombol pemesanan dinonaktifkan dan muncul banner ramah.
2. **Normalisasi Nomor WhatsApp:**
   * Input format `0812-3456-7890`, `+62 812...`, atau `62812...` otomatis diubah menjadi `081234567890`.
   * Input nomor WhatsApp otomatis memicu pengecekan data pelanggan lama untuk auto-fill.
3. **Penyaringan Alamat Luar Kompleks:**
   * Alamat wajib memuat kata kunci validasi (misal `"griya indah"`, `"blok"`, dsb.). Alamat luar kompleks memicu modal dialog penolakan sopan.
4. **Pengembalian Stok Otomatis Saat Batal:**
   * Setiap kali pesanan berganti status ke `CANCELLED`, seluruh item pesanan langsung dikembalikan ke `remainingStock` masing-masing menu.
5. **Penanganan Rebutan Porsi Terakhir:**
   * Transaksi atomik memastikan jika sisa porsi tinggal 1 dan dipesan bersamaan, hanya 1 transaksi yang berhasil; transaksi berikutnya ditolak dengan pesan stok habis tanpa membuat stok menjadi negatif.
6. **Laporan Penjualan Bebas Pesanan Batal:**
   * Laporan 1 (Porsi Terjual per Menu) & Laporan 2 (Total Uang Masuk) hanya menghitung pesanan dengan status `PROCESSING`, `SHIPPED`, dan `COMPLETED`.

---

## 7. Desain Antarmuka UI/UX & Aksesibilitas Khusus

* **Ukuran Font:** Teks penting (nama menu, sisa porsi, total harga, alamat, status) menggunakan ukuran 18px–24px dengan kontras tinggi.
* **Ukuran Tombol (*Touch Target*):** Tombol tindakan penting memiliki tinggi minimal 48px–56px (`h-12` hingga `h-14`) dan lebar penuh di layar ponsel.
* **Layout Responsif:** Dioptimalkan untuk peramban ponsel (*mobile web* 360px–430px) dan mendukung penambahan ke layar utama (*Add to Home Screen / PWA*).

---

## 8. Strategi Pengujian (Test-Driven Development)

Pengujian otomatis dibangun dengan **Vitest** dan **React Testing Library**:

1. **Unit Tests (Domain Rules):**
   * Validasi total tagihan $\ge 0$.
   * Validasi kuantitas minimal 1 porsi.
   * Validasi mesin status linear (mencegah lompatan status).
   * Validasi pengembalian stok saat pembatalan.
   * Validasi RBAC (hak akses staf vs pemilik).
2. **Integration Tests (Services & Repositories):**
   * Pengujian transaksi pengurangan porsi secara atomik.
   * Pengujian auto-fill data pelanggan lama.
   * Pengujian kalkulasi laporan porsi dan uang masuk harian.
3. **UI Component Tests:**
   * Render kartu menu dengan badge sisa porsi (hijau, oranye, merah habis).
   * Validasi upload file bukti bayar ($\le 5\text{MB}$, tipe `image/*`).
   * Dialog penolakan pesanan luar kompleks.

---

## 9. Integrasi Firebase & File Lingkungan (`.env`)

Saat integrasi Firebase diaktifkan, konfigurasi kredensial proyek dimasukkan ke dalam `.env`:
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Aturan keamanan server disiapkan pada:
* `firestore.rules`: Penegakan aturan mutlak di level basis data.
* `storage.rules`: Validasi tipe dan ukuran bukti transfer $\le 5\text{MB}$.
