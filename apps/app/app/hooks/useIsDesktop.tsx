import { useMediaQuery } from '@repo/design-system/hooks/use-media-query';

/**
 * Custom hook to detect if the current viewport is desktop size
 * @returns {boolean} True if viewport width is at least 768px (desktop)
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 768px)');
}
