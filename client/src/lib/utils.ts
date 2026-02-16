import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, language: 'ar' | 'en') {
  if (language === 'ar') {
    return `${amount.toLocaleString('ar-SA')} ريال`;
  }
  return `SAR ${amount.toLocaleString('en-US')}`;
}

export function formatHijriDate(date: Date) {
  return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

export function formatGregorianDate(date: Date, language: 'ar' | 'en') {
  if (language === 'ar') {
    return date.toLocaleDateString('ar-SA', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
