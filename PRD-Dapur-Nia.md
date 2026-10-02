# DOKUMEN PERSYARATAN PRODUK (PRD)
# APLIKASI PEMESANAN KATERING DAPUR NIA

---

## 1. Ringkasan & Latar Belakang

### 1.1 Tentang Dapur Nia
Dapur Nia adalah usaha katering rumahan milik Bu Dina yang beroperasi khusus melayani warga di dalam satu kompleks perumahan. Dapur Nia mengutamakan pesanan menu harian makan siang dengan kuota masak harian yang terbatas (maksimal 60 porsi per hari) dan diantar langsung oleh kurir internal.

### 1.2 Masalah Nyata yang Dihadapi Saat Ini
Selama ini, seluruh pesanan dicatat secara manual melalui percakapan WhatsApp. Pola manual ini menimbulkan serangkaian masalah operasional yang merugikan:
1. **Pesanan Terlewat atau Salah Porsi:** Pesanan sering luput dicatat. Contohnya, pesanan 20 porsi hanya tercatat 12 porsi, dan baru diketahui saat makanan hendak dikirim.
2. **Kapasitas Dapur Jebol (*Overbooking*):** Sisa porsi tidak terpantau secara langsung. Sering terjadi kapasitas masak hanya 60 porsi, tetapi pesanan yang masuk mencapai 70 porsi, dan baru disadari malam hari saat rekapitulasi.
3. **Total Tagihan Minus:** Karena perhitungan manual dan salah input nominal diskon, pesanan Rp20.000 pernah dikenakan potongan Rp25.000 sehingga total tagihan menjadi minus Rp5.000.
4. **Pesanan Kosong Tetap Masuk:** Formulir pemesanan menerima pesanan dengan jumlah 0 porsi dan tetap tersimpan di daftar kerja.
5. **Laporan Keuangan Kacau:** Akibat empat masalah di atas, buku catatan penjualan harian tidak dapat digunakan sama sekali untuk mengetahui keuntungan bersih maupun belanja bahan esok hari.

### 1.3 Tujuan Aplikasi
Aplikasi Pemesanan Katering Dapur Nia dibangun sebagai aplikasi berbasis situs web ramah ponsel (*mobile browser*) untuk:
- Memastikan pelanggan memesan secara mandiri dengan kuota porsi yang terhitung otomatis dan akurat secara *real-time*.
- Mencegah pesanan 0 porsi dan mencegah total tagihan bernilai minus.
- Membantu Bu Dina (pemilik) dan Rani (staf dapur) memverifikasi pembayaran serta mengelola pesanan dengan mudah dan cepat melalui layar HP masing-masing.
- Menghasilkan dua laporan harian yang akurat: jumlah porsi terjual (untuk belanja bahan) dan total uang masuk.

---

## 2. Kebutuhan Khusus Tampilan (Desain & Aksesibilitas)

1. **Akses Lewat Layar Ponsel (*Mobile-First*):**
   - Aplikasi tidak perlu diunduh dari toko aplikasi (Play Store/App Store). Pengguna cukup membuka tautan (*link*) di peramban ponsel (Chrome, Safari, dsb.).
2. **Ukuran Huruf & Tombol Ekstra Besar:**
   - Karena Bu Dina mengalami kesulitan membaca tulisan kecil di layar HP, seluruh teks penting (nama menu, sisa porsi, total harga, alamat pelanggan, dan status pesanan) ditampilkan dengan ukuran huruf besar, tebal, dan memiliki kontras warna tinggi.
   - Tombol-tombol tindakan (seperti tombol "Pesan Sekarang", "Terima Pembayaran", "Kirim Makanan", "Selesai") berukuran besar dan mudah ditekan tanpa risiko salah pencet.
3. **Bahasa Sederhana & Ramah:**
   - Antarmuka tidak menggunakan istilah teknis bahasa Inggris yang membingungkan.
   - Notifikasi penolakan atau informasi porsi habis disajikan dengan kalimat santun dan bersahabat.

---

## 3. Peran Pengguna & Hak Akses

