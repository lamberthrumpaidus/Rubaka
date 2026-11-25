<!-- ALL Create by LamberthRumpaidus -->
<div align="center">
  <img src="./app-logo.svg" alt="Identitas visual RUBAKA" width="112" />
  <h1>RUBAKA</h1>
  <p>Permainan aksi-platformer berbasis browser.</p>
  <p><a href="https://rubaka.netlify.app/">Mainkan</a> · <a href="https://github.com/lamberthrumpaidus/lamberthrumpaidus">Profil pengembang</a></p>
</div>

---

## Gambaran umum

RUBAKA memadukan eksplorasi, pertarungan, kemampuan karakter, dan rintangan dalam pengalaman platformer. Pemain menavigasi lingkungan, menghadapi musuh, serta memanfaatkan item dan kemampuan untuk melanjutkan perjalanan.

## Fitur utama

- Kontrol desktop dan layar sentuh.
- Sistem kesehatan, kemampuan, item, dan pertarungan.
- Navigasi peta dan menu jeda.
- Antarmuka permainan dan aset visual yang disertakan dalam repository.

## Teknologi dan struktur

HTML, CSS, JavaScript, Node.js dan esbuild untuk proses pengembangan.

| Lokasi | Fungsi |
|---|---|
| `index.html` | Halaman permainan |
| `src/` | Kode sumber |
| `assets/` | Aset visual |
| `tools/` | Perangkat build |

## Pengembangan lokal

```bash
git clone https://github.com/lamberthrumpaidus/Rubaka.git
cd Rubaka
npm install
npm run dev
```

Skrip pengembangan menjalankan esbuild dalam mode watch. Untuk menyajikan halaman melalui server lokal, jalankan `python -m http.server 8000` pada terminal terpisah dan buka `http://localhost:8000/`. Gunakan `npm run build` untuk menjalankan build proyek.

## Lisensi

Ketentuan penggunaan tersedia pada [LICENSE.txt](./LICENSE.txt).

---

<div align="center">
  <sub>Dikembangkan oleh <a href="https://github.com/lamberthrumpaidus/lamberthrumpaidus">Lamberth Rumpaidus</a></sub>
</div>
