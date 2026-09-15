import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn/ui expects this helper to live here — keep the path. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
