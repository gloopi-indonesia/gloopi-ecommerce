/**
 * Indonesian Error Messages and Notifications
 * Centralized Indonesian language messages for the application
 */

/**
 * Common error messages in Indonesian
 */
export const ERROR_MESSAGES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'Email atau kata sandi tidak valid',
  UNAUTHORIZED: 'Anda tidak memiliki akses untuk melakukan tindakan ini',
  SESSION_EXPIRED: 'Sesi Anda telah berakhir. Silakan masuk kembali',
  ACCOUNT_LOCKED: 'Akun Anda telah dikunci. Hubungi administrator',
  
  // Validation errors
  REQUIRED_FIELD: 'Field ini wajib diisi',
  INVALID_EMAIL: 'Format email tidak valid',
  INVALID_PHONE: 'Format nomor telepon tidak valid',
  INVALID_DATE: 'Format tanggal tidak valid',
  INVALID_NUMBER: 'Format angka tidak valid',
  PASSWORD_TOO_SHORT: 'Kata sandi minimal 8 karakter',
  PASSWORD_MISMATCH: 'Konfirmasi kata sandi tidak cocok',
  
  // Business logic errors
  QUOTATION_NOT_FOUND: 'Penawaran tidak ditemukan',
  QUOTATION_EXPIRED: 'Penawaran telah kedaluwarsa',
  QUOTATION_ALREADY_CONVERTED: 'Penawaran sudah dikonversi menjadi pesanan',
  ORDER_NOT_FOUND: 'Pesanan tidak ditemukan',
  ORDER_CANNOT_BE_CANCELLED: 'Pesanan tidak dapat dibatalkan',
  CUSTOMER_NOT_FOUND: 'Pelanggan tidak ditemukan',
  PRODUCT_NOT_FOUND: 'Produk tidak ditemukan',
  PRODUCT_OUT_OF_STOCK: 'Produk sedang tidak tersedia',
  INVOICE_NOT_FOUND: 'Faktur tidak ditemukan',
  INVOICE_ALREADY_PAID: 'Faktur sudah dibayar',
  
  // Communication errors
  WHATSAPP_SEND_FAILED: 'Gagal mengirim pesan WhatsApp',
  EMAIL_SEND_FAILED: 'Gagal mengirim email',
  PHONE_NUMBER_INVALID: 'Nomor telepon tidak valid',
  
  // File upload errors
  FILE_TOO_LARGE: 'Ukuran file terlalu besar',
  INVALID_FILE_TYPE: 'Jenis file tidak didukung',
  UPLOAD_FAILED: 'Gagal mengunggah file',
  
  // Database errors
  DATABASE_ERROR: 'Terjadi kesalahan pada database',
  DUPLICATE_ENTRY: 'Data sudah ada',
  FOREIGN_KEY_CONSTRAINT: 'Data tidak dapat dihapus karena masih digunakan',
  
  // Network errors
  NETWORK_ERROR: 'Terjadi kesalahan jaringan',
  SERVER_ERROR: 'Terjadi kesalahan pada server',
  SERVICE_UNAVAILABLE: 'Layanan sedang tidak tersedia',
  
  // Generic errors
  UNKNOWN_ERROR: 'Terjadi kesalahan yang tidak diketahui',
  OPERATION_FAILED: 'Operasi gagal dilakukan',
  ACCESS_DENIED: 'Akses ditolak',
} as const

/**
 * Success messages in Indonesian
 */
export const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'Berhasil masuk',
  LOGOUT_SUCCESS: 'Berhasil keluar',
  PASSWORD_CHANGED: 'Kata sandi berhasil diubah',
  
  // CRUD operations
  CREATED_SUCCESS: 'Data berhasil dibuat',
  UPDATED_SUCCESS: 'Data berhasil diperbarui',
  DELETED_SUCCESS: 'Data berhasil dihapus',
  SAVED_SUCCESS: 'Data berhasil disimpan',
  
  // Business operations
  QUOTATION_CREATED: 'Penawaran berhasil dibuat',
  QUOTATION_APPROVED: 'Penawaran berhasil disetujui',
  QUOTATION_CONVERTED: 'Penawaran berhasil dikonversi menjadi pesanan',
  ORDER_CREATED: 'Pesanan berhasil dibuat',
  ORDER_UPDATED: 'Status pesanan berhasil diperbarui',
  ORDER_SHIPPED: 'Pesanan berhasil dikirim',
  ORDER_DELIVERED: 'Pesanan berhasil diterima',
  INVOICE_GENERATED: 'Faktur berhasil dibuat',
  INVOICE_PAID: 'Pembayaran berhasil dicatat',
  TAX_INVOICE_GENERATED: 'Faktur pajak berhasil dibuat',
  
  // Communication
  WHATSAPP_SENT: 'Pesan WhatsApp berhasil dikirim',
  EMAIL_SENT: 'Email berhasil dikirim',
  FOLLOW_UP_SCHEDULED: 'Pengingat tindak lanjut berhasil dijadwalkan',
  
  // File operations
  FILE_UPLOADED: 'File berhasil diunggah',
  FILE_DELETED: 'File berhasil dihapus',
  
  // Export operations
  EXPORT_SUCCESS: 'Data berhasil diekspor',
  REPORT_GENERATED: 'Laporan berhasil dibuat',
} as const

