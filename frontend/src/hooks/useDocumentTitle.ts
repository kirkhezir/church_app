import { useEffect } from 'react';

const BASE_TITLE = 'Sing Buri Adventist Center';

/**
 * Sets the document title for SEO and browser tab display.
 * Automatically restores the base title on unmount.
 *
 * @param title - Page-specific title (will be appended: "title | Sing Buri Adventist Center")
 * @param titleThai - Optional Thai version of the title
 * @param language - Current language ('en' | 'th')
 */
export function useDocumentTitle(title: string, titleThai?: string, language?: string) {
  useEffect(() => {
    const displayTitle = language === 'th' && titleThai ? titleThai : title;
    document.title = displayTitle ? `${displayTitle} | ${BASE_TITLE}` : BASE_TITLE;

    return () => {
      document.title = BASE_TITLE;
    };
  }, [title, titleThai, language]);
}
