import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function ensureString(envVar: string): string {
  const value = process.env[envVar]
  if (!value) {
    throw new Error(`Environment variable ${envVar} is not set`)
  }
  return value
}
