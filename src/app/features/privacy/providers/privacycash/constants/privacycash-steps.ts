import { Step } from '../models/step';

export const PRIVACYCASH_STEPS: Step[] = [
  { label: 'Shield tokens', type: 'hide' },
  { label: 'Transfer tokens', type: 'transfer' },
  { label: 'Swap tokens', type: 'swap' },
  { label: 'Unshield tokens', type: 'reveal' },
  { label: 'Refund tokens', type: 'refund' }
];
