import { format } from 'date-fns';

// Format time for display
export const formatTime = (time: string | Date) => {
  return format(new Date(time), 'h:mm a');
};

// Format date for display
export const formatDate = (date: string | Date) => {
  return format(new Date(date), 'MMM d, yyyy');
};

// Format date & time for display
export const formatDateTime = (date: string | Date) => {
  return format(new Date(date), 'MMM d, yyyy h:mm a');
};
