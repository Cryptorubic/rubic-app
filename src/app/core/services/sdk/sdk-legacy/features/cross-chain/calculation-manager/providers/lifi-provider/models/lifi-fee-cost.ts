import { Bridge } from './lifi-bridge-types';
import { Exchange, ExchangeAggregator } from './lifi-exchange-tools';
import { LifiTransactionRequest } from './lifi-transaction-request';
export type Substatus =
    | 'WAIT_SOURCE_CONFIRMATIONS'
    | 'WAIT_DESTINATION_TRANSACTION'
    | 'BRIDGE_NOT_AVAILABLE'
    | 'CHAIN_NOT_AVAILABLE'
    | 'REFUND_IN_PROGRESS'
    | 'UNKNOWN_ERROR'
    | 'COMPLETED'
    | 'PARTIAL'
    | 'REFUNDED'
    | 'NOT_PROCESSABLE_REFUND_NEEDED';

export interface FeeCost {
    name: string;
    description: string;
    percentage: string;
    token: Token;
    amount: string;
    amountUSD?: string;
    included: boolean;
}
interface Token {
    chainId: number;
    address: string;
    symbol: string;
    decimals: number;
    name: string;
    coinKey?: string;
    logoURI?: string;
    priceUSD: string;
}

export interface GasCost {
    type: 'SUM' | 'APPROVE' | 'SEND' | 'FEE';
    price: string;
    estimate: string;
    limit: string;
    amount: string;
    amountUSD: string;
    token: Token;
}
export interface Action {
    fromChainId: number;
    fromAmount: string;
    fromToken: Token;
    fromAddress?: string;
    toChainId: number;
    toToken: Token;
    toAddress?: string;
    slippage: number;
}
export interface Estimate {
    tool: string;
    fromAmount: string;
    fromAmountUSD?: string;
    toAmount: string;
    toAmountMin: string;
    toAmountUSD?: string;
    approvalAddress: string;
    feeCosts?: FeeCost[];
    gasCosts?: GasCost[];
    executionDuration: number;
}
export type Status =
    | 'NOT_STARTED'
    | 'STARTED'
    | 'ACTION_REQUIRED'
    | 'CHAIN_SWITCH_REQUIRED'
    | 'PENDING'
    | 'FAILED'
    | 'DONE'
    | 'RESUME'
    | 'CANCELLED';
export type ProcessType = 'TOKEN_ALLOWANCE' | 'SWITCH_CHAIN' | 'SWAP' | 'CROSS_CHAIN' | 'RECEIVING_CHAIN' | 'TRANSACTION';
export interface Process {
    startedAt: number;
    doneAt?: number;
    failedAt?: number;
    type: ProcessType;
    status: Status;
    substatus?: Substatus;
    message?: string;
    txHash?: string;
    txLink?: string;
    multisigTxHash?: string;
    error?: {
        code: string | number;
        message: string;
        htmlMessage?: string;
    };
    [key: string]: unknown;
}
export interface Execution {
    status: Status;
    process: Array<Process>;
    fromAmount?: string;
    toAmount?: string;
    toToken?: Token;
    gasPrice?: string;
    gasUsed?: string;
    gasToken?: Token;
    gasAmount?: string;
    gasAmountUSD?: string;
}
export declare const emptyExecution: Execution;
export declare const _StepType: readonly ['lifi', 'swap', 'cross', 'protocol', 'custom'];
export type StepType = (typeof _StepType)[number];
export type StepTool = string;
export interface StepBase {
    id: string;
    type: StepType;
    tool: StepTool;
    toolDetails: Pick<ExchangeAggregator | Exchange | Bridge, 'key' | 'name' | 'logoURI'>;
    integrator?: string;
    referrer?: string;
    action: Action;
    estimate?: Estimate;
    execution?: Execution;
    transactionRequest?: LifiTransactionRequest;
}
export interface DestinationCallInfo {
    toContractAddress: string;
    toContractCallData: string;
    toFallbackAddress: string;
    callDataGasLimit: string;
}
export type CallAction = Action & DestinationCallInfo;
export interface SwapStep extends StepBase {
    type: 'swap';
    action: Action;
    estimate: Estimate;
}
export interface CrossStep extends StepBase {
    type: 'cross';
    action: Action;
    estimate: Estimate;
}
export interface ProtocolStep extends StepBase {
    type: 'protocol';
    action: Action;
    estimate: Estimate;
}
export interface CustomStep extends StepBase {
    type: 'custom';
    action: CallAction;
    estimate: Estimate;
}
type Step = SwapStep | CrossStep | CustomStep | ProtocolStep;
export interface LifiStep extends Omit<Step, 'type'> {
    type: 'lifi';
    includedSteps: Step[];
}
