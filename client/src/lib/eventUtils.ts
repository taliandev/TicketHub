/**
 * Utility functions for event date handling
 */

export interface EventStatus {
  isExpired: boolean
  isEndingSoon: boolean // Còn < 7 ngày
  daysUntilEvent: number
  statusText: string
  statusColor: string
}

/**
 * Get event status based on date
 */
export const getEventStatus = (eventDate: string | Date): EventStatus => {
  const now = new Date()
  now.setHours(0, 0, 0, 0) // Reset to start of day
  
  const eventDateTime = new Date(eventDate)
  eventDateTime.setHours(0, 0, 0, 0) // Reset to start of day
  
  // Calculate days difference
  const diffTime = eventDateTime.getTime() - now.getTime()
  const daysUntilEvent = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  const isExpired = daysUntilEvent < 0
  const isEndingSoon = daysUntilEvent >= 0 && daysUntilEvent <= 7
  
  let statusText = ''
  let statusColor = ''
  
  if (isExpired) {
    statusText = 'Đã kết thúc'
    statusColor = 'text-red-600 bg-red-100'
  } else if (daysUntilEvent === 0) {
    statusText = 'Diễn ra hôm nay'
    statusColor = 'text-green-600 bg-green-100'
  } else if (isEndingSoon) {
    statusText = `Còn ${daysUntilEvent} ngày`
    statusColor = 'text-orange-600 bg-orange-100'
  } else {
    statusText = `Còn ${daysUntilEvent} ngày`
    statusColor = 'text-blue-600 bg-blue-100'
  }
  
  return {
    isExpired,
    isEndingSoon,
    daysUntilEvent,
    statusText,
    statusColor
  }
}

/**
 * Check if event booking is allowed
 */
export const canBookEvent = (eventDate: string | Date): boolean => {
  const status = getEventStatus(eventDate)
  return !status.isExpired
}

/**
 * Format event date for display
 */
export const formatEventDate = (eventDate: string | Date, locale: string = 'vi-VN'): string => {
  const date = new Date(eventDate)
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
