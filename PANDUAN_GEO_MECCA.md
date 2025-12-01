# Panduan Pengguna GeoMecca (SisPro TEWS)

## Pendahuluan
### Tujuan
Panduan ini membantu Anda mengoperasikan GeoMecca (modul AI Based Earthquake Processing) secara efektif. Baik pengguna baru maupun admin, panduan ini memberikan dasar untuk memaksimalkan web app dengan login pengguna dan arsitektur modular.

### Petunjuk Keamanan
1. **Keamanan Akses dan Data**: gunakan kredensial resmi, jangan berbagi username/password, dan selalu logout.
2. **Keamanan Pemeliharaan Sistem**: hati‑hati mengubah konfigurasi; lakukan backup sebelum perubahan penting.
3. **Keamanan Jaringan dan Server**: pastikan firewall/patch terkini dan rutin cek modul komunikasi.

## Mulai Penggunaan
### Login
Login untuk mengakses empat fitur utama:
- **EQ View**: info & visualisasi gempa terkini.
- **Station View**: status stasiun seismik.
- **Trace View**: rekaman gelombang tiap stasiun.
- **Origin Locator View**: lokasi asal gempa.
Menu **Config** tersedia untuk pengaturan sistem.

## Fitur Utama
### A. EQ View (Earthquake View)
- Menampilkan sebaran gempa; zoom in/out pada peta.
- **Filter periode**: pilih rentang waktu, peta terupdate.
- Event menampilkan magnitude (ukuran lingkaran) dan kedalaman (warna).
- **Latest Event**: klik untuk detail event terbaru.
- Klik event pada peta untuk info detail (magnitudo, kedalaman, waktu, lokasi, trace/picking).

### B. Station View
- Distribusi lokasi stasiun pada peta; zoom in/out untuk detail cakupan sensor.
- Warna/logo stasiun berubah (border kuning) saat mendeteksi gempa real time.
- Klik stasiun untuk detail: kualitas stasiun, ground motion, waktu rekam, lokasi, jumlah event.

### C. Trace View
- Menampilkan rekaman sinyal (trace) real‑time tiap stasiun.
- Memantau karakteristik gempa & kualitas sinyal.
- Menampilkan hasil picking gelombang P/S pada trace.
- Sub‑menu Enabled/Disabled untuk menampilkan stasiun aktif/tidak aktif.
- Monitoring simultan beberapa stasiun untuk perbandingan.

### D. Origin Locator View
Sub-menu: **Events**, **Location**, **Origin**, **Magnitude**.

1) **Events**  
- Pilih rentang waktu untuk daftar event (katalog).

2) **Location**  
- Detail event: waktu, kedalaman, lat/lon, jumlah fase picking, RMS, azimuth gap, ketidakpastian lokasi, stasiun yang merekam.  
- Unduh detail event (teks) via tombol **Download**.
- Picking tools: tambah/ubah P dan S, pilih gelombang yang dievaluasi (highlight biru), pilih OT/P/S alignment, evaluasi picking (manual/ada), tombol hijau (simpan) / merah (batal).

3) **Origin**  
- Menampilkan beberapa versi origin (mis. origin ke‑2 setelah stasiun tambahan merekam). Sistem memilih origin terbaik (ketidakpastian lokasi terkecil).

4) **Magnitude**  
- Menampilkan magnitudo per event (ML, Mw, dll.) untuk perbandingan metode.

## Catatan
- Untuk picking/trace yang kaya data, pastikan MiniSEED tersedia untuk stasiun terkait (PPL04, TCH02, TCH04 di dataset ini) dan data picks/arrivals sudah terimport ke database.
- Trace View menampilkan P/S picks jika berada dalam jendela waktu yang disimulasikan/terkini.

