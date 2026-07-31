export const locales = ["pt"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "pt";