| Peran | Pemegang Peran | Hak Akses & Kewenangan | Batasan Akses |
| :--- | :--- | :--- | :--- |
| **Pemilik** | Bu Dina | - Mengubah harga menu harian.<br>- Mengatur kuota porsi harian.<br>- Memeriksa dan menerima/menolak bukti bayar transfer.<br>- Mengubah status pesanan ke **Diproses**, **Dikirim**, dan **Selesai**.<br>- **Membatalkan pesanan yang sudah dikonfirmasi** (jika ada kondisi darurat dapur).<br>- Membuka dua laporan harian (porsi terjual & total uang masuk). | Tidak ada batasan (akses penuh). |
| **Staf Dapur** | Mbak Rani | - Melihat daftar pesanan masuk harian (pesanan yang butuh verifikasi bukti bayar otomatis berada di urutan paling atas).<br>- Memeriksa bukti transfer, lalu mengonfirmasi (**Diproses**) atau menolak pesanan (**Dibatalkan**). | - **Dilarang** mengubah harga menu.<br>- **Dilarang** memperbarui status pesanan menjadi **Dikirim** dan **Selesai**.<br>- **Dilarang** membuka laporan keuangan/penjualan.<br>- **Dilarang** membatalkan pesanan yang sudah terkonfirmasi. |
| **Pelanggan** | Warga Kompleks | - Memesan menu harian tanpa perlu repot mendaftar akun atau mengingat kata sandi (*password*).<br>- Memilih menu dan jumlah porsi (minimal 1 porsi).<br>- Melihat rincian total tagihan secara jelas (harga menu + ongkos kirim Rp10.000).<br>- Mengunggah foto bukti transfer.<br>- Pelanggan yang pernah memesan tidak perlu mengetik ulang nama dan alamat karena sistem mengenali nomor WhatsApp pelanggan. | - Hanya dapat memesan jika beralamat di dalam kompleks perumahan.<br>- Tidak dapat memesan melebihi sisa porsi.<br>- Tidak dapat memesan setelah pukul 12.00 siang. |

---

## 4. Alur Kerja Pemesanan

Berikut alur kerja utama yang disepakati dari awal pemesanan hingga makanan sampai ke tangan pelanggan:

```
[1. Buka Menu] 
   └── Pelanggan melihat menu hari ini dan sisa porsi di HP.
[2. Pilih Porsi] 
   └── Pelanggan memilih menu dan jumlah porsi (minimal 1 porsi).
[3. Isi Data Diri] 
   └── Pelanggan memasukkan No. WhatsApp, Nama, dan Alamat Rumah (di dalam kompleks).
       *Jika nomor WA pernah memesan, nama & alamat terisi otomatis.
[4. Perhitungan Tagihan Otomatis] 
   └── Sistem menjumlahkan: Total = Harga Menu + Ongkos Kirim Rp10.000 (Flat).
[5. Transfer & Unggah Bukti] 
   └── Pelanggan transfer manual ke rekening Dapur Nia, lalu unggah foto bukti transfer.
[6. Pemeriksaan Dapur (Dina / Rani)] 
   ├── Bukti Diterima  ──> Status berubah jadi "Diproses" (dapur mulai memasak).
   └── Bukti Ditolak   ──> Status jadi "Dibatalkan" & porsi otomatis kembali ke stok.
[7. Pengantaran & Selesai] 
   ├── Kurir berangkat ──> Status diubah jadi "Dikirim".
   └── Makanan sampai  ──> Status ditandai "Selesai".
```

---

## 5. Status Pesanan & Ketentuan Perubahannya

Status pesanan berjalan secara berurutan dan **tidak boleh melompat**:

1. **Menunggu Pembayaran:** Pesanan baru dikirim oleh pelanggan. Menunggu pelanggan melakukan transfer dan mengunggah foto bukti bayar.
2. **Diproses:** Bukti transfer sudah diperiksa oleh Bu Dina atau Mbak Rani dan dinyatakan valid. Dapur mulai menyiapkan pesanan.
3. **Dikirim:** Makanan sudah selesai dimasak, dibungkus rapi, dan sedang diantar oleh kurir ke rumah pelanggan.
4. **Selesai:** Makanan telah diterima oleh pelanggan di alamat tujuan.
5. **Dibatalkan (Status Khusus/Terminal):**
   - Terjadi jika:
     a. Bukti transfer ditolak oleh Bu Dina / Mbak Rani (misal: nominal kurang, bukti palsu/buram).
     b. Pelanggan tidak mengunggah bukti bayar sampai pukul 12.00 keesokan harinya (otomatis dibatalkan oleh sistem).
     c. Pembatalan khusus atas pesanan yang sudah dikonfirmasi, **hanya boleh dilakukan oleh Bu Dina** jika terjadi kendala dapur darurat.
   - **Setiap kali pesanan dibatalkan, porsi yang dipesan langsung dikembalikan ke kuota stok menu.**

