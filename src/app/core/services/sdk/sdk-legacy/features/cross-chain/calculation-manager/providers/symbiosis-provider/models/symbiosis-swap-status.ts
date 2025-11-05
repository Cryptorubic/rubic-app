export const SYMBIOSIS_SWAP_STATUS = {
    STUCKED: 'Stucked',
    REVERTED: 'Reverted',
    SUCCESS: 'Success',
    PENDING: 'Pending',
    NOT_FOUND: 'Not found'
} as const;

export type SymbiosisSwapStatus = (typeof SYMBIOSIS_SWAP_STATUS)[keyof typeof SYMBIOSIS_SWAP_STATUS];
