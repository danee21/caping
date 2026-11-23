# SIP-CAPING — Final Starter

Aplikasi pencatatan CAPING Kemenag Kabupaten Sleman. Frontend HTML/CSS/Bootstrap 5, backend Google Apps Script, database Google Sheets, deploy frontend di Vercel.

## Fitur
- Dashboard rekap Catin, penerimaan, realisasi, saldo dan monitoring.
- CRUD Catin, Penerimaan, Realisasi, Monitoring.
- ID otomatis CAP-SLM-0001, P-0001, R-0001, M-0001.
- Identitas transaksi otomatis ditarik dari data induk.
- Validasi saldo: realisasi tidak boleh melebihi penerimaan.
- Validasi monitoring: hidup + mati tidak melebihi jumlah realisasi.
- Role admin Kabupaten dan akun per KUA; data KUA dibatasi di server.
- Laporan ringkas dan ekspor CSV.
- Tidak ada fitur upload bukti dukung.
- Penguncian transaksi ketika backend menulis ke Google Sheets.

## 1. Buat Google Spreadsheet
Buat spreadsheet kosong. Salin ID spreadsheet dari URL:
`https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

## 2. Siapkan Google Apps Script
1. Buka https://script.google.com/ dan buat project.
2. Tempel seluruh isi `gas/Code.gs` ke editor `Code.gs`.
3. Buka Project Settings > Script Properties.
4. Tambahkan:
   - `SPREADSHEET_ID` = ID spreadsheet
   - `SERVER_TOKEN` = string acak rahasia minimal 40 karakter (contoh buat sendiri, jangan gunakan contoh publik).
5. Jalankan `setupSIPCAPING()` dari editor, setujui izin.
6. Deploy > New deployment > Web app.
   - Execute as: Me
   - Who has access: Anyone
7. Salin URL deployment berakhiran `/exec`.

## 3. Deploy ke Vercel
1. Upload folder project ini ke GitHub.
2. Import repository di https://vercel.com/new.
3. Di Project Settings > Environment Variables tambahkan:
   - `APPS_SCRIPT_URL` = URL Web App `/exec`
   - `APPS_SCRIPT_TOKEN` = nilai `SERVER_TOKEN` yang sama persis
4. Deploy / Redeploy.

## 4. Login pertama
- Username: `admin`
- Password: `GantiAdmin123!`

Segera login dan buat akun admin pengganti / ubah password admin awal. Setelah akun baru berhasil dibuat, nonaktifkan akun awal atau ubah password melalui pengelolaan pengguna (fitur edit pengguna tersedia). Jangan bagikan kredensial.

## 5. Membuat akun KUA
Masuk sebagai admin Kabupaten > Pengguna > Tambah Pengguna.
- Role `KUA`
- Nama KUA isi nama resmi KUA (dipakai sebagai batas data)
- Buat username dan password minimal 10 karakter.
Akun KUA hanya dapat melihat/mengelola record dengan nama KUA yang sama. Saat admin menambah Catin, isian KUA wajib dipilih/diisi sesuai KUA yang ditangani.

## Catatan implementasi / sebelum produksi
- Spreadsheet harus dimiliki akun Google operasional instansi, bukan akun pribadi yang berisiko hilang akses.
- Web App `Anyone` diperlukan agar Vercel dapat memanggil endpoint; keamanan endpoint memakai token rahasia server dan session HMAC. Jangan pernah menaruh token di `index.html` atau `app.js`.
- Buat backup spreadsheet berkala dan batasi editor spreadsheet hanya untuk pengelola tepercaya.
- Uji dulu dengan data dummy, uji role setiap KUA, penghapusan, saldo, dan backup sebelum menginput data riil.
- Field "Bukti Penerimaan/Realisasi/Monitoring" di Excel sumber tidak dibuat karena permintaan aplikasi tanpa upload bukti; tidak ada file yang disimpan ke Drive.
- Struktur kolom mengacu pada workbook SIP-CAPING Excel 3.1: Input Catin, Input Penerimaan, Input Realisasi, Input Monitoring, Dashboard, dan Kontrol Data. Workbook berisi juga kolom Bukti yang sengaja ditiadakan di aplikasi ini.
- Ini source code siap deploy setelah konfigurasi akun dan environment. Deployment, izin Google, dan pengujian di akun instansi tetap harus dilakukan pemilik aplikasi.
