/** Editorial gate: only reviewed translations are public. */
export const locales = {
  en: { label: "English", dir: "ltr", published: true },
  ur: { label: "اردو", dir: "rtl", published: false },
  sd: { label: "سنڌي", dir: "rtl", published: false },
} as const;

export type Locale = keyof typeof locales;
export const publishedLocales = (Object.keys(locales) as Locale[]).filter(
  (locale) => locales[locale].published,
);
export function directionFor(locale: Locale) {
  return locales[locale].dir;
}
