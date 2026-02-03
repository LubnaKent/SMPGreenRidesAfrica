export const locales = ['en', 'sw', 'lg'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  sw: 'Kiswahili',
  lg: 'Luganda',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  sw: '🇰🇪',
  lg: '🇺🇬',
};
