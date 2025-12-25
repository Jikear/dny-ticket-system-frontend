/**
 * Format time string (HH:mm:ss) to short format (HH:mm)
 */
export function formatTime(time: string | null | undefined): string {
  if (!time) return '-'
  return time.substring(0, 5)
}

/**
 * Format time range
 */
export function formatTimeRange(startTime: string | null | undefined, endTime: string | null | undefined): string {
  if (!startTime || !endTime) return '-'
  return `${formatTime(startTime)} - ${formatTime(endTime)}`
}

/**
 * Format date range
 */
export function formatDateRange(startDate: string | null | undefined, endDate: string | null | undefined): string {
  if (!startDate || !endDate) return '-'
  return `${startDate} ~ ${endDate}`
}
