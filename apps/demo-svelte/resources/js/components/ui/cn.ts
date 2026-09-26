import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge class lists, letting later Tailwind utilities override earlier ones. */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
