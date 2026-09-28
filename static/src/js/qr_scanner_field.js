/** @odoo-module **/

import { CharField } from "@web/views/fields/char/char_field";
import { standardFieldProps } from "@web/views/fields/standard_field_props";
import { registry } from "@web/core/registry";
import { scanBarcode } from "@web/core/barcode/barcode_dialog";
import { isBarcodeScannerSupported } from "@web/core/barcode/barcode_video_scanner";
import { useService } from "@web/core/utils/hooks";
import { omit } from "@web/core/utils/objects";
import { Component } from "@odoo/owl";

export class QrScannerField extends Component {
    static template = "odoo_qrcode.QrScannerField";
    static components = { CharField };
    static props = {
        ...standardFieldProps,
        string: { type: String, optional: true },
        placeholder: { type: String, optional: true },
    };
    static displayName = "QR/Barcode Scanner";

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
                this.props.record.update({ [this.props.name]: result });
                this.notification.add(`Scan berhasil: ${result}`, { type: "success" });
            }
        } catch (e) {
            // user cancel atau permission denied — scanBarcode reject dengan error
            if (e && e.message && !/permission|denied/i.test(e.message)) {
                this.notification.add(`Gagal scan: ${e.message}`, { type: "danger" });
            }
        }
    }
}

export const qrScannerField = {
    component: QrScannerField,
    displayName: "QR/Barcode Scanner",
    supportedTypes: ["char", "text"],
    extractProps: ({ attrs }) => ({
        string: attrs.string,
        placeholder: attrs.placeholder,
    }),
};

registry.category("fields").add("barcode_scanner", qrScannerField);
