# DOKUMEN SPESIFIKASI TEKNIS SISTEM
# APLIKASI PEMESANAN KATERING DAPUR NIA

---

## 1. Arsitektur Sistem & Pilihan Teknologi (*Tech Stack*)

Aplikasi dirancang dengan pendekatan *serverless*, *real-time*, dan *mobile-first* guna memenuhi kebutuhan operasional Bu Dina dan Mbak Rani yang bekerja melalui ponsel di lingkungan dapur.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Mobile Browser)                       │
│  - HTML5 Semantik (Desain Mobile-First, Ramah Layar Sentuh)            │
│  - Vanilla CSS Modern (Tipografi Besar, Kontras Tinggi, Glassmorphism) │
│  - Vanilla JavaScript ES6+ (Real-time Firestore SDK & Offline Cache)   │
│  - PWA Capable (Web App Manifest untuk "Add to Home Screen")           │
└───────────────────▲────────────────────────────────▲───────────────────┘
                    │                                │
                    │ HTTPS / WebSocket              │ File Upload (<= 5MB)
                    ▼                                ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│       FIREBASE AUTHENTICATION        │  │       FIREBASE STORAGE       │
│ - Bu Dina (Custom Claim: 'owner')    │  │ - Bucket: /payment-proofs/   │
│ - Mbak Rani (Custom Claim: 'staff')  │  │ - Rules: Image only, <= 5MB   │
│ - Pelanggan: Guest / Unauthenticated │  └──────────────────────────────┘
└───────────────────▲──────────────────┘
                    │
┌───────────────────▼────────────────────────────────────────────────────┐
│                    GOOGLE CLOUD / FIREBASE BACKEND                     │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    CLOUD FIRESTORE (NoSQL DB)                    │  │
│  │  - Koleksi: customers, menus, orders, systemConfigs              │  │
│  │  - Firestore Security Rules (Validasi Mutlak di Server)          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                 CLOUD FUNCTIONS FOR FIREBASE (Node.js)           │  │
│  │  1. createOrder (Atomic Transaction: Kurangi Stok & Kunci Harga) │  │
│  │  2. onOrderCancelled (Trigger: Kembalikan Stok Porsi Otomatis)   │  │
│  │  3. autoCancelUnpaidOrders (Cron Job Pk 12.00 via CloudScheduler)│ │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Rincian Komponen Teknologi
1. **Frontend:**
   - **HTML5 & Vanilla CSS Modern:** Menyediakan antarmuka ringan dan cepat dimuat di peramban ponsel tanpa ketergantungan *framework* berat.
   - **Desain Aksesibilitas (Ukuran Tulisan & Elemen):** Menggunakan ukuran teks dasar minimal 18px–24px pada elemen utama, serta tombol sentuh dengan *touch target* minimal 48px x 48px untuk mempermudah Bu Dina.
   - **PWA (Progressive Web App):** Dilengkapi *manifest.json* agar Bu Dina dan Rani dapat memasang pintasan aplikasi langsung di layar utama (*home screen*) ponsel layaknya aplikasi instan.
2. **Backend & Basis Data:**
   - **Cloud Firestore:** Basis data dokumen NoSQL terdistribusi dengan kemampuan transaksi atomik (ACID) dan pendengar data waktu-nyata (*real-time snapshot listener*).
   - **Firebase Authentication:** Manajemen sesi untuk Bu Dina (Peran: `owner`) dan Mbak Rani (Peran: `staff`) melalui atribut kustom (*Custom Claims*). Pelanggan mengakses sistem secara langsung tanpa akun.
   - **Firebase Storage:** Media penyimpanan foto bukti transfer dengan perlindungan hak akses dan pembatasan berkas.
   - **Cloud Functions for Firebase (Node.js 20):** Menjalankan logika bisnis kritis yang membutuhkan keamanan mutlak dan independensi dari jam perangkat pengguna.
   - **Cloud Scheduler:** Layanan *cron* terkelola untuk mengeksekusi pembatalan otomatis setiap hari pukul 12.00 WIB.

