import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, language: 'ar' | 'en', currency: 'SAR' | 'USD' = 'SAR') {
  if (currency === 'USD') {
    if (language === 'ar') {
      return `${amount.toLocaleString('ar-SA')} $`;
    }
    return `$${amount.toLocaleString('en-US')}`;
  }

  // SAR currency
  if (language === 'ar') {
    return `${amount.toLocaleString('ar-SA')} ﷼`; // Using Saudi Riyal symbol
  }
  return `﷼${amount.toLocaleString('en-US')}`;
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
    // Force Gregorian calendar (ar-SA defaults to Hijri)
    return date.toLocaleDateString('ar-SA-u-ca-gregory', {
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
