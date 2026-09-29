# odoo_qrcode — Upgrade Odoo 18 → 20/21

**Tanggal:** 2026-09-29
**Branch:** `20.0` (dibuat dari `main` @ `c8478b3` "FEAT: scan QR/barcode from image file")
**Target:** modul berjalan di Odoo 20.0 checkout `/home/may_day112/project_odoo/odoo-20`

## Latar

Modul sudah di-rewrite ke OWL di branch `main` untuk Odoo 18 (`5931d71`) dan ditambahi
fitur decode dari file gambar (`c8478b3`). Saat di-clone ke tree Odoo 20, sebagian
besar API barcode Odoo ternyata **tidak berubah**, sehingga upgrade ini kecil.

## Hasil audit API Odoo 20 (`addons/web/static/src/`)

| API yang dipakai modul | Status di Odoo 20 |
|---|---|
| `scanBarcode(env, facingMode)` — `@web/core/barcode/barcode_dialog` | identik, path sama |
| `isBarcodeScannerSupported()` — `@web/core/barcode/barcode_video_scanner` | identik, path sama |
| bundle zxing `/web/static/lib/zxing-library/zxing-library.js` | masih ada, path sama |
| `window.ZXing.BrowserMultiFormatReader` | tetap jalan (lib tetap di-serve) |
| `registry.category("fields").add(...)` + `extractProps` | pattern identik |
| `standardFieldProps` (`id/name/readonly/record`) | identik |
| `omit` — `@web/core/utils/objects` | masih ada |
| `useService` — `@web/core/utils/hooks` | masih ada |
| `CharField` menerima prop `placeholder` | ya (dalam `charFieldProps`) |

Yang berubah hanya **OWL**: Odoo 20 bundle `@odoo/owl` versi `3.0.0-alpha.49`
(sebelumnya 2.x di Odoo 18).

## Perubahan yang dilakukan (commit `219577e`)

1. **`useRef("file-input")` → `signal.ref()`** — OWL 3 mengubah ref API; core Odoo 20
   sendiri sudah 100% pakai `signal.ref()` (`CharField.input`, `BarcodeVideoScanner.videoPreviewRef`).
   `fileInput` jadi field initializer, dan `t-ref="file-input"` di XML diganti
   `t-ref="fileInput"` (nama refs sekarang identifier, bukan string key).
2. **`static props = {...}` → `props = useProps(qrScannerFieldProps)`** — di OWL 3
   props statis deklaratif memicu warning "Props declared with `props.static()` are
   static and should not change" saat nilai props berubah (mis. `readonly` toggle).
   Semua field component Odoo 20 memakai `useProps`. Shape `{ type: String, optional: true }`
   diganti `t.string().optional()`.
3. **`extractProps` pakai `placeholder` shorthand** — menyamai `CharField` core
   (`extractProps: ({ attrs, options, placeholder }) => ...`).
4. **`t-if="props.readonly === false"` → `t-if="!props.readonly"`** — props di OWL 3
   adalah reactive proxy; perbandingan `=== false` longgar/rapuh, negasi eksplisit
   lebih jelas dan sama maknanya.
5. **`__manifest__.py`: `version` → `20.0.1.0.0`** + catatan branch di description.

Tidak ada perubahan pada: logika scan kamera, logika decode file gambar, notifikasi,
SCSS, template asset bundle (`web.assets_backend`), dependencies (`base`, `web`).

## Hal yang sengaja tidak diubah

- **Tidak pakai `BarcodeDetector` native.** Odoo 20 `BarcodeVideoScanner` sudah
  memilih `BarcodeDetector` bila tersedia dan fallback ZXing otomatis — itu urusan
  `scanBarcode`, widget kita tinggal panggil. Memakai native detector untuk decode
  file gambar tidak worth it: `BarcodeDetector.detect()` butuh `ImageBitmap`/
  `Blob` dan dukungan browser masih bleeding edge, sedangkan path ZXing sudah
  terbukti dan lib-nya ter-bundle sama Odoo.
- **Tidak ada dependensi npm tambahan.** ZXing diambil dari bundle Odoo via `loadJS`.

## Validasi

- [x] `__manifest__.py` parse Python OK
- [x] XML template parse OK
- [x] JS: brace/paren/bracket balance OK, tidak ada legacy `useRef(` / `static props`
- [x] Semua import path (`@web/...`, `@odoo/owl`) ada di source Odoo 20 dan export
      yang dipakai benar-benar diekspor
- [x] marker OWL 3: `signal.ref()`, `useProps(`, `props = useProps` hadir
- [ ] **Runtime: install modul di Odoo 20 + uji scan di browser** — blocked

### Status runtime (blocked)

Tree `/home/may_day112/project_odoo/odoo-20` dimiliki **root**, bukan `may_day112`:

- `odoo.conf` (mode `0600`, root) — tidak terbaca, jadi `addons_path`, `db_user`, dan
  `data_dir` Odoo 20 belum diketahui.
- `python-3.12.10/bin/python` adalah symlink ke
  `/root/.local/share/uv/python/cpython-3.12.10-.../bin/python3.12` — **broken untuk
  user biasa** (Permission denied). Venv Odoo 20 ini dibuat dengan `uv` sebagai root
  dan base python-nya di luar akses user.
- PostgreSQL 17 online di `localhost:5432`, DB `odoo-20-c` (owner `odoo_18`) sudah
  ada — tapi credentials-nya di `odoo.conf` yang tidak terbaca.

**Yang harus dilakukan user (sekali, butuh password sudo):**

```bash
sudo chown -R may_day112:may_day112 /home/may_day112/project_odoo/odoo-20
```

Setelah itu agent bisa:
1. Baca `odoo.conf` (cek `addons_path` apakah `projects/rnd` sudah dimasukkan).
2. Perbaiki venv: `uv venv`/recreate atau pakai uv python yang accessible, lalu
   `uv pip install -r requirements.txt`.
3. Start `odoo-bin -c odoo.conf --dev=all`, install `odoo_qrcode` (dan `test_qr`
   sebagai test harness-nya — form view `test_qr.test_qr` sudah pakai
   `widget="barcode_scanner"`).
4. Validasi: tombol scan muncul, dialog kamera kebuka, tombol upload decode gambar,
   nilai field terisi.

## Catatan: modul `test_qr`

`projects/rnd/test_qr` adalah scaffold test harness (generator Odoo, author
"My Company") yang form view-nya sudah memakai `widget="barcode_scanner"` di field
`name`. Berguna untuk uji runtime widget. Manifest-nya `depends: ['base']` saja —
saat install, tambahkan dependensi `odoo_qrcode` bila ingin widget benar-benar
tersedia saat modul test di-install (widget sendiri tidak wajib ada di `depends`
untuk dipakai di XML, tapi akan warning di log kalau tidak ada).