---

## 2. Skema Basis Data Cloud Firestore

Struktur koleksi dirancang agar mandiri, memiliki integritas tinggi, dan mencatat riwayat (*snapshot*) saat transaksi terjadi.

```
firestore-root
 ├── customers/ {normalizedWhatsApp}
 ├── menus/ {menuId}
 ├── orders/ {orderId}
 └── systemConfigs/ operational
```

### 2.1 Koleksi: `customers`
Menyimpan data identitas pelanggan. ID dokumen menggunakan **Nomor WhatsApp yang telah dinormalisasi** (hanya angka, misal `081234567890`), sehingga menjamin keunikan nomor secara alami (1 nomor = 1 pelanggan).

| Field | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `whatsapp` | `string` | Nomor WhatsApp pelanggan (misal: `"081234567890"`). Unik. |
| `name` | `string` | Nama lengkap pelanggan (misal: `"Ibu Rina"`). |
| `address` | `string` | Alamat lengkap di dalam kompleks (misal: `"Blok B2 No. 5"`). |
| `createdAt` | `timestamp` | Waktu pertama kali memesan (waktu server). |
| `updatedAt` | `timestamp` | Waktu terakhir data pelanggan diperbarui. |

---

### 2.2 Koleksi: `menus`
Menyimpan daftar menu harian dan sisa kuota porsi.

| Field | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `name` | `string` | Nama menu katering (misal: `"Ayam Bakar Madu"`). |
| `price` | `number` (double) | Harga per porsi disimpan dalam bentuk pecahan desimal (misal: `25000.00`). |
| `remainingStock` | `number` (integer) | Sisa porsi yang tersedia hari ini (nilai $\ge 0$). |
| `initialQuota` | `number` (integer) | Kapasitas awal yang disiapkan dapur hari ini (misal: `60`). |
| `imageUrl` | `string` | Tautan foto menu di Firebase Storage (opsional). |
| `isActive` | `boolean` | Status menu aktif ditampilkan hari ini (`true`/`false`). |
| `updatedAt` | `timestamp` | Waktu perubahan terakhir data menu. |

---

### 2.3 Koleksi: `orders`
Menyimpan riwayat seluruh transaksi pemesanan katering.

| Field | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `string` | ID unik dokumen Firestore. |
| `orderNumber` | `string` | Nomor pesanan yang mudah dibaca (misal: `"DN-20261001-001"`). |
| `customerId` | `string` | Referensi ke nomor WhatsApp di koleksi `customers`. |
| `customerSnapshot` | `map` | Salinan data pelanggan saat memesan: `{ name, whatsapp, address }`. |
| `items` | `array of map` | Daftar rincian menu yang dipesan: `[{ menuId, menuName, unitPrice, quantity, subtotal }]`. |
| `subtotalMenu` | `number` (double) | Jumlah harga menu: $\sum (\text{unitPrice} \times \text{quantity})$. |
| `deliveryFee` | `number` (double) | Ongkos kirim tetap (*flat*): `10000.00`. |
| `discount` | `number` (double) | Potongan harga (nilai awal: `0.00`). Disimpan berkoma untuk antisipasi diskon persen di masa depan. |
| `totalAmount` | `number` (double) | Total tagihan akhir: $(\text{subtotalMenu} + \text{deliveryFee} - \text{discount})$. Nilai $\ge 0$. |
| `status` | `string` | Enum status: `"WAITING_PAYMENT"`, `"PROCESSING"`, `"SHIPPED"`, `"COMPLETED"`, `"CANCELLED"`. |
| `paymentProofUrl` | `string` | Tautan berkas bukti transfer di Firebase Storage (opsional di awal). |
| `orderDate` | `string` | Tanggal pemesanan format `"YYYY-MM-DD"` (mempermudah pengelompokan laporan harian). |
| `orderTime` | `timestamp` | Waktu saat data diterima di server (`serverTimestamp`). |
| `paymentConfirmedAt` | `timestamp` | Waktu bukti transfer disetujui (opsional). |
| `confirmedBy` | `string` | UID / nama staf yang mengonfirmasi (`"Dina"` atau `"Rani"`). |
| `cancellationReason` | `string` | Alasan jika pesanan dibatalkan (opsional). |
| `cancelledAt` | `timestamp` | Waktu pesanan dibatalkan (opsional). |
| `cancelledBy` | `string` | Pelaku pembatalan: `"SYSTEM"`, `"Dina"`, atau `"Rani"`. |

