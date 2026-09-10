"use client"

import * as React from "react"
import { Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface RadioGroupContextValue {
  value?: string
  onValueChange?: (val: string) => void
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>({})

export function RadioGroup({
  className,
  value,
  onValueChange,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  value?: string
  onValueChange?: (val: string) => void
}) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div
        role="radiogroup"
        data-slot="radio-group"
        className={cn("grid gap-2", className)}
        {...props}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}

export function RadioGroupItem({
  className,
  value,
  id,
  ...props
}: React.ComponentProps<"button"> & {
  value: string
}) {
  const context = React.useContext(RadioGroupContext)
  const isChecked = context.value === value

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isChecked}
      data-state={isChecked ? "checked" : "unchecked"}
      id={id}
      onClick={() => context.onValueChange?.(value)}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-[#319795] text-[#319795] shadow-2xs focus:outline-none focus-visible:ring-1 focus-visible:ring-[#319795] disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center cursor-pointer shrink-0 transition-colors",
        isChecked ? "bg-[#319795] border-[#319795]" : "border-slate-300 bg-white hover:border-[#319795]",
        className
      )}
      {...props}
    >
      {isChecked && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
    </button>
  )
}
