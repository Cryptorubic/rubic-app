interface BaseScrollTransaction {
    readonly amount: string;
    readonly blockNumber: number;
    readonly blockTimestamp: string;
    readonly hash: string;
    readonly isL1: boolean;
    readonly to: string;
}

interface ApiScrollTransaction extends BaseScrollTransaction {
    readonly finalizeTx?: BaseScrollTransaction;
}

export interface ScrollApiResponse {
    data: {
        readonly result: (ApiScrollTransaction | null)[];
    };
}