---

## 6. Skenario Pengguna (*User Stories & Kriteria Penerimaan*)

Format kriteria penerimaan menggunakan standar:
- **GIVEN (Jika diawali kondisi):** Kondisi awal sistem/pengguna.
- **WHEN (Ketika):** Tindakan yang dilakukan pengguna.
- **THEN (Maka):** Respon atau hasil yang diberikan oleh sistem.

---

### Skenario 1: Pelanggan Melihat Menu & Sisa Porsi
**Sebagai** pelanggan warga kompleks,  
**Saya ingin** melihat daftar menu makan siang beserta sisa porsi yang masih ada hari ini,  
**Agar** saya tahu menu apa saja yang tersedia sebelum memutuskan memesan.

- **Kriteria 1.1: Menu masih tersedia**
  - **GIVEN:** Waktu saat ini masih sebelum pukul 12.00 siang dan menu "Ayam Bakar Madu" memiliki sisa 15 porsi.
  - **WHEN:** Pelanggan membuka halaman utama aplikasi Dapur Nia di peramban HP.
  - **THEN:** Sistem menampilkan foto menu (jika ada), nama menu, harga per porsi dengan angka besar, sisa porsi tertulis "Sisa 15 porsi", dan tombol "Pesan" aktif berwarna jelas.

- **Kriteria 1.2: Menu habis terjual (Stok 0)**
  - **GIVEN:** Sisa porsi menu "Rendang Sapi" bernilai 0 porsi sebelum pukul 12.00.
  - **WHEN:** Pelanggan membuka halaman menu.
  - **THEN:** Menu "Rendang Sapi" tetap ditampilkan di layar, namun terdapat label merah besar bertuliskan **"HABIS"**, dan tombol pemesanan untuk menu tersebut otomatis dinonaktifkan (berwarna abu-abu dan tidak bisa ditekan).

- **Kriteria 1.3: Jam pemesanan hari ini sudah ditutup**
  - **GIVEN:** Waktu server telah melewati pukul 12.00 siang.
  - **WHEN:** Pelanggan membuka halaman menu.
  - **THEN:** Halaman tetap memperlihatkan daftar menu, namun muncul spanduk pemberitahuan besar dan ramah di bagian atas: *"Mohon maaf, pemesanan untuk hari ini sudah ditutup pukul 12.00. Dapur Nia siap melayani pesanan Anda kembali esok hari!"*, dan seluruh tombol pemesanan dinonaktifkan.

---

### Skenario 2: Pelanggan Memilih Porsi dan Mengisi Data Pemesanan
**Sebagai** pelanggan warga kompleks,  
**Saya ingin** memilih jumlah porsi dan mengisi alamat pengantaran,  
**Agar** katering saya diantarkan ke rumah dengan benar tanpa salah porsi.

- **Kriteria 2.1: Pemilihan porsi yang valid**
  - **GIVEN:** Pelanggan memilih menu "Ayam Bakar Madu" (Rp25.000/porsi, sisa 10 porsi).
  - **WHEN:** Pelanggan memilih jumlah 2 porsi, memasukkan nomor WhatsApp, nama, dan alamat rumah di dalam kompleks.
  - **THEN:** Sistem menampilkan rincian: Subtotal Makanan Rp50.000 + Ongkos Kirim Rp10.000 = **Total Tagihan Rp60.000**, serta tombol "Lanjut ke Pembayaran" menjadi aktif.

- **Kriteria 2.2: Mencegah pemesanan 0 porsi**
  - **GIVEN:** Pelanggan membuka formulir pemesanan.
  - **WHEN:** Pelanggan tidak memilih menu atau mencoba memasukkan angka 0 pada kolom porsi.
  - **THEN:** Sistem menolak memproses formulir, menampilkan pesan peringatan jelas *"Jumlah pesanan minimal 1 porsi"*, dan tombol simpan tidak dapat ditekan.

