export interface ExpirationOption {
  label: string;
  minutes: number;
}

export const expirationOptions: ExpirationOption[] = [
  {
    label: '1 minute',
    minutes: 1
  },
  {
    label: '10 minutes',
    minutes: 10
  },
  {
    label: '1 hour',
    minutes: 60
  },
  {
    label: '1 day',
    minutes: 24 * 60
  },
  {
    label: '7 days',
    minutes: 7 * 24 * 60
  }
];
