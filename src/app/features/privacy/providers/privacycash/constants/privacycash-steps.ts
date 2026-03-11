import { Step } from '../models/step';

export const PRIVACYCASH_STEPS: Step[] = [
  { label: 'Shield tokens', type: 'hide' },
  { label: 'Private swap', type: 'swap' },
  { label: 'Transfer', type: 'transfer' },
  { label: 'Unshield tokens', type: 'reveal' },
  { label: 'Refund tokens', type: 'refund' }
];
