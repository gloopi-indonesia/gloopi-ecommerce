/**
 * Indonesian Date Formatting Utilities
 * Handles date formatting according to Indonesian conventions
 */

/**
 * Indonesian month names
 */
const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

/**
 * Indonesian day names
 */
const INDONESIAN_DAYS = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
]

/**
 * Indonesian short day names
 */
const INDONESIAN_DAYS_SHORT = [
  'Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'
]

/**
 * Format date in Indonesian format
 * @param date - Date to format
 * @param format - Format type
 */
export function formatIndonesianDate(
  date: Date | string | number,
  format: 'full' | 'long' | 'medium' | 'short' | 'day-only' = 'medium'
): string {
  const d = new Date(date)
  
  if (isNaN(d.getTime())) {
    return 'Tanggal tidak valid'
  }

  const day = d.getDate()
  const month = d.getMonth()
  const year = d.getFullYear()
  const dayOfWeek = d.getDay()

  switch (format) {
    case 'full':
      return `${INDONESIAN_DAYS[dayOfWeek]}, ${day} ${INDONESIAN_MONTHS[month]} ${year}`
    
    case 'long':
      return `${day} ${INDONESIAN_MONTHS[month]} ${year}`
    
    case 'medium':
      return `${day}/${(month + 1).toString().padStart(2, '0')}/${year}`
    
    case 'short':
      return `${day}/${(month + 1).toString().padStart(2, '0')}/${year.toString().slice(-2)}`
    
    case 'day-only':
      return `${INDONESIAN_DAYS[dayOfWeek]}`
    
    default:
      return `${day}/${(month + 1).toString().padStart(2, '0')}/${year}`
  }
}

/**
 * Format time in Indonesian format (24-hour)
 */
export function formatIndonesianTime(
  date: Date | string | number,
  includeSeconds: boolean = false
): string {
  const d = new Date(date)
  
  if (isNaN(d.getTime())) {
    return 'Waktu tidak valid'
  }

  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  
  if (includeSeconds) {
    const seconds = d.getSeconds().toString().padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }
  
  return `${hours}:${minutes}`
}

/**
 * Format datetime in Indonesian format
 */
export function formatIndonesianDateTime(
  date: Date | string | number,
  dateFormat: 'full' | 'long' | 'medium' | 'short' = 'medium',
  includeSeconds: boolean = false
): string {
  const formattedDate = formatIndonesianDate(date, dateFormat)
  const formattedTime = formatIndonesianTime(date, includeSeconds)
  
  return `${formattedDate} ${formattedTime}`
}

/**
 * Format relative time in Indonesian
 */
export function formatRelativeTime(date: Date | string | number): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) {
    return 'Baru saja'
  } else if (diffMinutes < 60) {
    return `${diffMinutes} menit yang lalu`
  } else if (diffHours < 24) {
    return `${diffHours} jam yang lalu`
  } else if (diffDays < 7) {
    return `${diffDays} hari yang lalu`
  } else {
    return formatIndonesianDate(d, 'long')
  }
}

/**
 * Format business date for documents (formal Indonesian format)
 */
export function formatBusinessDate(date: Date | string | number): string {
  const d = new Date(date)
  
  if (isNaN(d.getTime())) {
    return 'Tanggal tidak valid'
  }

  const day = d.getDate()
  const month = INDONESIAN_MONTHS[d.getMonth()]
  const year = d.getFullYear()

  return `${day} ${month} ${year}`
}

/**
 * Format date range in Indonesian
 */
export function formatDateRange(
  startDate: Date | string | number,
  endDate: Date | string | number,
  format: 'full' | 'long' | 'medium' | 'short' = 'medium'
): string {
  const start = formatIndonesianDate(startDate, format)
  const end = formatIndonesianDate(endDate, format)
  
  return `${start} - ${end}`
}

/**
 * Get Indonesian day name
 */
export function getIndonesianDayName(date: Date | string | number, short: boolean = false): string {
  const d = new Date(date)
  const dayOfWeek = d.getDay()
  
  return short ? INDONESIAN_DAYS_SHORT[dayOfWeek] : INDONESIAN_DAYS[dayOfWeek]
}

/**
 * Get Indonesian month name
 */
export function getIndonesianMonthName(monthIndex: number): string {
  return INDONESIAN_MONTHS[monthIndex] || 'Bulan tidak valid'
}

/**
 * Parse Indonesian date string to Date object
 */
export function parseIndonesianDate(dateString: string): Date | null {
  // Handle various Indonesian date formats
  const formats = [
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // DD/MM/YYYY
    /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/, // DD/MM/YY
    /^(\d{1,2})\s+(\w+)\s+(\d{4})$/, // DD Month YYYY
  ]

  for (const format of formats) {
    const match = dateString.match(format)
    if (match) {
      if (format === formats[0] || format === formats[1]) {
        // DD/MM/YYYY or DD/MM/YY
        const day = parseInt(match[1])
        const month = parseInt(match[2]) - 1 // Month is 0-indexed
        let year = parseInt(match[3])
        
        if (year < 100) {
          year += year < 50 ? 2000 : 1900
        }
        
        return new Date(year, month, day)
      } else if (format === formats[2]) {
        // DD Month YYYY
        const day = parseInt(match[1])
        const monthName = match[2]
        const year = parseInt(match[3])
        const monthIndex = INDONESIAN_MONTHS.findIndex(m => 
          m.toLowerCase() === monthName.toLowerCase()
        )
        
        if (monthIndex !== -1) {
          return new Date(year, monthIndex, day)
        }
      }
    }
  }

  return null
}