export function getFormattedTime(value: number, key: string): string {
  return value === 1 ? `1 ${key}` : `${value} ${key}s`;
}

export function getFormattedMinutes(minutes: number): string {
  return getFormattedTime(minutes, 'minute');
}

export function getFormattedHours(hours: number): string {
  return getFormattedTime(hours, 'hour');
}

export function getFormattedDays(days: number): string {
  return getFormattedTime(days, 'day');
}
