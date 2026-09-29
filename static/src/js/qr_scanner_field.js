/** @odoo-module **/

import { CharField } from "@web/views/fields/char/char_field";
import { standardFieldProps } from "@web/views/fields/standard_field_props";
import { registry } from "@web/core/registry";
import { scanBarcode } from "@web/core/barcode/barcode_dialog";
import { isBarcodeScannerSupported } from "@web/core/barcode/barcode_video_scanner";
import { useService } from "@web/core/utils/hooks";
import { loadJS } from "@web/core/assets";
import { omit } from "@web/core/utils/objects";
import { Component, signal, t, useProps } from "@odoo/owl";

// Lib ZXing yang sama yang dipakai scanner native Odoo (bundle modul web).
// loadJS di-cache per URL, jadi tidak dimuat dua kali meski native sudah load.
const ZXING_URL = "/web/static/lib/zxing-library/zxing-library.js";

export const qrScannerFieldProps = {
    ...standardFieldProps,
    string: t.string().optional(),
    placeholder: t.string().optional(),
};

export class QrScannerField extends Component {
    static template = "odoo_qrcode.QrScannerField";
    static components = { CharField };
    static displayName = "QR/Barcode Scanner";

    props = useProps(qrScannerFieldProps);
    fileInput = signal.ref();

    setup() {
        this.notification = useService("notification");
    }

    get charFieldProps() {
        // CharField tidak menerima prop `string`; sisanya diteruskan apa adanya
        return omit(this.props, "string");
    }

    async onScanClick() {
        if (!isBarcodeScannerSupported()) {
            this.notification.add(
                "Kamera tidak didukung browser ini. Izinkan akses kamera dan coba browser modern (Chrome/Edge/Firefox).",
                { type: "warning", title: "Tidak dapat scan" }
            );
            return;
        }
        try {
            const result = await scanBarcode(this.env, "environment");
            if (result) {
                this._applyResult(result);
            }
        } catch (e) {
            // user cancel atau permission denied — scanBarcode reject dengan error
            if (e && e.message && !/permission|denied/i.test(e.message)) {
                this.notification.add(`Gagal scan: ${e.message}`, { type: "danger" });
            }
        }
    }

    onUploadClick() {
        // Buka dialog pilih file; decodenya di onFileChange
        this.fileInput.el.click();
    }

    async onFileChange(ev) {
        const file = ev.target.files && ev.target.files[0];
        // reset agar file yang sama bisa dipilih ulang
        ev.target.value = "";
        if (!file) {
            return;
        }
        if (!/^image\//i.test(file.type)) {
            this.notification.add("File harus berupa gambar (PNG, JPG, dll).", {
                type: "warning",
                title: "Tidak dapat scan",
            });
            return;
        }
        let objectUrl;
        try {
            await loadJS(ZXING_URL);
            const reader = new window.ZXing.BrowserMultiFormatReader();
            objectUrl = URL.createObjectURL(file);
            const result = await reader.decodeFromImage(undefined, objectUrl);
            this._applyResult(result.getText());
        } catch (e) {
            const msg = (e && e.message) || String(e);
            if (/No\s+code|not\s+found|NotFound|No\s+QR|Unable/i.test(msg)) {
                this.notification.add(
                    "Tidak ada QR/barcode yang terdeteksi pada gambar tersebut.",
                    { type: "warning", title: "Gagal scan" }
                );
            } else {
                this.notification.add(`Gagal decode gambar: ${msg}`, { type: "danger" });
            }
        } finally {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        }
    }

    _applyResult(result) {
        this.props.record.update({ [this.props.name]: result });
        this.notification.add(`Scan berhasil: ${result}`, { type: "success" });
    }
}

export const qrScannerField = {
    component: QrScannerField,
    displayName: "QR/Barcode Scanner",
    supportedTypes: ["char", "text"],
    extractProps: ({ attrs, placeholder }) => ({
        string: attrs.string,
        placeholder,
    }),
};

registry.category("fields").add("barcode_scanner", qrScannerField);
