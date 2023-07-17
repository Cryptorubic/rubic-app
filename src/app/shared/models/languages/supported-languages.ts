export const SUPPORTED_LANGUAGES = ['en', 'es', 'ko', 'ru', 'zh', 'tr', 'fr'];

export type SupportedLanguages = (typeof SUPPORTED_LANGUAGES)[number];

export function isSupportedLanguage(lng: string): lng is SupportedLanguages {
  return SUPPORTED_LANGUAGES.some(supLng => supLng === lng);
}
