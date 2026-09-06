"use client"

import * as React from "react"
import { Dialog as DrawerPrimitive } from "radix-ui"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DrawerProps extends React.ComponentProps<typeof DrawerPrimitive.Root> {
  showSwipeHandle?: boolean
  swipeDirection?: "left" | "right" | "top" | "down"
}

function Drawer({
  children,
  showSwipeHandle,
  swipeDirection,
  ...props
}: DrawerProps) {
  return (
    <DrawerPrimitive.Root data-slot="drawer" {...props}>
      {children}
    </DrawerPrimitive.Root>
  )
}

interface DrawerTriggerProps extends React.ComponentProps<typeof DrawerPrimitive.Trigger> {
  render?: React.ReactNode
}

function DrawerTrigger({
  render,
  children,
  ...props
}: DrawerTriggerProps) {
  if (render) {
    return (
      <DrawerPrimitive.Trigger data-slot="drawer-trigger" asChild {...props}>
        {render}
      </DrawerPrimitive.Trigger>
    )
  }
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props}>{children}</DrawerPrimitive.Trigger>
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
}

interface DrawerCloseProps extends React.ComponentProps<typeof DrawerPrimitive.Close> {
  render?: React.ReactNode
}

function DrawerClose({
  render,
  children,
  ...props
}: DrawerCloseProps) {
  if (render) {
    return (
      <DrawerPrimitive.Close data-slot="drawer-close" asChild {...props}>
        {render}
      </DrawerPrimitive.Close>
    )
  }
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props}>{children}</DrawerPrimitive.Close>
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 backdrop-blur-xs drawer-overlay",
        className
      )}
      {...props}
    />
  )
}

function DrawerContent({
  className,
  children,
  side = "right",
  showHandle = false,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content> & {
  side?: "left" | "right" | "bottom" | "top"
  showHandle?: boolean
}) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          "fixed z-50 flex flex-col bg-white shadow-2xl focus:outline-none overflow-hidden will-change-transform",
          side === "right" &&
            "inset-y-2 right-2 h-[calc(100vh-1rem)] w-[calc(100vw-1rem)] rounded-3xl border border-slate-200/90 drawer-content-right",
          side === "left" &&
            "inset-y-2 left-2 h-[calc(100vh-1rem)] w-[calc(100vw-1rem)] rounded-3xl border border-slate-200/90 drawer-content-left",
          side === "bottom" &&
            "inset-x-2 bottom-2 max-h-[92vh] rounded-3xl border border-slate-200/90 drawer-content-bottom",
          side === "top" &&
            "inset-x-2 top-2 max-h-[92vh] rounded-3xl border border-slate-200/90 drawer-content-top",
          className
        )}
        {...props}
      >
        {showHandle && side === "bottom" && (
          <div className="mx-auto mt-3 h-1.5 w-14 rounded-full bg-slate-300 shrink-0" />
        )}
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
}

function DrawerHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex flex-col gap-1.5 p-4 sm:p-6 text-left", className)}
      {...props}
    />
  )
}

function DrawerFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn(
        "mt-auto flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 p-4 sm:px-6 sm:py-4 border-t border-slate-100 bg-slate-50/70",
        className
      )}
      {...props}
    />
  )
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("text-lg font-bold text-[#1a365d] tracking-tight", className)}
      {...props}
    />
  )
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-xs text-slate-500", className)}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
