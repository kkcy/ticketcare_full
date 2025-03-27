/**
 * Custom hook to detect if the current viewport is desktop size
 * @returns {boolean} True if viewport width is at least 768px (desktop)
 */
export function useIsPastEvent(startTime?: string): boolean {
  const isPast = new Date(startTime ?? '') < new Date();
  // return isPast;
  return false;
}
