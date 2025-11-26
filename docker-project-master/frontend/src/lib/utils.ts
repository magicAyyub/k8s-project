import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://backend:8000";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
