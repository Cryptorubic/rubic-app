export const PRIVATE_ACTIONS = ['Swap', 'Transfer', 'Bridge'] as const;

export type PrivateAction = (typeof PRIVATE_ACTIONS)[number];
