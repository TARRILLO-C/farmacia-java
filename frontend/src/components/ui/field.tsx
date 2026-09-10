import * as React from "react"
import { cn } from "@/lib/utils"

export function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical"
}) {
  return (
    <div
      data-slot="field"
      className={cn(
        "flex rounded-xl transition-colors",
        orientation === "horizontal"
          ? "items-center justify-between gap-4 p-3 border border-slate-200/80 bg-white hover:border-[#319795]/40 hover:bg-slate-50/50 has-[[data-state=checked]]:border-[#319795] has-[[data-state=checked]]:bg-teal-50/20"
          : "flex-col gap-1.5",
        className
      )}
      {...props}
    />
  )
}

export function FieldLabel({
  className,
  ...props
}: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="field-label"
      className={cn("block cursor-pointer", className)}
      {...props}
    />
  )
}

export function FieldContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn("flex flex-col gap-0.5 min-w-0 flex-1", className)}
      {...props}
    />
  )
}

export function FieldTitle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-title"
      className={cn("text-xs font-bold text-slate-800", className)}
      {...props}
    />
  )
}

export function FieldDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn("text-[11px] text-slate-500 line-clamp-2", className)}
      {...props}
    />
  )
}
