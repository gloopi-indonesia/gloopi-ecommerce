/**
 * Indonesian Messages for Storefront
 * Customer-facing messages in Indonesian language
 */

/**
 * Common error messages in Indonesian for customers
 */
export const ERROR_MESSAGES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'Email atau kata sandi tidak valid',
  UNAUTHORIZED: 'Anda tidak memiliki akses untuk halaman ini',
  SESSION_EXPIRED: 'Sesi Anda telah berakhir. Silakan masuk kembali',
  ACCOUNT_NOT_FOUND: 'Akun tidak ditemukan',
  
  // Validation errors
  REQUIRED_FIELD: 'Field ini wajib diisi',
  INVALID_EMAIL: 'Format email tidak valid',
  INVALID_PHONE: 'Format nomor telepon tidak valid',
  INVALID_DATE: 'Format tanggal tidak valid',
  PASSWORD_TOO_SHORT: 'Kata sandi minimal 8 karakter',
  PASSWORD_MISMATCH: 'Konfirmasi kata sandi tidak cocok',
  
  // Shopping cart errors
  CART_EMPTY: 'Keranjang belanja kosong',
  PRODUCT_NOT_AVAILABLE: 'Produk tidak tersedia',
  INVALID_QUANTITY: 'Jumlah produk tidak valid',
  MINIMUM_ORDER_NOT_MET: 'Jumlah pesanan minimum belum terpenuhi',
  
  // Order errors
  ORDER_NOT_FOUND: 'Pesanan tidak ditemukan',
  QUOTATION_NOT_FOUND: 'Penawaran tidak ditemukan',
  INVOICE_NOT_FOUND: 'Faktur tidak ditemukan',
  
  // Form errors
  INVALID_ADDRESS: 'Alamat tidak valid',
  INVALID_POSTAL_CODE: 'Kode pos tidak valid',
  COMPANY_INFO_REQUIRED: 'Informasi perusahaan diperlukan untuk pelanggan B2B',
  
  // Network errors
  NETWORK_ERROR: 'Terjadi kesalahan jaringan. Silakan coba lagi',
  SERVER_ERROR: 'Terjadi kesalahan pada server. Silakan coba lagi nanti',
  SERVICE_UNAVAILABLE: 'Layanan sedang tidak tersedia',
  
  // File upload errors
  FILE_TOO_LARGE: 'Ukuran file terlalu besar (maksimal 5MB)',
  INVALID_FILE_TYPE: 'Jenis file tidak didukung',
  
  // Generic errors
  UNKNOWN_ERROR: 'Terjadi kesalahan yang tidak diketahui',
  OPERATION_FAILED: 'Operasi gagal dilakukan. Silakan coba lagi',
} as const

/**
 * Success messages in Indonesian for customers
 */
export const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'Berhasil masuk ke akun Anda',
  LOGOUT_SUCCESS: 'Berhasil keluar dari akun',
  REGISTRATION_SUCCESS: 'Akun berhasil dibuat. Silakan masuk',
  PASSWORD_CHANGED: 'Kata sandi berhasil diubah',
  PROFILE_UPDATED: 'Profil berhasil diperbarui',
  
  // Shopping and orders
  PRODUCT_ADDED_TO_CART: 'Produk berhasil ditambahkan ke keranjang',
  CART_UPDATED: 'Keranjang berhasil diperbarui',
  PO_REQUEST_SUBMITTED: 'Permintaan penawaran berhasil dikirim',
  QUOTATION_RECEIVED: 'Penawaran telah diterima dan sedang diproses',
  
  // Communication
  MESSAGE_SENT: 'Pesan berhasil dikirim',
  CONTACT_FORM_SUBMITTED: 'Formulir kontak berhasil dikirim',
  
  // Tax invoice
  TAX_INVOICE_REQUESTED: 'Permintaan faktur pajak berhasil dikirim',
  
  // File operations
  FILE_UPLOADED: 'File berhasil diunggah',
  
  // Generic success
  OPERATION_SUCCESS: 'Operasi berhasil dilakukan',
  DATA_SAVED: 'Data berhasil disimpan',
} as const

/**
 * Status messages for customers
 */
