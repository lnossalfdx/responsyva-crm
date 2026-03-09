import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-2xl border text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        default:
          "border-emerald-400/30 bg-emerald-400/15 text-emerald-100 shadow-[0_0_30px_rgba(52,211,153,0.16)] hover:border-emerald-300/50 hover:bg-emerald-400/20",
        secondary:
          "border-white/10 bg-white/5 text-zinc-100 hover:border-white/15 hover:bg-white/10",
        ghost:
          "border-transparent bg-transparent text-zinc-300 hover:bg-white/10 hover:text-white",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-11 px-4",
        lg: "h-12 px-5",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
