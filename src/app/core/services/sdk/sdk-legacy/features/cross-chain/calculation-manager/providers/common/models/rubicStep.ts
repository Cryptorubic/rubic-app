import { Token, TokenAmount } from '@cryptorubic/core';

export interface CrossChainStep {
    provider: string;
    type: 'cross-chain';
    path: (TokenAmount | Token)[];
}

interface OnChainStep {
    path: Token[];
    provider: string;
    type: 'on-chain';
}

export type RubicStep = CrossChainStep | OnChainStep;