---

### 2.4 Koleksi: `systemConfigs` (Dokumen: `operational`)
Menyimpan konfigurasi operasional yang dapat disesuaikan tanpa perlu mengubah kode sumber.

| Field | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `cutoffHour` | `number` (int) | Jam penutupan pemesanan harian (default: `12`). |
| `cutoffMinute` | `number` (int) | Menit penutupan pemesanan harian (default: `0`). |
| `deliveryFeeFlat` | `number` (double) | Tarif ongkir tetap (default: `10000.00`). |
| `allowedComplexKeywords` | `array of string` | Kata kunci validasi alamat kompleks (misal: `["griya indah", "blok"]`). |

---

### 2.5 Indeks Komposit (*Composite Indexes*) Firestore
Diperlukan untuk mempercepat kueri antrean dapur dan laporan harian:

1. **Indeks Antrean Dapur:**
   - Koleksi: `orders`
   - Field: `orderDate` (ASC) + `status` (ASC) + `orderTime` (ASC)
   - *Tujuan:* Memastikan pesanan berstatus `WAITING_PAYMENT` muncul paling atas bagi Mbak Rani dan Bu Dina, diurutkan dari yang masuk lebih dulu.
2. **Indeks Laporan Harian:**
   - Koleksi: `orders`
   - Field: `orderDate` (ASC) + `status` (ASC) + `totalAmount` (ASC)
   - *Tujuan:* Mengambil pesanan yang sah (`PROCESSING`, `SHIPPED`, `COMPLETED`) pada tanggal tertentu untuk menghitung total porsi dan total uang masuk.

---

## 3. Penegakan Tiga Aturan Mutlak di Sisi Server (*Server-Side Enforcement*)

Klien tidak boleh dipercaya untuk menegakkan aturan bisnis kritis. Tiga aturan mutlak ditegakkan secara berlapis di tingkat basis data (Firestore Security Rules) dan logika peladen (Cloud Functions Transaction).

```
                      PERMINTAAN DARI PENGGUNA (HP)
                                   │
                                   ▼
        ┌─────────────────────────────────────────────────────┐
        │  LAPIS 1: Cloud Functions Atomic Transaction        │
        │  - Validasi jam server < 12.00                      │
        │  - Firestore runTransaction (Isolasi Stok)          │
        │  - Validasi Matematika: Total >= 0, Porsi >= 1      │
        └──────────────────────────┬──────────────────────────┘
                                   │
                                   ▼
        ┌─────────────────────────────────────────────────────┐
        │  LAPIS 2: Firestore Security Rules                  │
        │  - Validasi Skema Field & Tipe Data                 │
        │  - request.resource.data.totalAmount >= 0.0         │
        │  - request.resource.data.remainingStock >= 0        │
        │  - Mesin Status (Status State Machine Guard)        │
        └──────────────────────────┬──────────────────────────┘
                                   │
                                   ▼
                     DATA TERSIMPAN DI BASIS DATA
```

---

### 3.1 ATURAN MUTLAK 1: Total Tagihan Tidak Boleh Kurang dari Nol ($\ge 0$)

#### Potensi Penyebab Masalah:
- Kesalahan input diskon yang lebih besar daripada nilai pesanan (misal: pesanan Rp20.000 diberi potongan Rp25.000).
- Manipulasi nilai pada formulir di peramban ponsel.

#### Penegakan di Sisi Server:
1. **Aturan Keamanan Firestore (*Security Rules*):**
   Sistem menolak operasi simpan (`create` / `update`) jika nilai `totalAmount < 0` atau jika hasil penjumlahan tidak cocok:

