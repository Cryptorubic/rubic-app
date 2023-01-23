export interface ExpirationOption {
  label: string;
  minutes: number;
}

export const expirationOptions: ExpirationOption[] = [
  {
    label: '1 Minute',
    minutes: 1
  },
  {
    label: '10 Minutes',
    minutes: 10
  },
  {
    label: '1 Hour',
    minutes: 60
  },
  {
    label: '1 Day',
    minutes: 24 * 60
  },
  {
    label: '7 Days',
    minutes: 7 * 24 * 60
  }
];
