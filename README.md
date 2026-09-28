# Webcam Qrcode Scanner
scan qr and barcodes using inbuilt/external webcam

[![Odoo Logo](https://project-management.com/wp-content/uploads/2014/08/odoo-logo1.png)](https://www.odoo.com/)

This module adds QR and Barcode scanning functionality using inbuilt device camera or attached external webcam to odoo text fields.

**Note on Compatibility:** This module has been fully upgraded to work natively with Odoo 18+ using the OWL framework.
**Security Note:** Browsers require a secure context (HTTPS) or localhost to access the device camera. If you are not using HTTPS or localhost, the camera scanner will not work.

## Usage

- Clone the repo and install the module to odoo
- Add `widget="barcode_scanner"` to any char or text field in your XML views
- Click the qrcode icon next to the field to scan a QR code or Barcode