export const STATUS_MESSAGES = {
  // Order statuses
  ORDER_NEW: 'Pesanan Baru',
  ORDER_PROCESSING: 'Sedang Diproses',
  ORDER_SHIPPED: 'Sedang Dikirim',
  ORDER_DELIVERED: 'Sudah Diterima',
  ORDER_CANCELLED: 'Dibatalkan',
  
  // Quotation statuses
  QUOTATION_PENDING: 'Menunggu Persetujuan',
  QUOTATION_APPROVED: 'Disetujui',
  QUOTATION_REJECTED: 'Ditolak',
  QUOTATION_CONVERTED: 'Dikonversi ke Pesanan',
  QUOTATION_EXPIRED: 'Kedaluwarsa',
  
  // Invoice statuses
  INVOICE_PENDING: 'Belum Dibayar',
  INVOICE_PAID: 'Sudah Dibayar',
  INVOICE_OVERDUE: 'Jatuh Tempo',
  
  // General statuses
  ACTIVE: 'Aktif',
  INACTIVE: 'Tidak Aktif',
  PENDING: 'Menunggu',
  COMPLETED: 'Selesai',
  IN_PROGRESS: 'Sedang Berlangsung',
} as const

/**
 * Navigation and UI labels
 */
export const UI_LABELS = {
  // Navigation
  HOME: 'Beranda',
  PRODUCTS: 'Produk',
  CATEGORIES: 'Kategori',
  ABOUT: 'Tentang Kami',
  CONTACT: 'Kontak',
  CART: 'Keranjang',
  ACCOUNT: 'Akun',
  ORDERS: 'Pesanan',
  PROFILE: 'Profil',
  
  // Product catalog
  ALL_PRODUCTS: 'Semua Produk',
  MEDICAL_GLOVES: 'Sarung Tangan Medis',
  MANUFACTURING_GLOVES: 'Sarung Tangan Industri',
  FOOD_GLOVES: 'Sarung Tangan Makanan',
  SEARCH_PRODUCTS: 'Cari Produk',
  FILTER_BY: 'Filter Berdasarkan',
  SORT_BY: 'Urutkan Berdasarkan',
  PRICE_LOW_TO_HIGH: 'Harga: Rendah ke Tinggi',
  PRICE_HIGH_TO_LOW: 'Harga: Tinggi ke Rendah',
  NEWEST_FIRST: 'Terbaru',
  
  // Product details
  PRODUCT_DETAILS: 'Detail Produk',
  SPECIFICATIONS: 'Spesifikasi',
  DESCRIPTION: 'Deskripsi',
  PRICE: 'Harga',
  QUANTITY: 'Jumlah',
  ADD_TO_CART: 'Tambah ke Keranjang',
  REQUEST_QUOTATION: 'Minta Penawaran',
  
  // Shopping cart
  SHOPPING_CART: 'Keranjang Belanja',
  CART_EMPTY: 'Keranjang kosong',
  CONTINUE_SHOPPING: 'Lanjut Belanja',
  UPDATE_CART: 'Perbarui Keranjang',
  REMOVE_ITEM: 'Hapus Item',
  SUBTOTAL: 'Subtotal',
  TOTAL: 'Total',
  PROCEED_TO_CHECKOUT: 'Lanjut ke Checkout',
  REQUEST_PO: 'Ajukan Permintaan Pembelian',
  
  // Checkout and forms
  CUSTOMER_INFORMATION: 'Informasi Pelanggan',
  SHIPPING_ADDRESS: 'Alamat Pengiriman',
  BILLING_ADDRESS: 'Alamat Penagihan',
  COMPANY_INFORMATION: 'Informasi Perusahaan',
  CONTACT_PERSON: 'Nama Kontak',
  PHONE_NUMBER: 'Nomor Telepon',
  EMAIL_ADDRESS: 'Alamat Email',
  NOTES: 'Catatan',
  SPECIAL_REQUESTS: 'Permintaan Khusus',
  
  // Account pages
  MY_ACCOUNT: 'Akun Saya',
  ORDER_HISTORY: 'Riwayat Pesanan',
  QUOTATION_HISTORY: 'Riwayat Penawaran',
  INVOICE_HISTORY: 'Riwayat Faktur',
  PERSONAL_INFORMATION: 'Informasi Pribadi',
  CHANGE_PASSWORD: 'Ubah Kata Sandi',
  
  // Order tracking
  ORDER_STATUS: 'Status Pesanan',
  ORDER_DATE: 'Tanggal Pesanan',
  ESTIMATED_DELIVERY: 'Perkiraan Pengiriman',
  TRACKING_NUMBER: 'Nomor Resi',
  TRACK_SHIPMENT: 'Lacak Pengiriman',
  
  // Common actions
  LOGIN: 'Masuk',
  REGISTER: 'Daftar',
  LOGOUT: 'Keluar',
  SAVE: 'Simpan',
  CANCEL: 'Batal',
  EDIT: 'Edit',
  DELETE: 'Hapus',
  VIEW: 'Lihat',
  DOWNLOAD: 'Unduh',
  PRINT: 'Cetak',
  SHARE: 'Bagikan',
  BACK: 'Kembali',
  NEXT: 'Selanjutnya',
  PREVIOUS: 'Sebelumnya',
  SUBMIT: 'Kirim',
  CONFIRM: 'Konfirmasi',
  
  // Footer
  COMPANY_INFO: 'Informasi Perusahaan',
  CUSTOMER_SERVICE: 'Layanan Pelanggan',
  FOLLOW_US: 'Ikuti Kami',
  NEWSLETTER: 'Newsletter',
  SUBSCRIBE: 'Berlangganan',
  PRIVACY_POLICY: 'Kebijakan Privasi',
  TERMS_OF_SERVICE: 'Syarat Layanan',
  COPYRIGHT: 'Hak Cipta',
} as const