- **Kriteria 2.3: Kemudahan untuk pelanggan lama (Tanpa Akun)**
  - **GIVEN:** Ibu Rina pernah memesan kemarin menggunakan nomor WhatsApp `081234567890`.
  - **WHEN:** Hari ini Ibu Rina mengetikkan nomor WhatsApp `081234567890` di formulir.
  - **THEN:** Kolom Nama ("Ibu Rina") dan Alamat Pengiriman ("Blok B2 No. 5") otomatis terisi sendiri, sehingga Ibu Rina tidak perlu repot mengetik ulang.

---

### Skenario 3: Penolakan Pesanan dari Luar Kompleks
**Sebagai** pengelola Dapur Nia,  
**Saya ingin** sistem menolak pesanan yang ditujukan ke luar kompleks perumahan,  
**Agar** kurir tidak kesulitan mengantar dan kualitas makanan tetap terjaga hangat.

- **Kriteria 3.1: Alamat di luar jangkauan pengantaran**
  - **GIVEN:** Dapur Nia hanya melayani area "Kompleks Perumahan Griya Indah".
  - **WHEN:** Pelanggan memasukkan alamat luar kompleks (misal: "Jalan Melati No. 10, Kelurahan Sebelah").
  - **THEN:** Sistem tidak memproses pesanan dan memunculkan jendela dialog dengan pesan yang ramah:  
    *"Terima kasih atas minat Bapak/Ibu pada Dapur Nia. Mohon maaf sekali, saat ini Dapur Nia baru dapat melayani pengantaran di dalam area Kompleks Griya Indah demi menjaga ketepatan waktu dan kualitas hidangan. Kami berharap dapat segera melayani wilayah Bapak/Ibu di kesempatan mendatang."*

---

### Skenario 4: Dua Orang Memesan Porsi Terakhir Bersamaan (*Rebutan Porsi*)
**Sebagai** pemilik Dapur Nia,  
**Saya ingin** sistem mencegah sisa porsi menjadi minus saat dua orang berebut porsi terakhir,  
**Agar** dapur tidak mengalami kelebihan pesanan (*overbooking*).

- **Kriteria 4.1: Perlindungan stok porsi terakhir**
  - **GIVEN:** Sisa porsi menu "Ikan Gurame Goreng" hanya tinggal 1 porsi. Dua pelanggan (Pak Budi dan Bu Siti) membuka formulir dan sama-sama menekan tombol bayar pada detik yang sama.
  - **WHEN:** Data pesanan Pak Budi sampai di server beberapa milidetik lebih awal dibanding pesanan Bu Siti.
  - **THEN:** 
    - Pesanan Pak Budi sukses diterima sistem, dan sisa porsi menu langsung menjadi 0.
    - Pesanan Bu Siti langsung ditolak sistem dengan pesan pemberitahuan yang sopan:  
      *"Mohon maaf, porsi terakhir untuk menu ini baru saja dipesan oleh pelanggan lain beberapa saat yang lalu. Silakan memilih menu harian kami yang lain."*
    - Sisa porsi di database tetap 0, dan **tidak pernah menjadi minus 1**.

---

### Skenario 5: Pelanggan Mengunggah Bukti Pembayaran
**Sebagai** pelanggan yang telah memesan,  
**Saya ingin** mengunggah foto bukti transfer bank,  
**Agar** pesanan saya dapat segera diverifikasi dan dimasak oleh Dapur Nia.

- **Kriteria 5.1: Berhasil mengunggah bukti bayar**
  - **GIVEN:** Pesanan berstatus "Menunggu Pembayaran". Pelanggan telah mentransfer sejumlah total tagihan ke rekening Dapur Nia.
  - **WHEN:** Pelanggan memilih foto struk/tangkapan layar transfer (ukuran di bawah 5 MB) lalu menekan tombol "Kirim Bukti Pembayaran".
  - **THEN:** Foto berhasil terunggah, status pesanan tetap "Menunggu Pembayaran (Menunggu Konfirmasi Staf)", dan muncul konfirmasi: *"Terima kasih! Bukti transfer Anda sudah diterima dan sedang diperiksa oleh tim Dapur Nia."*

- **Kriteria 5.2: File foto terlalu besar**
  - **GIVEN:** Pelanggan berada di halaman unggah bukti bayar.
  - **WHEN:** Pelanggan memilih file dokumen selain gambar atau foto yang ukurannya melebihi batas (di atas 5 MB).
  - **THEN:** Sistem menolak berkas tersebut dan menampilkan pesan: *"Ukuran foto terlalu besar. Mohon gunakan foto dengan ukuran maksimal 5 MB agar dapat terkirim lancar."*

