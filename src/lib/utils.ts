import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { randomInt } from 'crypto';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateVerificationCode(): string {
  return randomInt(100000, 999999).toString();
}