import { parseError } from '@repo/observability/error';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';
import qs from 'qs'

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const handleError = (error: unknown): void => {
  const message = parseError(error);

  toast.error(message);
};

export const urlSerialize = (url: string, params: unknown | []) => {
  if (typeof params === 'object' || Array.isArray(params)) {
    const matches = url.match(/^(.+?)(\?(.*))?$/)
    const urlWithoutQueryString = (matches && matches[1]) || url
    const queryStringDataFromUrl =
      matches && matches[3] ? qs.parse(matches[3]) : {}
    const queryString = qs.stringify(
      { ...queryStringDataFromUrl, ...params },
      { arrayFormat: 'indices' }
    )
    if (queryString) {
      return `${urlWithoutQueryString}?${queryString}`
    }
    return url
  }

  return url
}

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

export const formatDateRange = (startDate: Date, endDate: Date) => {
  // Helper function to get month name
  const getMonthName = (date: Date) => {
    return date.toLocaleString('default', { month: 'long' });
  };

  // Helper function to format single date
  const formatSingleDate = (date: Date) => {
    return `${date.getDate()} ${getMonthName(date)}, ${date.getFullYear()}`;
  };

  // Helper function to format date range
  const formatDateRange = (start: Date, end: Date) => {
    // Check if start and end are the same day
    const sameDay = start.getDate() === end.getDate() &&
      start.getMonth() === end.getMonth() &&
      start.getFullYear() === end.getFullYear();

    if (sameDay) {
      return formatSingleDate(start);
    }

    const sameMonth = start.getMonth() === end.getMonth() &&
      start.getFullYear() === end.getFullYear();

    if (sameMonth) {
      return `${start.getDate()}-${end.getDate()} ${getMonthName(start)}, ${start.getFullYear()}`;
    } else {
      return `${start.getDate()} ${getMonthName(start)} - ${end.getDate()} ${getMonthName(end)}, ${end.getFullYear()}`;
    }
  };

  // Handle cases where dates might not be provided
  if (!startDate || !endDate) {
    return null;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  return formatDateRange(start, end);
};

export const formatTimeRange = (startTime: Date, endTime: Date) => {
  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    const hour12 = hours % 12 || 12;

    // Pad minutes with leading zero if needed
    const formattedMinutes = minutes.toString().padStart(2, '0');

    return `${hour12}:${formattedMinutes}`;
  };

  const getDayOfWeek = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Handle cases where times might not be provided
  if (!startTime || !endTime) {
    return null;
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  // Get period (AM/PM) for end time only since we'll display it once at the end
  const endPeriod = end.getHours() >= 12 ? 'PM' : 'AM';

  // Check if both times are on the same day
  const sameDay = start.toDateString() === end.toDateString();

  if (!sameDay) {
    return null; // Or handle different days case if needed
  }

  return `${formatTime(start)} - ${formatTime(end)} ${endPeriod} (${getDayOfWeek(start)})`

};

export const generateDateRange = (startDate: Date, endDate: Date) => {
  const dates = [];
  const currentDate = new Date(startDate);
  const end = new Date(endDate);

  // Reset time part to ensure we only compare dates
  currentDate.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  // Loop until we reach end date (inclusive)
  while (currentDate <= end) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};


type MobileOS = 'iOS' | 'Android' | 'desktop'

export const getMobileOperatingSystem = (): MobileOS => {
  const userAgent =
    navigator.userAgent || navigator.vendor || (window as any).opera

  // iOS detection
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return 'iOS'
  }

  // Android detection
  if (/android/i.test(userAgent)) {
    return 'Android'
  }

  return 'desktop'
}

interface NameParts {
  firstName: string;
  lastName: string | null;
}

export const parseFullName = (fullName: string): NameParts => {
  // Remove extra spaces and trim
  const cleanName = fullName.replace(/\s+/g, ' ').trim();

  if (!cleanName) {
    return {
      firstName: '',
      lastName: null
    };
  }

  const nameParts = cleanName.split(' ');

  if (nameParts.length === 1) {
    // Only first name provided
    return {
      firstName: nameParts[0],
      lastName: null
    };
  }

  // For multiple parts, take first part as firstName and rest as lastName
  const [firstName, ...lastNameParts] = nameParts;

  return {
    firstName,
    lastName: lastNameParts.join(' ')
  };
};