```javascript
// firestore.rules
match /orders/{orderId} {
  allow create: if isValidOrderCreation(request.resource.data);
}

function isValidOrderCreation(order) {
  return order.totalAmount is number &&
         order.totalAmount >= 0.0 &&
         order.subtotalMenu is number &&
         order.subtotalMenu > 0.0 &&
         order.deliveryFee == 10000.0 &&
         order.discount is number &&
         order.discount >= 0.0 &&
         // Total tagihan wajib sama dengan subtotal + ongkir - diskon
         order.totalAmount == (order.subtotalMenu + order.deliveryFee - order.discount);
}
```

2. **Validasi Tambahan pada Transaksi Cloud Functions:**
   Fungsi peladen menghitung ulang nilai `subtotalMenu` dengan mengalikan jumlah porsi terhadap harga asli yang tercatat pada dokumen `menus`, bukan berdasarkan harga yang dikirim dari ponsel pelanggan.

---

### 3.2 ATURAN MUTLAK 2: Sisa Porsi Tidak Boleh Kurang dari Nol ($\ge 0$) & Solusi Rebutan Porsi Terakhir

#### Potensi Penyebab Masalah (*Race Condition*):
Ketika sisa porsi menu tinggal 1 porsi, lalu dua pelanggan (Pelanggan A dan Pelanggan B) menekan tombol pesan pada detik yang persis sama. Jika hanya diperiksa di antarmuka HP, kedua pesanan akan lolos dan stok porsi menjadi minus 1 ($1 - 2 = -1$).

#### Penegakan di Sisi Server Menggunakan *Firestore Atomic Transaction*:
Pemesanan menu dieksekusi di dalam blok **`db.runTransaction()`**. Firestore menjamin sifat *Serializability* (ACID): transaksi membaca stok terkini dari server, memverifikasi ketersediaan, dan menguranginya secara atomik. Jika ada dua transaksi yang berjalan berbarengan pada dokumen menu yang sama, Firestore secara otomatis mengantrekan salah satunya dan membatalkan transaksi yang kalah karena stok sudah berubah menjadi 0.

#### Kode Implementasi Server (Cloud Function / Node.js):

```typescript
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const placeOrder = functions.https.onCall(async (data, context) => {
  const { customer, items } = data;
  const db = admin.firestore();

  // 1. Verifikasi Batas Waktu Server (Maksimal Pukul 12.00 WIB)
  const now = new Date();
  const wibHour = (now.getUTCHours() + 7) % 24;
  if (wibHour >= 12) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Pemesanan untuk hari ini telah ditutup pukul 12.00 WIB."
    );
  }

  // 2. Jalankan Transaksi Atomik
  return await db.runTransaction(async (transaction) => {
    let subtotalMenu = 0.0;
    const orderItemsSnapshot = [];

    for (const item of items) {
      if (item.quantity < 1) {
        throw new functions.https.HttpsError("invalid-argument", "Jumlah porsi minimal 1.");
      }

      const menuRef = db.collection("menus").doc(item.menuId);
      const menuDoc = await transaction.get(menuRef);

      if (!menuDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Menu tidak ditemukan.");
      }

      const currentStock = menuDoc.data()?.remainingStock || 0;
      const unitPrice = Number(menuDoc.data()?.price || 0.0);

      // PENGECEKAN MUTLAK: Jika sisa porsi kurang dari yang diminta
      if (currentStock < item.quantity) {
        throw new functions.https.HttpsError(
          "resource-exhausted",
          `Mohon maaf, porsi untuk menu '${menuDoc.data()?.name}' baru saja habis dipesan.`
        );
      }

      // Hitung stok baru dan kurangi secara atomik
      const newStock = currentStock - item.quantity;
      transaction.update(menuRef, {
        remainingStock: newStock,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      const itemSubtotal = unitPrice * item.quantity;
      subtotalMenu += itemSubtotal;

      // Kunci data menu pada saat pemesanan (Snapshot)
      orderItemsSnapshot.push({
        menuId: item.menuId,
        menuName: menuDoc.data()?.name,
        unitPrice: unitPrice,
        quantity: item.quantity,
        subtotal: itemSubtotal
      });
    }

    const deliveryFee = 10000.0;
    const discount = 0.0;
    const totalAmount = subtotalMenu + deliveryFee - discount;

    if (totalAmount < 0.0) {
      throw new functions.https.HttpsError("invalid-argument", "Total tagihan tidak boleh minus.");
    }

    // Buat Dokumen Pesanan
    const orderRef = db.collection("orders").doc();
    const orderData = {
      id: orderRef.id,
      customerId: customer.whatsapp,
      customerSnapshot: {
        name: customer.name,
        whatsapp: customer.whatsapp,
        address: customer.address
      },
      items: orderItemsSnapshot,
      subtotalMenu: subtotalMenu,
      deliveryFee: deliveryFee,
      discount: discount,
      totalAmount: totalAmount,
      status: "WAITING_PAYMENT",
      orderDate: now.toISOString().split("T")[0],
      orderTime: admin.firestore.FieldValue.serverTimestamp()
    };

    transaction.set(orderRef, orderData);

    // Simpan / Perbarui Data Pelanggan berdasarkan No WhatsApp Unik
    const customerRef = db.collection("customers").doc(customer.whatsapp);
    transaction.set(customerRef, {
      whatsapp: customer.whatsapp,
      name: customer.name,
      address: customer.address,
      lastOrderedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return { orderId: orderRef.id, totalAmount: totalAmount };
  });
});
```