---

### Skenario 6: Rani atau Dina Memeriksa Bukti Bayar
**Sebagai** Rani (staf dapur) atau Bu Dina (pemilik),  
**Saya ingin** memeriksa foto bukti transfer dan mencocokkannya dengan mutasi rekening,  
**Agar** makanan hanya dimasak untuk pelanggan yang sudah sah membayar.

- **Kriteria 6.1: Bukti bayar disetujui**
  - **GIVEN:** Terdapat pesanan masuk dengan status "Menunggu Pembayaran". Di layar HP Rani/Dina, pesanan ini tampil di urutan paling atas dengan tanda mencolok.
  - **WHEN:** Rani membuka detail pesanan, melihat foto bukti transfer sesuai dengan total tagihan, lalu menekan tombol hijau besar **"Terima & Proses Pesanan"**.
  - **THEN:** Status pesanan langsung berubah menjadi **"Diproses"**, pesanan berpindah ke daftar masak aktif dapur, dan waktu konfirmasi tercatat.

- **Kriteria 6.2: Bukti bayar ditolak (Nominal Kurang / Tidak Sesuai)**
  - **GIVEN:** Bukti transfer yang diunggah pelanggan buram atau nominal transfernya tidak sesuai.
  - **WHEN:** Rani menekan tombol merah besar **"Tolak Pembayaran"** dan memilih/mengetik alasan penolakan (misal: "Nominal transfer kurang").
  - **THEN:** Status pesanan langsung berubah menjadi **"Dibatalkan"**, porsi menu yang sebelumnya dipesan otomatis langsung dikembalikan ke kuota stok menu hari ini, dan pesanan dikeluarkan dari antrean masak.

---

### Skenario 7: Pembaruan Status ke "Dikirim" dan "Selesai" (Hanya Bu Dina)
**Sebagai** Bu Dina (pemilik),  
**Saya ingin** mengubah status pesanan saat kurir berangkat dan saat makanan sudah diterima,  
**Agar** alur kerja dapur tertib dan pelanggan tahu perkembangan makanannya.

- **Kriteria 7.1: Makanan selesai dimasak dan dikirim**
  - **GIVEN:** Pesanan sedang dalam status "Diproses".
  - **WHEN:** Makanan telah selesai dikemas dan dibawa kurir, lalu Bu Dina menekan tombol **"Kirim Pesanan"**.
  - **THEN:** Status pesanan berubah menjadi **"Dikirim"**.

- **Kriteria 7.2: Makanan sampai di rumah pelanggan**
  - **GIVEN:** Pesanan sedang dalam status "Dikirim".
  - **WHEN:** Kurir mengabarkan bahwa pesanan telah diterima oleh pelanggan di rumahnya, lalu Bu Dina menekan tombol **"Tandai Selesai"**.
  - **THEN:** Status pesanan berubah menjadi **"Selesai"**. Pesanan ini tidak dapat diubah lagi statusnya.

- **Kriteria 7.3: Mencegah status melompat**
  - **GIVEN:** Pesanan masih dalam status "Menunggu Pembayaran".
  - **WHEN:** Bu Dina mencoba langsung menandai pesanan menjadi "Dikirim" atau "Selesai".
  - **THEN:** Sistem tidak menyediakan tombol tersebut dan menolak perubahan status secara langsung. Status harus berurutan: Menunggu Pembayaran -> Diproses -> Dikirim -> Selesai.

---

### Skenario 8: Pembatalan Khusus Setelah Konfirmasi (Hanya Bu Dina)
**Sebagai** Bu Dina (pemilik Dapur Nia),  
**Saya ingin** memiliki wewenang khusus untuk membatalkan pesanan yang sudah berstatus "Diproses" jika terjadi kondisi darurat,  
**Agar** dapur dapat mengelola situasi tak terduga (seperti bahan tumpah atau kebakaran kompor).

- **Kriteria 8.1: Bu Dina membatalkan pesanan terkonfirmasi**
  - **GIVEN:** Bu Dina membuka aplikasi dengan akun Pemilik. Ada pesanan berstatus "Diproses".
  - **WHEN:** Bu Dina memilih menu tindakan darurat "Batalkan Pesanan Dapur" dan memasukkan alasan pembatalan.
  - **THEN:** Sistem mengubah status pesanan menjadi **"Dibatalkan"**, porsi makanan yang dipesan otomatis dikembalikan ke kuota stok menu, dan uang pelanggan disiapkan untuk pengembalian manual (*refund*).

