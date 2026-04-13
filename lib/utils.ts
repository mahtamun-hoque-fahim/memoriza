// lib/utils.ts
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 8)

export function generateSlug(): string {
  return nanoid()
}

export const OCCASION_LABELS: Record<string, string> = {
  anniversary: 'Anniversary',
  birthday:    'Birthday',
  valentine:   'Valentine\'s Day',
  graduation:  'Graduation',
  new_year:    'New Year',
  first_date:  'First Date',
  promotion:   'Job Promotion',
  custom:      'Custom',
}

export const OCCASION_ICONS: Record<string, string> = {
  anniversary: '💍',
  birthday:    '🎂',
  valentine:   '💝',
  graduation:  '🎓',
  new_year:    '🎆',
  first_date:  '🌹',
  promotion:   '🏆',
  custom:      '✨',
}

export const OCCASION_ACCENTS: Record<string, string> = {
  anniversary: '#FF6B9D',
  birthday:    '#F59E0B',
  valentine:   '#EF4444',
  graduation:  '#10B981',
  new_year:    '#6C63FF',
  first_date:  '#EC4899',
  promotion:   '#3B82F6',
  custom:      '#6C63FF',
}