#### Pengembalian Stok Otomatis Saat Pesanan Batal (*Restitution Trigger*):
Ketika status pesanan berubah menjadi `CANCELLED` (baik karena bukti bayar ditolak, dibatalkan Bu Dina, atau batas waktu habis), *Cloud Function Trigger* secara otomatis mengembalikan jumlah porsi ke dokumen menu masing-masing:

```typescript
export const onOrderCancelled = functions.firestore
  .document("orders/{orderId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Deteksi transisi ke status CANCELLED
    if (before.status !== "CANCELLED" && after.status === "CANCELLED") {
      const db = admin.firestore();
      const batch = db.batch();

      for (const item of after.items) {
        const menuRef = db.collection("menus").doc(item.menuId);
        batch.update(menuRef, {
          remainingStock: admin.firestore.FieldValue.increment(item.quantity),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      await batch.commit();
      console.log(`Stok untuk pesanan ${context.params.orderId} berhasil dikembalikan.`);
    }
  });
```

---

### 3.3 ATURAN MUTLAK 3: Status Pesanan Tidak Boleh Melompat (*Finite State Machine*)

Status pesanan hanya boleh berpindah sesuai alur baku yang sah. Sistem server menolak segala pembaruan status yang melompati urutan.

#### Diagram Transisi Status yang Sah:

```
[ WAITING_PAYMENT ] ──(Ditolak Rani/Dina atau Cron Expired)──> [ CANCELLED ]
        │
  (Diterima Bukti Bayar)
        ▼
   [ PROCESSING ]   ──(Dibatalkan Khusus oleh Bu Dina)───────> [ CANCELLED ]
        │
  (Makanan Diantar Kurir)
        ▼
    [ SHIPPED ]     ──(Dibatalkan Khusus oleh Bu Dina)───────> [ CANCELLED ]
        │
  (Makanan Diterima Pelanggan)
        ▼
   [ COMPLETED ] (Terminal - Tidak dapat diubah lagi)
```

#### Matriks Hak Akses Perubahan Status:

| Status Awal | Status Tujuan | Diizinkan Untuk | Keterangan |
| :--- | :--- | :--- | :--- |
| `WAITING_PAYMENT` | `PROCESSING` | Dina, Rani | Bukti bayar diperiksa dan sah. |
| `WAITING_PAYMENT` | `CANCELLED` | Dina, Rani, Sistem | Bukti bayar ditolak atau kedaluwarsa. |
| `PROCESSING` | `SHIPPED` | Dina, Rani | Pesanan selesai dimasak dan dibawa kurir. |
| `PROCESSING` | `CANCELLED` | **Hanya Dina** | Pembatalan darurat dapur terkonfirmasi. |
| `SHIPPED` | `COMPLETED` | Dina, Rani | Makanan diterima pelanggan. |
| `SHIPPED` | `CANCELLED` | **Hanya Dina** | Pembatalan kendala pengantaran darurat. |
| `COMPLETED` | *Status lain apa pun* | **Ditolak Mutlak** | Status akhir (selesai). |
| `CANCELLED` | *Status lain apa pun* | **Ditolak Mutlak** | Status akhir (batal). |

#### Aturan Keamanan Firestore (*Security Rules State Machine*):

```javascript
// firestore.rules
match /orders/{orderId} {
  allow update: if request.auth != null && isValidStatusTransition(
    resource.data.status,
    request.resource.data.status,
    request.auth.token.role
  );
}

function isValidStatusTransition(oldStatus, newStatus, role) {
  return (
    // Dari Menunggu Pembayaran -> Diproses (Dina & Rani)
    (oldStatus == 'WAITING_PAYMENT' && newStatus == 'PROCESSING' && (role == 'owner' || role == 'staff')) ||

    // Dari Menunggu Pembayaran -> Dibatalkan (Dina & Rani saat tolak bukti transfer)
    (oldStatus == 'WAITING_PAYMENT' && newStatus == 'CANCELLED' && (role == 'owner' || role == 'staff')) ||

    // Dari Diproses -> Dikirim (Dina & Rani)
    (oldStatus == 'PROCESSING' && newStatus == 'SHIPPED' && (role == 'owner' || role == 'staff')) ||

    // Dari Diproses -> Dibatalkan (HANYA DINA / OWNER)
    (oldStatus == 'PROCESSING' && newStatus == 'CANCELLED' && role == 'owner') ||

    // Dari Dikirim -> Selesai (Dina & Rani)
    (oldStatus == 'SHIPPED' && newStatus == 'COMPLETED' && (role == 'owner' || role == 'staff')) ||

    // Dari Dikirim -> Dibatalkan (HANYA DINA / OWNER)
    (oldStatus == 'SHIPPED' && newStatus == 'CANCELLED' && role == 'owner')
  );
}
```

---

## 4. Penegakan Aturan Operasional Lainnya di Server

### 4.1 Pembatalan Otomatis Pesanan Tanpa Bukti Bayar (*Cloud Scheduler Cron*)
Dijalankan setiap hari tepat pukul 12.00 WIB:

```typescript
export const autoCancelUnpaidOrders = functions.pubsub
  .schedule("0 12 * * *")
  .timeZone("Asia/Jakarta")
  .onRun(async (context) => {
    const db = admin.firestore();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Ambil pesanan yang belum bayar dan sudah melewati batas waktu
    const snapshot = await db.collection("orders")
      .where("status", "==", "WAITING_PAYMENT")
      .where("orderTime", "<=", twentyFourHoursAgo)
      .get();

    if (snapshot.empty) return null;

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        status: "CANCELLED",
        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
        cancelledBy: "SYSTEM",
        cancellationReason: "Dibatalkan otomatis oleh sistem karena melewati batas waktu pembayaran pukul 12.00."
      });
    });

    await batch.commit();
    // Catatan: Trigger onOrderCancelled akan otomatis mengembalikan kuota porsinya
  });
```

### 4.2 Pembatasan File Bukti Transfer di Firebase Storage
Memastikan ukuran berkas maksimal 5 MB dan hanya format gambar:

```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /payment-proofs/{orderId}/{fileName} {
      // Pelanggan umum dapat mengunggah bukti bayar untuk pesanannya
      allow write: if request.resource.size <= 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
      // Hanya Dina dan Rani yang dapat melihat foto bukti bayar
      allow read: if request.auth != null && 
                  (request.auth.token.role == 'owner' || request.auth.token.role == 'staff');
    }
  }
}
```

