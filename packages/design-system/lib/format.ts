export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
  }).format(amount)
}

export function calculateTimeLeft(expiryDate: Date) {
  const now = new Date()
  const difference = expiryDate.getTime() - now.getTime()

  if (difference <= 0) {
    return {
      minutes: 0,
      seconds: 0,
    }
  }

  const minutes = Math.floor(difference / 1000 / 60)
  const seconds = Math.floor((difference / 1000) % 60)

  return {
    minutes,
    seconds,
  }
}
