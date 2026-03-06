import { Step } from '../models/step';

export const PRIVACYCASH_STEPS: Step[] = [
  { label: 'Hide tokens', type: 'hide' },
  { label: 'Private swap', type: 'swap' },
  { label: 'Transfer', type: 'transfer' },
  { label: 'Reveal tokens', type: 'reveal' }
  // { label: 'Refund tokens', type: 'refund' }
];