---

## 5. Logika dan Kueri untuk Dua Laporan Penjualan

Sesuai kebutuhan Bu Dina, sistem hanya memproses dua laporan harian. Pesanan dengan status `CANCELLED` dikecualikan secara mutlak dari kedua laporan.

### 5.1 Laporan 1: Jumlah Porsi Terjual per Menu pada Tanggal Tertentu
Dipakai Bu Dina untuk menentukan jumlah belanja bahan masakan esok hari.

- **Kueri Firestore:**
  ```javascript
  const targetDate = "2026-10-01"; // Tanggal yang dipilih Bu Dina

  const validOrdersSnapshot = await db.collection("orders")
    .where("orderDate", "==", targetDate)
    .where("status", "in", ["PROCESSING", "SHIPPED", "COMPLETED"])
    .get();

  const portionsPerMenu = {};

  validOrdersSnapshot.docs.forEach(doc => {
    const order = doc.data();
    order.items.forEach(item => {
      if (!portionsPerMenu[item.menuName]) {
        portionsPerMenu[item.menuName] = 0;
      }
      portionsPerMenu[item.menuName] += item.quantity;
    });
  });

  // Hasil: { "Ayam Bakar Madu": 42, "Rendang Sapi": 18 }
  ```

### 5.2 Laporan 2: Total Uang Masuk pada Tanggal Tertentu
Dipakai Bu Dina untuk mengetahui jumlah kas uang riil yang masuk dari pesanan sah (termasuk ongkos kirim flat Rp10.000).

- **Kueri Firestore (Menggunakan Fitur Aggregation Firestore):**
  ```javascript
  const targetDate = "2026-10-01";

  const ordersRef = db.collection("orders")
    .where("orderDate", "==", targetDate)
    .where("status", "in", ["PROCESSING", "SHIPPED", "COMPLETED"]);

  // Menjumlahkan totalAmount secara langsung di sisi server Firestore
  const aggregationSnapshot = await ordersRef.aggregate({
    totalIncome: admin.firestore.AggregateField.sum("totalAmount"),
    totalOrders: admin.firestore.AggregateField.count()
  }).get();

  const totalUangMasuk = aggregationSnapshot.data().totalIncome;
  const jumlahPesanan = aggregationSnapshot.data().totalOrders;

  // Hasil: Rp600.000 dari 10 pesanan sah
  ```

---

## 6. Ringkasan Keselarasan Persyaratan & Solusi Teknis

| Persyaratan PRD | Solusi Teknis Sisi Server |
| :--- | :--- |
| Total tagihan tidak boleh minus | Aturan `totalAmount >= 0` pada Security Rules & validasi perkalian di Cloud Function |
| Sisa porsi tidak boleh minus saat berebut | `db.runTransaction()` menjamin pembaruan stok bersifat atomik serializable |
| Status tidak boleh melompat | Mesin status pada Firestore Security Rules yang menolak transisi non-linear |
| Pembatalan setelah konfirmasi hanya Dina | Pengecekan token klaim `request.auth.token.role == 'owner'` pada Security Rules |
| Menu habis tetap tampil bertanda habis | Dokumen menu tetap aktif di koleksi `menus` dengan `remainingStock == 0` |
| Jam tutup 12.00 dihitung dari server | Pengecekan `(now.getUTCHours() + 7) % 24 < 12` pada Cloud Function |
| Stok kembali saat dibatalkan | Firestore trigger `onOrderCancelled` otomatis melakukan *increment* kuota porsi |
| Nominal berkoma | Disimpan dengan tipe data `number` (IEEE 754 float/double) |
| Nomor WhatsApp unik sebagai teks | Disimpan sebagai string pada tipe data teks dan menjadi Document ID di `customers` |
| File bukti bayar dibatasi | Firebase Storage Rules membatasi ukuran $\le 5$ MB dan tipe `image/*` |
