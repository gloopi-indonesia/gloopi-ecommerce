import { describe, it, expect } from 'vitest'
import { 
  formatIDR, 
  formatIDRNumber, 
  parseIDRToCents, 
  rupiahToCents, 
  centsToRupiah 
} from '../currency'

describe('Currency Utils', () => {
  describe('formatIDR', () => {
    it('should format IDR currency correctly', () => {
      const result = formatIDR(100000)
      expect(result).toContain('Rp')
      expect(result).toContain('1.000')
    })

    it('should handle zero values', () => {
      const result = formatIDR(0)
      expect(result).toContain('Rp')
      expect(result).toContain('0')
    })

    it('should handle large values', () => {
      const result = formatIDR(1000000)
      expect(result).toContain('Rp')
      expect(result).toContain('10.000')
    })
  })

  describe('formatIDRNumber', () => {
    it('should format IDR number without currency symbol', () => {
      expect(formatIDRNumber(100000)).toBe('1.000') // 1000 IDR
      expect(formatIDRNumber(1500000)).toBe('15.000') // 15000 IDR
      expect(formatIDRNumber(0)).toBe('0')
    })
  })

  describe('parseIDRToCents', () => {
    it('should parse IDR string to cents', () => {
      expect(parseIDRToCents('Rp 1.000')).toBe(100000) // 1000 IDR to cents
      expect(parseIDRToCents('1.500')).toBe(150000) // 1500 IDR to cents
      expect(parseIDRToCents('Rp1,500')).toBe(150000) // Handle comma separator
      expect(parseIDRToCents('10000')).toBe(1000000) // 10000 IDR to cents
    })

    it('should handle invalid input', () => {
      expect(parseIDRToCents('invalid')).toBe(0)
      expect(parseIDRToCents('')).toBe(0)
      expect(parseIDRToCents('Rp')).toBe(0)
    })

    it('should remove all currency symbols and separators', () => {
      expect(parseIDRToCents('Rp 1.500.000')).toBe(150000000) // 1,500,000 IDR
      expect(parseIDRToCents('Rp1,500,000')).toBe(150000000)
      expect(parseIDRToCents('1 500 000')).toBe(150000000)
    })
  })

  describe('rupiahToCents', () => {
    it('should convert rupiah to cents', () => {
      expect(rupiahToCents(1000)).toBe(100000) // 1000 IDR to cents
      expect(rupiahToCents(1500.5)).toBe(150050) // 1500.5 IDR to cents
      expect(rupiahToCents(0)).toBe(0)
    })

    it('should round to nearest cent', () => {
      expect(rupiahToCents(1000.004)).toBe(100000) // Rounds down
      expect(rupiahToCents(1000.006)).toBe(100001) // Rounds up
    })
  })

  describe('centsToRupiah', () => {
    it('should convert cents to rupiah', () => {
      expect(centsToRupiah(100000)).toBe(1000) // 100000 cents to 1000 IDR
      expect(centsToRupiah(150050)).toBe(1500.5) // 150050 cents to 1500.5 IDR
      expect(centsToRupiah(0)).toBe(0)
    })

    it('should handle decimal precision', () => {
      expect(centsToRupiah(1)).toBe(0.01) // 1 cent to 0.01 IDR
      expect(centsToRupiah(99)).toBe(0.99) // 99 cents to 0.99 IDR
    })
  })

  describe('round trip conversions', () => {
    it('should maintain precision in round trip conversions', () => {
      const originalRupiah = 1500.75
      const cents = rupiahToCents(originalRupiah)
      const backToRupiah = centsToRupiah(cents)
      
      expect(backToRupiah).toBe(originalRupiah)
    })

    it('should handle large numbers', () => {
      const originalRupiah = 1000000 // 1 million IDR
      const cents = rupiahToCents(originalRupiah)
      const backToRupiah = centsToRupiah(cents)
      
      expect(backToRupiah).toBe(originalRupiah)
      expect(cents).toBe(100000000) // 100 million cents
    })
  })
})