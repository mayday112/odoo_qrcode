{
    'name': 'QR/Barcode Scanner',
    'version': '18.0.1.0.0',
    'category': 'Tools',
    'summary': 'Scan QR/Barcode dengan kamera device',
    'description': "Add widget='barcode_scanner' to any char/text field to scan QR/barcode via camera.",
    'author': 'DevSanx',
    'license': 'LGPL-3',
    'depends': ['base', 'web'],
    'data': [],
    'assets': {
        'web.assets_backend': [
            'odoo_qrcode/static/src/xml/qr_scanner_field.xml',
            'odoo_qrcode/static/src/js/qr_scanner_field.js',
            'odoo_qrcode/static/src/scss/qr_scanner_field.scss',
        ],
    },
    'installable': True,
    'auto_install': False,
}