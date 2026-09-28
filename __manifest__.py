{
    'name': "odoo_qrcode",
    'version': '0.1',
    'depends': ['base', 'web'],
    'author': "DevSanx",
    'category': "Tools",
    'summary': 'Qrcode/Barcode Scanner',
    'description': """
        Scan Barcodes and Qrcodes using device camera
    """,
    'data': [
        'views/assets.xml',
    ],
    'assets': {
        'web.assets_backend': [
            "odoo_qrcode/static/src/css/webcam_qrcode_scan_styles.css",
            "odoo_qrcode/static/src/lib/html5-qrcode.min.js",
            "odoo_qrcode/static/src/lib/quagga.min.js",
            "odoo_qrcode/static/src/js/barcode_scanner_widget.min.js",
            "odoo_qrcode/static/src/xml/webcam_qrcode_scan_template.xml"   
        ]
    },
    'installable': True,
}