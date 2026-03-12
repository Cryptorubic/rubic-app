import { Step } from '../models/step';

export const PRIVACYCASH_STEPS: Step[] = [
  { label: 'Shield', type: 'hide' },
  { label: 'Transfer', type: 'transfer' },
  { label: 'Swap', type: 'swap' },
  { label: 'Unshield', type: 'reveal' },
  { label: 'Refund', type: 'refund' }
];
