'use client'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from '@repo/design-system/components/ui/command'
import { Input } from '@repo/design-system/components/ui/input'
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@repo/design-system/components/ui/popover'
import { Skeleton } from '@repo/design-system/components/ui/skeleton'
import { cn } from '@repo/design-system/lib/utils'
import { Check } from 'lucide-react'
import React, { useMemo, useState } from 'react'

interface AutoCompleteProps<T extends string | number> {
  selectedValue: T
  onSelectedValueChange: (value: T) => void
  searchValue: string
  onSearchValueChange: (value: string) => void
  items: { value: T; label: string }[]
  isLoading?: boolean
  showSearchIcon?: boolean
  emptyMessage?: string | React.ReactNode
  placeholder?: string
  className?: string
  disabled?: boolean
}

function Autocomplete<T extends string | number>({
  selectedValue,
  onSelectedValueChange,
  searchValue,
  onSearchValueChange,
  items,
  isLoading,
  showSearchIcon = true,
  emptyMessage = 'No items.',
  placeholder = 'Search...',
  className,
  disabled,
}: AutoCompleteProps<T>) {
  const [open, setOpen] = useState(false)

  const labels = useMemo(
    () =>
      items.reduce(
        (acc, item) => {
          acc[String(item.value)] = item.label
          return acc
        },
        {} as Record<string, string>
      ),
    [items]
  )

  const reset = () => {
    onSelectedValueChange('' as T)
    onSearchValueChange('')
  }

  const onInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (
      !e.relatedTarget?.hasAttribute('cmdk-list') &&
      labels[String(selectedValue)] !== searchValue
    ) {
      reset()
    }
  }

  const onSelectItem = (inputValue: string) => {
    console.log(inputValue)
    if (inputValue === String(selectedValue)) {
      reset()
    } else {
      onSelectedValueChange(inputValue as T)
      onSearchValueChange(labels[inputValue] ?? '')
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Command shouldFilter={false}>
        <PopoverAnchor asChild>
          <CommandInput
            showSearchIcon={showSearchIcon}
            asChild
            value={searchValue}
            onValueChange={onSearchValueChange}
            onKeyDown={(e) => !disabled && setOpen(e.key !== 'Escape')}
            onMouseDown={() =>
              !disabled && setOpen((open) => !!searchValue || !open)
            }
            onFocus={() => setOpen(true)}
            onBlur={onInputBlur}
            disabled={disabled}
          >
            <Input placeholder={placeholder} />
          </CommandInput>
        </PopoverAnchor>
        {!open && <CommandList aria-hidden="true" className="hidden" />}
        <PopoverContent
          asChild
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            if (
              e.target instanceof Element &&
              e.target.hasAttribute('cmdk-input')
            ) {
              e.preventDefault()
            }
          }}
          className="w-[--radix-popover-trigger-width] p-0"
        >
          <CommandList>
            {isLoading && (
              <CommandLoading>
                <div className="p-1">
                  <Skeleton className="h-6 w-full" />
                </div>
              </CommandLoading>
            )}
            {items.length > 0 && !isLoading ? (
              <CommandGroup>
                {items.map((option) => (
                  <CommandItem
                    key={String(option.value)}
                    value={String(option.value)}
                    onMouseDown={(e) => e.preventDefault()}
                    onSelect={() => onSelectItem(String(option.value))}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        String(selectedValue) === String(option.value)
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
            {!isLoading ? (
              <CommandEmpty>
                {React.isValidElement(emptyMessage)
                  ? emptyMessage
                  : (emptyMessage ?? 'No items.')}
              </CommandEmpty>
            ) : null}
          </CommandList>
        </PopoverContent>
      </Command>
    </Popover>
  )
}

export { Autocomplete }