- **Kriteria 8.2: Rani tidak dapat membatalkan pesanan yang sudah dikonfirmasi**
  - **GIVEN:** Rani masuk menggunakan akun Staf Dapur.
  - **WHEN:** Rani membuka pesanan yang sudah berstatus "Diproses" atau "Dikirim".
  - **THEN:** Tombol batalkan pesanan tidak muncul di layar Rani. Tindakan pembatalan sepenuhnya terkunci bagi staf dapur.

---

### Skenario 9: Pembatalan Otomatis Pesanan Tanpa Bukti Bayar
**Sebagai** sistem Dapur Nia,  
**Saya ingin** membatalkan secara otomatis pesanan yang belum dibayar hingga batas waktu pukul 12.00 keesokan harinya,  
**Agar** porsi yang tertahan dapat dilepaskan kembali dan data pesanan bersih dari pesanan gantung.

- **Kriteria 9.1: Eksekusi otomatis batas waktu pembayaran**
  - **GIVEN:** Terdapat pesanan yang dibuat kemarin dengan status "Menunggu Pembayaran" dan pelanggan belum mengunggah bukti bayar.
  - **WHEN:** Waktu server mencapai pukul 12.00 siang keesokan harinya.
  - **THEN:** Sistem secara otomatis mengubah status pesanan tersebut menjadi **"Dibatalkan"** dengan keterangan *"Dibatalkan otomatis oleh sistem karena melewati batas waktu pembayaran"*, dan seluruh porsi pesanan tersebut langsung dikembalikan ke kuota stok menu.

---

### Skenario 10: Bu Dina Membuka Laporan Harian
**Sebagai** Bu Dina (pemilik Dapur Nia),  
**Saya ingin** melihat laporan jumlah porsi terjual dan total uang masuk pada tanggal tertentu,  
**Agar** saya tahu bahan belanjaan apa yang harus dibeli untuk esok hari dan mengetahui uang kas yang masuk.

- **Kriteria 10.1: Laporan Jumlah Porsi Terjual**
  - **GIVEN:** Bu Dina masuk dengan akun Pemilik dan memilih tanggal laporan hari ini.
  - **WHEN:** Bu Dina membuka menu "Laporan Penjualan".
  - **THEN:** Sistem menampilkan tabel ringkas berisi: Nama Menu, Total Porsi Terjual (hanya menghitung pesanan dengan status "Diproses", "Dikirim", dan "Selesai"). Pesanan dengan status "Dibatalkan" tidak ikut dihitung.

- **Kriteria 10.2: Laporan Total Uang Masuk**
  - **GIVEN:** Hari ini terdapat 10 pesanan terkonfirmasi ("Diproses", "Dikirim", "Selesai") dengan total nilai makanan Rp500.000 dan total ongkos kirim Rp100.000 (10 x Rp10.000). Ada 2 pesanan berstatus "Dibatalkan" senilai Rp120.000.
  - **WHEN:** Bu Dina melihat ringkasan "Total Uang Masuk".
  - **THEN:** Sistem menampilkan angka besar: **Rp600.000** (Total Makanan + Total Ongkos Kirim pesanan terkonfirmasi). Nilai dari 2 pesanan yang dibatalkan sama sekali tidak dimasukkan ke dalam total uang masuk.

- **Kriteria 10.3: Navigasi laporan hanya ada di akun Pemilik (Bu Dina)**
  - **GIVEN:** Rani masuk ke aplikasi dengan akun Staf Dapur.
  - **WHEN:** Rani melihat navigasi aplikasi di laman staf.
  - **THEN:** Di laman staf (Mbak Rani) tidak ada navigasi/menu "Laporan" sama sekali. Navigasi laporan hanya ada dan ditampilkan pada akun Pemilik (Bu Dina). Jika Rani mencoba membuka alamat halaman laporan secara langsung, sistem menampilkan pesan *"Akses Terbatas: Menu laporan hanya dapat dibuka oleh Pemilik (Bu Dina)"*.

---

## 7. Tiga Aturan Mutlak Sistem (Pantangan Keras)

