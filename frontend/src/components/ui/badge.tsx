import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border px-2.5 py-0.5 text-xs font-bold whitespace-nowrap transition-all",
  {
    variants: {
      variant: {
        default: "bg-[#0f172a] text-white border-transparent shadow-xs",
        secondary: "bg-slate-100 text-slate-700 border-slate-200",
        destructive: "bg-rose-50 text-rose-700 border-rose-200",
        outline: "border-slate-300 text-slate-700 bg-white",
        teal: "bg-[#0d9488]/15 text-[#0f766e] border-[#0d9488]/30",
        emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
        amber: "bg-amber-50 text-amber-800 border-amber-200",
        blue: "bg-sky-50 text-sky-700 border-sky-200",
        purple: "bg-purple-50 text-purple-700 border-purple-200",
        ghost: "hover:bg-slate-100 text-slate-700 border-transparent",
        link: "text-[#0d9488] underline-offset-4 hover:underline border-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
