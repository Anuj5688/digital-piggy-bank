import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert cents to dollars for display
export function formatMoney(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

// Convert dollar input to cents for API
export function toCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function formatDate(dateStr: string | Date): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function getInitials(firstName?: string | null, lastName?: string | null, email?: string | null): string {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (firstName) return firstName[0].toUpperCase();
  if (email) return email.substring(0, 2).toUpperCase();
  return "??";
}
