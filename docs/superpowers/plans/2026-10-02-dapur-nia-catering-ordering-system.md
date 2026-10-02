# Dapur Nia Catering Ordering Web App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun aplikasi web pemesanan katering Dapur Nia (*mobile-first*) berbasis React + TypeScript + Tailwind CSS + shadcn/ui dengan penegakan 3 Aturan Mutlak, Clean Architecture (Mock & Firebase Adapters), UI aksesibel ramah lansia, dan panel staf/pemilik untuk verifikasi pembayaran serta laporan harian.

**Architecture:** Menggunakan Modular Clean Architecture dengan pemisahan Domain Layer (murni TypeScript untuk 3 Aturan Mutlak), Service Repository Abstraction (`IOrderRepository`, `IMenuRepository`, dsb.), In-Memory Mock Adapter untuk TDD instan, dan Firebase Adapter untuk integrasi produksi.

**Tech Stack:** React 18 / 19, Vite, TypeScript, Tailwind CSS, shadcn/ui, Lucide React, Vitest, React Testing Library, Firebase SDK v10+.

**Spec:** [docs/superpowers/specs/2026-10-02-dapur-nia-catering-ordering-system-design.md](file:///d:/MaSelf/Bootcamp%20Plan%20Indo/DapurNia/docs/superpowers/specs/2026-10-02-dapur-nia-catering-ordering-system-design.md)

## Global Constraints

- **Total Tagihan $\ge 0$:** Formula tagihan `subtotalMenu + deliveryFee - discount` dengan `deliveryFee` flat Rp10.000.
- **Sisa Porsi $\ge 0$:** Transaksi atomik anti-rebutan porsi; stok tidak boleh menjadi negatif.
- **Transisi Status Linear:** `WAITING_PAYMENT` $\rightarrow$ `PROCESSING` $\rightarrow$ `SHIPPED` $\rightarrow$ `COMPLETED` (atau `CANCELLED`).
- **Aksesibilitas Khusus:** Teks penting ukuran 18px–24px, target sentuh tombol minimal 48px x 48px.
- **Batas Waktu Pemesanan:** Pukul 12.00 WIB cut-off.
- **Batas File Bukti Bayar:** Maksimal 5 MB, tipe `image/*`.

## Review Focus

1. **Rebutan porsi terakhir (Race Condition):** Ketika 2 pesanan masuk serentak saat sisa porsi 1, satu pesanan berhasil dan satu ditolak ramah tanpa membuat stok $-1$.
2. **Kalkulasi diskon melebihi subtotal:** Diskon tidak boleh menghasilkan total tagihan negatif.
3. **Lompatan status ilegal:** Staf/Pengguna tidak boleh melompati urutan status ke `SHIPPED` atau `COMPLETED` dari `WAITING_PAYMENT`.
4. **Pemisahan hak akses (RBAC):** Mbak Rani (`staff`) dilarang membuka laporan keuangan, mengubah harga, atau membatalkan pesanan terkonfirmasi.
5. **Akurasi 2 Laporan Harian:** Laporan porsi terjual dan kas masuk mengabaikan seluruh pesanan berstatus `CANCELLED`.

---

### Task 1: Inisialisasi Proyek, Konfigurasi Vitest & Tailwind shadcn/ui

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`, `index.html`
- Create: `src/main.tsx`, `src/App.tsx`, `src/index.css`
- Create: `src/test/setup.ts`, `vitest.config.ts`

**Interfaces:**
- Consumes: Node.js, npm
- Produces: Lingkungan pengembangan Vite + React + TS + Tailwind + Vitest yang siap di-run & di-test.

- [ ] **Step 1: Inisialisasi dependensi & scaffolding package.json**
  Memasang dependencies: `react`, `react-dom`, `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority`, `zod`.  
  Dev dependencies: `vite`, `typescript`, `@types/react`, `tailwindcss`, `postcss`, `autoprefixer`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`.

- [ ] **Step 2: Konfigurasi Tailwind CSS, PostCSS, dan Desain Token Aksesibilitas**
  Membuat `tailwind.config.js` dengan konfigurasi font size, border radius ramah sentuhan, dan palet warna kontras tinggi Dapur Nia.

- [ ] **Step 3: Konfigurasi Vitest (`vitest.config.ts` & `src/test/setup.ts`)**
  Mengonfigurasi environment `jsdom` dan setup matchers `@testing-library/jest-dom`.

- [ ] **Step 4: Uji coba runner test awal**
  Jalankan `npm test` untuk memastikan Vitest berjalan lancar dengan sample test.

- [ ] **Step 5: Commit**
  ```bash
  git add .
  git commit -m "chore: initialize Vite React TS project with Tailwind, shadcn setup, and Vitest"
  ```

---

### Task 2: Domain Layer, Entitas & Penegakan 3 Aturan Mutlak (TDD)

**Files:**
- Create: `src/domain/types/order.ts`, `src/domain/types/menu.ts`, `src/domain/types/customer.ts`, `src/domain/types/report.ts`
- Create: `src/domain/rules/orderRules.ts`
- Create: `src/domain/rules/stateMachine.ts`
- Create: `src/domain/validators/customerValidator.ts`
- Create: `src/domain/validators/cutoffValidator.ts`
- Test: `src/domain/rules/orderRules.test.ts`
- Test: `src/domain/rules/stateMachine.test.ts`
- Test: `src/domain/validators/validators.test.ts`

**Interfaces:**
- Produces: 
  - `calculateOrderTotal(subtotal: number, deliveryFee: number, discount: number): number`
  - `isValidStatusTransition(currentStatus: OrderStatus, nextStatus: OrderStatus, role: UserRole): boolean`
  - `normalizeWhatsApp(phone: string): string`
  - `isInsideComplex(address: string): boolean`
  - `isOrderTimeValid(date: Date, cutoffHour?: number): boolean`

- [ ] **Step 1: Tulis failing unit tests untuk 3 Aturan Mutlak & Mesin Status**
  Menguji validasi total tagihan $\ge 0$, penolakan pesanan 0 porsi, aturan transisi linear status, normalisasi WA, dan pengecekan jam 12.00.

- [ ] **Step 2: Jalankan test untuk memverifikasi kegagalan (FAIL)**
  Jalankan `npx vitest run src/domain`

- [ ] **Step 3: Implementasikan domain types, aturan mutlak & validator murni**
  Implementasikan fungsi-fungsi di `src/domain/rules/` dan `src/domain/validators/` sesuai spesifikasi PRD.

- [ ] **Step 4: Jalankan test untuk memverifikasi kelulusan (PASS)**
  Jalankan `npx vitest run src/domain` dan pastikan 100% lulus.

- [ ] **Step 5: Commit**
  ```bash
  git add src/domain/
  git commit -m "feat(domain): implement core entities, 3 absolute rules, and state machine with tests"
  ```

---

### Task 3: Abstraksi Service Layer & In-Memory Mock Adapter (TDD)

**Files:**
- Create: `src/services/IOrderRepository.ts`
- Create: `src/services/IMenuRepository.ts`
- Create: `src/services/ICustomerRepository.ts`
- Create: `src/services/IReportRepository.ts`
- Create: `src/infrastructure/mock/MockStorageAdapter.ts`
- Test: `src/infrastructure/mock/MockStorageAdapter.test.ts`

**Interfaces:**
- Consumes: Domain types & rules
- Produces: `MockStorageAdapter` yang mengimplementasikan seluruh interface repository dengan simulasi atomic transaction lock & reactive subscription.

- [ ] **Step 1: Tulis failing unit tests untuk MockStorageAdapter**
  Uji alur: place order atomic stock decrement, simulasi rebutan porsi (race condition), subscribe real-time updates, pembatalan pesanan yang mengembalikan stok, auto-fill customer, dan kalkulasi 2 laporan harian.

- [ ] **Step 2: Jalankan test untuk memverifikasi kegagalan (FAIL)**
  Jalankan `npx vitest run src/infrastructure/mock`

- [ ] **Step 3: Implementasikan MockStorageAdapter lengkap**
  Lengkapi class `MockStorageAdapter` dengan in-memory state Dapur Nia (data menu harian: Ayam Bakar Madu, Rendang Sapi, Sayur Asem, dsb.).

- [ ] **Step 4: Jalankan test untuk memverifikasi kelulusan (PASS)**
  Jalankan `npx vitest run src/infrastructure/mock`

- [ ] **Step 5: Commit**
  ```bash
  git add src/services/ src/infrastructure/
  git commit -m "feat(services): implement repository interfaces and mock storage adapter with full tests"
  ```

---

### Task 4: Sistem Komponen UI & Aksesibilitas (Touch Target & Tipografi Ramah Lansia)

**Files:**
- Create: `src/components/ui/Button.tsx`, `src/components/ui/Card.tsx`, `src/components/ui/Badge.tsx`, `src/components/ui/Dialog.tsx`, `src/components/ui/Input.tsx`, `src/components/ui/Table.tsx`
- Create: `src/components/common/Header.tsx`
- Create: `src/components/common/StatusBadge.tsx`
- Create: `src/components/common/PhotoUploader.tsx`
- Create: `src/components/common/QuantityStepper.tsx`
- Test: `src/components/common/PhotoUploader.test.tsx`
- Test: `src/components/common/StatusBadge.test.tsx`

**Interfaces:**
- Produces: Reusable UI components dengan target sentuh $\ge 48\text{px}$, teks 18px-24px, dan validasi file upload $\le 5\text{MB}$.

- [ ] **Step 1: Tulis failing tests untuk PhotoUploader & StatusBadge**
  Uji penolakan file $> 5\text{MB}$, penolakan file non-gambar, dan visualisasi status yang tepat.

- [ ] **Step 2: Jalankan test untuk verifikasi FAIL**
  Jalankan `npx vitest run src/components`

- [ ] **Step 3: Implementasikan komponen UI ramah sentuhan & aksesibel**
  Buat komponen dengan styling Tailwind CSS kontras tinggi dan ukuran teks besar.

- [ ] **Step 4: Jalankan test untuk verifikasi PASS**
  Jalankan `npx vitest run src/components`

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/
  git commit -m "feat(ui): create accessible UI components with large touch targets and photo uploader"
  ```

---

### Task 5: Modul Portal Pelanggan (Pemesanan, Upload Bukti, & Status Tracker)

**Files:**
- Create: `src/features/customer/MenuCatalog.tsx`
- Create: `src/features/customer/OrderForm.tsx`
- Create: `src/features/customer/OutsideComplexModal.tsx`
- Create: `src/features/customer/OrderSuccessPage.tsx`
- Create: `src/features/customer/OrderTrackerPage.tsx`
- Test: `src/features/customer/OrderFlow.test.tsx`

**Interfaces:**
- Consumes: `IOrderRepository`, `IMenuRepository`, `ICustomerRepository`, UI Components
- Produces: Halaman katalog menu dengan badge dinamis (Hijau, Oranye, Merah HABIS), banner penutupan jam 12.00, form auto-fill WA, dialog luar kompleks, dan live status tracker.

- [ ] **Step 1: Tulis integration test untuk alur pemesanan pelanggan**
  Uji flow dari memilih porsi, auto-fill WA, kalkulasi tagihan + ongkir Rp10.000, submit pesanan, upload bukti bayar, hingga melihat status pesanan.

- [ ] **Step 2: Jalankan test untuk verifikasi FAIL**
  Jalankan `npx vitest run src/features/customer`

- [ ] **Step 3: Implementasikan komponen fitur Portal Pelanggan**
  Susun `MenuCatalog`, `OrderForm`, `OutsideComplexModal`, dan `OrderTrackerPage`.

- [ ] **Step 4: Jalankan test untuk verifikasi PASS**
  Jalankan `npx vitest run src/features/customer`

- [ ] **Step 5: Commit**
  ```bash
  git add src/features/customer/
  git commit -m "feat(customer): implement customer menu catalog, order form with auto-fill, and tracker"
  ```

---

### Task 6: Modul Dashboard Staf Dapur (Mbak Rani - `role: 'staff'`)

**Files:**
- Create: `src/features/staff/KitchenDashboard.tsx`
- Create: `src/features/staff/PaymentVerificationModal.tsx`
- Create: `src/features/staff/OrderActionButtons.tsx`
- Test: `src/features/staff/KitchenDashboard.test.tsx`

**Interfaces:**
- Consumes: `IOrderRepository`, RBAC Rules
- Produces: Antrean pesanan dapur dengan prioritas `WAITING_PAYMENT` di atas, modal inspeksi bukti bayar, tombol Terima/Tolak, dan pembatasan akses Staf (dilarang ubah harga, dilarang batalkan pesanan diproses/dikirim, tanpa menu laporan).

- [ ] **Step 1: Tulis failing test untuk KitchenDashboard & RBAC Staf**
  Uji bahwa pesanan `WAITING_PAYMENT` tampil paling atas, staf dapat menerima/menolak bukti bayar, dan tombol aksi yang dilarang tidak dapat diakses.

- [ ] **Step 2: Jalankan test untuk verifikasi FAIL**
  Jalankan `npx vitest run src/features/staff`

- [ ] **Step 3: Implementasikan modul KitchenDashboard**
  Bangun tampilan antrean dapur yang cepat dan mudah dioperasikan di layar HP dengan satu tangan.

- [ ] **Step 4: Jalankan test untuk verifikasi PASS**
  Jalankan `npx vitest run src/features/staff`

- [ ] **Step 5: Commit**
  ```bash
  git add src/features/staff/
  git commit -m "feat(staff): implement kitchen queue, payment verification, and staff RBAC protections"
  ```

---

### Task 7: Modul Dashboard Pemilik & 2 Laporan Harian (Bu Dina - `role: 'owner'`)

**Files:**
- Create: `src/features/owner/OwnerDashboard.tsx`
- Create: `src/features/owner/MenuManager.tsx`
- Create: `src/features/owner/EmergencyCancelModal.tsx`
- Create: `src/features/owner/DailyReports.tsx`
- Test: `src/features/owner/DailyReports.test.tsx`

**Interfaces:**
- Consumes: `IOrderRepository`, `IMenuRepository`, `IReportRepository`
- Produces: Pengaturan menu harian & kuota porsi, tombol pembatalan darurat Bu Dina dengan pengembalian stok, serta Laporan 1 (Porsi Terjual) & Laporan 2 (Total Kas Masuk).

- [ ] **Step 1: Tulis failing test untuk Manajemen Menu, Pembatalan Darurat, & Laporan Harian**
  Uji perubahan harga/kuota, pembatalan pesanan darurat (stok kembali), dan kalkulasi 2 laporan harian yang mengabaikan pesanan `CANCELLED`.

- [ ] **Step 2: Jalankan test untuk verifikasi FAIL**
  Jalankan `npx vitest run src/features/owner`

- [ ] **Step 3: Implementasikan modul OwnerDashboard & DailyReports**
  Buat UI ringkas dengan angka-angka besar dan tabel belanja bahan yang mudah dibaca Bu Dina.

- [ ] **Step 4: Jalankan test untuk verifikasi PASS**
  Jalankan `npx vitest run src/features/owner`

- [ ] **Step 5: Commit**
  ```bash
  git add src/features/owner/
  git commit -m "feat(owner): implement menu quota manager, emergency cancel, and daily reports"
  ```

---

### Task 8: Integrasi Context, Navigasi Peran, & Pengujian End-to-End (E2E)

**Files:**
- Create: `src/context/ServiceContext.tsx`
- Create: `src/context/AuthContext.tsx`
- Create: `src/App.tsx`
- Test: `src/App.test.tsx`

**Interfaces:**
- Consumes: Seluruh modul fitur & context
- Produces: Single Page Application terintegrasi penuh dengan simulasi pengalihan peran (Pelanggan, Rani, Dina) dan PWA capability.

- [ ] **Step 1: Tulis E2E integration test mencakup keseluruhan alur aplikasi**
  Simulasikan flow lengkap: Pelanggan memesan $\rightarrow$ Mbak Rani konfirmasi bukti $\rightarrow$ Bu Dina tandai dikirim & selesai $\rightarrow$ Bu Dina cek laporan harian.

- [ ] **Step 2: Jalankan test untuk verifikasi FAIL**
  Jalankan `npx vitest run src/App.test.tsx`

- [ ] **Step 3: Implementasikan App Shell, Navigasi Tab / Role Switcher, & Service Provider**
  Sambungkan seluruh komponen ke dalam `App.tsx` dengan UI header ramah dan notifikasi toast.

- [ ] **Step 4: Jalankan test untuk verifikasi PASS**
  Jalankan `npm test` untuk memverifikasi seluruh test suite lulus 100%.

- [ ] **Step 5: Commit**
  ```bash
  git add src/App.tsx src/context/ src/App.test.tsx
  git commit -m "feat: assemble integrated mobile web app with role navigation and end-to-end test suite"
  ```

---

### Task 9: Penyiapan Blueprint Integrasi Firebase & Security Rules

**Files:**
- Create: `src/infrastructure/firebase/config.ts`
- Create: `src/infrastructure/firebase/FirebaseOrderAdapter.ts`
- Create: `src/infrastructure/firebase/FirebaseMenuAdapter.ts`
- Create: `src/infrastructure/firebase/FirebaseCustomerAdapter.ts`
- Create: `src/infrastructure/firebase/FirebaseReportAdapter.ts`
- Create: `firestore.rules`
- Create: `storage.rules`
- Create: `.env.example`

**Interfaces:**
- Consumes: Firebase Client SDK
- Produces: Konfigurasi adapter Firebase aktif, Firestore Security Rules (enforcement 3 aturan mutlak), dan Storage Rules yang siap dihubungkan saat file `.env` diisi oleh user.

- [ ] **Step 1: Buat `.env.example` dan helper konfigurasi `src/infrastructure/firebase/config.ts`**
  Mendefinisikan variabel lingkungan Firebase yang dibutuhkan.

- [ ] **Step 2: Tulis `firestore.rules` dan `storage.rules`**
  Menegakkan validasi `totalAmount >= 0`, `remainingStock >= 0`, status state machine guard per role, dan pembatasan upload foto $\le 5\text{MB}$.

- [ ] **Step 3: Implementasikan adapter Firebase berbasis Firestore real-time listeners**
  Membuat implementasi `FirebaseOrderAdapter`, `FirebaseMenuAdapter`, dsb. yang siap dipakai saat mode Firebase diaktifkan.

- [ ] **Step 4: Commit**
  ```bash
  git add firestore.rules storage.rules .env.example src/infrastructure/firebase/
  git commit -m "feat(firebase): prepare Firebase adapters, security rules, and env configuration"
  ```
