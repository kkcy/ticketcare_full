'use client'

import { forwardRef } from 'react'
import { Input } from './input'

export interface CardInputProps extends Omit<React.ComponentProps<"input">, 'onChange'> {
  onChange?: (value: string) => void
  type?: 'card' | 'expiry' | 'cvv'
}

const formatCardNumber = (value: string) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
  const matches = v.match(/\d{4,16}/g)
  const match = (matches && matches[0]) || ''
  const parts = []

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4))
  }

  if (parts.length) {
    return parts.join(' ')
  } else {
    return value
  }
}

const formatExpiryDate = (value: string) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
  if (v.length >= 2) {
    return v.slice(0, 2) + '/' + v.slice(2, 4)
  }
  return v
}

const CardInput = forwardRef<HTMLInputElement, CardInputProps>(
  ({ type = 'card', onChange, maxLength, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value
      
      if (type === 'card') {
        value = formatCardNumber(value)
        e.target.value = value
        onChange?.(value)
      } else if (type === 'expiry') {
        value = formatExpiryDate(value)
        e.target.value = value
        onChange?.(value)
      } else if (type === 'cvv') {
        value = value.replace(/[^0-9]/g, '')
        e.target.value = value
        onChange?.(value)
      }
    }

    const getMaxLength = () => {
      switch (type) {
        case 'card':
          return 19 // 16 digits + 3 spaces
        case 'expiry':
          return 5 // MM/YY
        case 'cvv':
          return 3
        default:
          return maxLength
      }
    }

    return (
      <Input
        {...props}
        ref={ref}
        maxLength={getMaxLength()}
        onChange={handleChange}
        inputMode="numeric"
        autoComplete={
          type === 'card'
            ? 'cc-number'
            : type === 'expiry'
            ? 'cc-exp'
            : type === 'cvv'
            ? 'cc-csc'
            : undefined
        }
      />
    )
  }
)

CardInput.displayName = 'CardInput'

export { CardInput }
