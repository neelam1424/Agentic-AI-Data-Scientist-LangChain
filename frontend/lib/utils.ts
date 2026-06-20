import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmt(n: number, decimals = 4) {
  return n.toFixed(decimals)
}

export function pct(n: number) {
  return `${(n * 100).toFixed(1)}%`
}