/**
 * Form field labels
 */
export const FORM_LABELS = {
  // Personal information
  FULL_NAME: 'Nama Lengkap',
  FIRST_NAME: 'Nama Depan',
  LAST_NAME: 'Nama Belakang',
  EMAIL: 'Email',
  PHONE: 'Nomor Telepon',
  DATE_OF_BIRTH: 'Tanggal Lahir',
  GENDER: 'Jenis Kelamin',
  
  // Address fields
  ADDRESS: 'Alamat',
  STREET_ADDRESS: 'Alamat Jalan',
  CITY: 'Kota',
  STATE_PROVINCE: 'Provinsi',
  POSTAL_CODE: 'Kode Pos',
  COUNTRY: 'Negara',
  
  // Company fields
  COMPANY_NAME: 'Nama Perusahaan',
  COMPANY_TYPE: 'Jenis Perusahaan',
  TAX_ID: 'NPWP',
  BUSINESS_LICENSE: 'Nomor Izin Usaha',
  INDUSTRY: 'Industri',
  
  // Authentication
  PASSWORD: 'Kata Sandi',
  CONFIRM_PASSWORD: 'Konfirmasi Kata Sandi',
  CURRENT_PASSWORD: 'Kata Sandi Saat Ini',
  NEW_PASSWORD: 'Kata Sandi Baru',
  REMEMBER_ME: 'Ingat Saya',
  FORGOT_PASSWORD: 'Lupa Kata Sandi?',
  
  // Order fields
  QUANTITY: 'Jumlah',
  UNIT_PRICE: 'Harga Satuan',
  TOTAL_PRICE: 'Total Harga',
  DELIVERY_DATE: 'Tanggal Pengiriman',
  PAYMENT_METHOD: 'Metode Pembayaran',
  
  // Optional fields
  OPTIONAL: '(Opsional)',
  REQUIRED: '(Wajib)',
} as const

/**
 * Validation messages
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Field ini wajib diisi',
  INVALID_EMAIL: 'Format email tidak valid',
  INVALID_PHONE: 'Format nomor telepon tidak valid (contoh: 08123456789)',
  INVALID_POSTAL_CODE: 'Kode pos harus 5 digit',
  PASSWORD_MIN_LENGTH: 'Kata sandi minimal 8 karakter',
  PASSWORD_MISMATCH: 'Konfirmasi kata sandi tidak cocok',
  INVALID_NUMBER: 'Harus berupa angka',
  MIN_VALUE: (min: number) => `Nilai minimal ${min}`,
  MAX_VALUE: (max: number) => `Nilai maksimal ${max}`,
  MIN_LENGTH: (min: number) => `Minimal ${min} karakter`,
  MAX_LENGTH: (max: number) => `Maksimal ${max} karakter`,
} as const

/**
 * Get localized error message
 */
export function getErrorMessage(errorCode: keyof typeof ERROR_MESSAGES): string {
  return ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.UNKNOWN_ERROR
}

/**
 * Get localized success message
 */
export function getSuccessMessage(successCode: keyof typeof SUCCESS_MESSAGES): string {
  return SUCCESS_MESSAGES[successCode] || 'Operasi berhasil'
}

/**
 * Get localized status message
 */
export function getStatusMessage(statusCode: keyof typeof STATUS_MESSAGES): string {
  return STATUS_MESSAGES[statusCode] || statusCode
}

/**
 * Get localized UI label
 */
export function getUILabel(labelCode: keyof typeof UI_LABELS): string {
  return UI_LABELS[labelCode] || labelCode
}

/**
 * Get localized form label
 */
export function getFormLabel(labelCode: keyof typeof FORM_LABELS): string {
  return FORM_LABELS[labelCode] || labelCode
}