/**
 * Theme-Aware GooeyToaster Wrapper
 *
 * Reads the resolved theme from ThemeContext and passes it to GooeyToaster
 * so toast blobs match the current light/dark appearance.
 */

import { GooeyToaster } from 'goey-toast';
import { useTheme } from '../../hooks/useTheme';

export function ThemeAwareToaster() {
  const { resolvedTheme } = useTheme();

  return <GooeyToaster position="bottom-right" theme={resolvedTheme} duration={5000} />;
}