/**
 * Status messages in Indonesian
 */
export const STATUS_MESSAGES = {
  // Quotation statuses
  QUOTATION_PENDING: 'Menunggu',
  QUOTATION_APPROVED: 'Disetujui',
  QUOTATION_REJECTED: 'Ditolak',
  QUOTATION_CONVERTED: 'Dikonversi',
  QUOTATION_EXPIRED: 'Kedaluwarsa',
  
  // Order statuses
  ORDER_NEW: 'Baru',
  ORDER_PROCESSING: 'Diproses',
  ORDER_SHIPPED: 'Dikirim',
  ORDER_DELIVERED: 'Diterima',
  ORDER_CANCELLED: 'Dibatalkan',
  
  // Invoice statuses
  INVOICE_PENDING: 'Belum Dibayar',
  INVOICE_PAID: 'Sudah Dibayar',
  INVOICE_OVERDUE: 'Jatuh Tempo',
  INVOICE_CANCELLED: 'Dibatalkan',
  
  // Communication statuses
  COMMUNICATION_SENT: 'Terkirim',
  COMMUNICATION_DELIVERED: 'Tersampaikan',
  COMMUNICATION_READ: 'Dibaca',
  COMMUNICATION_FAILED: 'Gagal',
  
  // General statuses
  ACTIVE: 'Aktif',
  INACTIVE: 'Tidak Aktif',
  PENDING: 'Menunggu',
  COMPLETED: 'Selesai',
  IN_PROGRESS: 'Sedang Berlangsung',
  CANCELLED: 'Dibatalkan',
} as const

/**
 * Form labels in Indonesian
 */
export const FORM_LABELS = {
  // Common fields
  NAME: 'Nama',
  EMAIL: 'Email',
  PHONE: 'Nomor Telepon',
  ADDRESS: 'Alamat',
  CITY: 'Kota',
  POSTAL_CODE: 'Kode Pos',
  NOTES: 'Catatan',
  DESCRIPTION: 'Deskripsi',
  QUANTITY: 'Jumlah',
  PRICE: 'Harga',
  TOTAL: 'Total',
  DATE: 'Tanggal',
  TIME: 'Waktu',
  STATUS: 'Status',
  
  // Customer fields
  CUSTOMER_NAME: 'Nama Pelanggan',
  CUSTOMER_TYPE: 'Jenis Pelanggan',
  COMPANY_NAME: 'Nama Perusahaan',
  TAX_ID: 'NPWP',
  CONTACT_PERSON: 'Nama Kontak',
  
  // Product fields
  PRODUCT_NAME: 'Nama Produk',
  PRODUCT_CODE: 'Kode Produk',
  CATEGORY: 'Kategori',
  USE_CASE: 'Kegunaan',
  SPECIFICATIONS: 'Spesifikasi',
  
  // Order fields
  ORDER_NUMBER: 'Nomor Pesanan',
  QUOTATION_NUMBER: 'Nomor Penawaran',
  INVOICE_NUMBER: 'Nomor Faktur',
  TRACKING_NUMBER: 'Nomor Resi',
  SHIPPING_ADDRESS: 'Alamat Pengiriman',
  
  // Authentication fields
  PASSWORD: 'Kata Sandi',
  CONFIRM_PASSWORD: 'Konfirmasi Kata Sandi',
  CURRENT_PASSWORD: 'Kata Sandi Saat Ini',
  NEW_PASSWORD: 'Kata Sandi Baru',
} as const

/**
 * Button labels in Indonesian
 */
export const BUTTON_LABELS = {
  // Common actions
  SAVE: 'Simpan',
  CANCEL: 'Batal',
  DELETE: 'Hapus',
  EDIT: 'Edit',
  VIEW: 'Lihat',
  CREATE: 'Buat',
  UPDATE: 'Perbarui',
  SUBMIT: 'Kirim',
  RESET: 'Reset',
  SEARCH: 'Cari',
  FILTER: 'Filter',
  EXPORT: 'Ekspor',
  IMPORT: 'Impor',
  DOWNLOAD: 'Unduh',
  UPLOAD: 'Unggah',
  
  // Authentication
  LOGIN: 'Masuk',
  LOGOUT: 'Keluar',
  REGISTER: 'Daftar',
  
  // Business actions
  APPROVE: 'Setujui',
  REJECT: 'Tolak',
  CONVERT_TO_ORDER: 'Konversi ke Pesanan',
  MARK_AS_PAID: 'Tandai Sudah Dibayar',
  GENERATE_INVOICE: 'Buat Faktur',
  SEND_WHATSAPP: 'Kirim WhatsApp',
  SEND_EMAIL: 'Kirim Email',
  SCHEDULE_FOLLOW_UP: 'Jadwalkan Tindak Lanjut',
  
  // Navigation
  BACK: 'Kembali',
  NEXT: 'Selanjutnya',
  PREVIOUS: 'Sebelumnya',
  HOME: 'Beranda',
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
 * Get localized form label
 */
export function getFormLabel(labelCode: keyof typeof FORM_LABELS): string {
  return FORM_LABELS[labelCode] || labelCode
}

/**
 * Get localized button label
 */
export function getButtonLabel(buttonCode: keyof typeof BUTTON_LABELS): string {
  return BUTTON_LABELS[buttonCode] || buttonCode
}