Ketiga aturan berikut adalah aturan mutlak yang dijaga ketat oleh sistem. Sistem **wajib menolak menyimpan data** jika ada pelanggaran, bukan sekadar memunculkan tulisan peringatan di layar:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TIGA ATURAN MUTLAK                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. TOTAL TAGIHAN TIDAK BOLEH KURANG DARI RP0                                │
│    Sistem menolak menyimpan pesanan jika perhitungannya bernilai negatif.   │
│                                                                             │
│ 2. SISA PORSI TIDAK BOLEH KURANG DARI 0                                     │
│    Sistem mengunci stok saat transaksi berlangsung. Jika sisa 1 porsi       │
│    diperebutkan dua orang bersamaan, hanya 1 yang diterima, yang lain       │
│    diberitahu porsi baru saja habis. Stok tidak pernah menjadi minus.       │
│                                                                             │
│ 3. STATUS PESANAN TIDAK BOLEH MELOMPAT                                      │
│    Urutan status wajib: Menunggu Pembayaran -> Diproses -> Dikirim ->       │
│    Selesai. Tidak boleh langsung loncat ke Dikirim atau Selesai tanpa       │
│    pernah melewati verifikasi pembayaran.                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Aturan Operasional Bisnis

1. **Batas Waktu Pemesanan (Jam 12.00 Siang):**
   - Pemesanan ditutup tepat pukul 12.00 WIB setiap harinya.
   - Penentuan waktu dihitung berdasarkan **jam yang tercatat di server komputer**, bukan berdasarkan jam pada HP pelanggan.
   - Setelah jam 12.00, menu tetap dapat dilihat namun seluruh tombol pemesanan dinonaktifkan dengan tulisan "Pemesanan Hari Ini Ditutup".
2. **Ongkos Kirim Tetap (*Flat*):**
   - Ongkos kirim dipatok tetap sebesar **Rp10.000** per pesanan untuk seluruh pengantaran di dalam satu kompleks perumahan.
3. **Jumlah Porsi Minimal:**
   - Setiap pesanan wajib berisi minimal **1 porsi**. Pesanan 0 porsi tidak akan pernah diterima sistem.
4. **Pengembalian Stok Otomatis Saat Pesanan Batal:**
   - Setiap kali pesanan dibatalkan (karena bukti bayar ditolak, dibatalkan oleh Bu Dina, atau batas waktu habis), kuota sisa porsi menu yang dipesan langsung dikembalikan ke kuota stok menu secara otomatis detik itu juga.
5. **Harga Pesanan Dikunci (*Snapshot*):**
   - Harga menu yang dicatat pada pesanan adalah harga pada saat tombol pesan ditekan. Jika di kemudian hari Bu Dina menaikkan atau menurunkan harga menu di daftar menu harian, pesanan lama yang sudah masuk tidak akan terpengaruh.
6. **Nomor WhatsApp Unik:**
   - Satu nomor WhatsApp terdaftar untuk satu identitas pelanggan. Disimpan dalam bentuk teks agar angka "0" di awal nomor tidak hilang.
7. **Batas Ukuran Foto Bukti Bayar:**
   - Foto bukti transfer dibatasi maksimal berukuran **5 MB** dan hanya menerima berkas gambar (.jpg, .jpeg, .png, .webp).
8. **Ruang Lingkup di Luar Proyek (*Out of Scope*):**
   - Tidak menggunakan gerbang pembayaran otomatis (*payment gateway* seperti Midtrans/Xendit) karena Bu Dina dan Rani masih memeriksa transfer secara manual.
   - Tidak ada fitur pelacak GPS posisi kurir secara langsung di peta (kurir adalah staf internal yang dapat dihubungi via telepon/WA).
   - Tidak dibuatkan aplikasi khusus di Play Store / App Store (cukup diakses lewat web browser HP).
   - Belum menyediakan sistem paket langganan mingguan/bulanan.

---

## 9. Kesepakatan Penguncian Dokumen

Sesuai kesepakatan rapat kerja:
- **Bagian yang Dikunci Permanen:** Alur kerja pemesanan, pembagian peran pengguna (Bu Dina dan Mbak Rani), serta Tiga Aturan Mutlak sistem.
- **Bagian yang Bersifat Fleksibel:** Penyesuaian tata letak tampilan, paduan warna, teks tombol, serta angka konfigurasi operasional (seperti perubahan jam tutup atau penyesuaian tarif ongkos kirim) dapat disesuaikan kembali melalui pengaturan Bu Dina di kemudian hari tanpa merombak arsitektur sistem.
