export const TAIKO_API_EVENT_TYPE = {
  SEND_ETH: 0,
  SEND_ERC20: 1
} as const;

export type TaikoApiEventType = (typeof TAIKO_API_EVENT_TYPE)[keyof typeof TAIKO_API_EVENT_TYPE];

export const TAIKO_API_STATUS = {
  NEW: 0,
  RETRIABLE: 1,
  DONE: 2,
  FAILED: 3
};

export type TaikoApiStatus = (typeof TAIKO_API_STATUS)[keyof typeof TAIKO_API_STATUS];

interface TaikoTransaction {
  readonly id: number;
  readonly name: string;
  readonly status: TaikoApiStatus;
  readonly eventType: TaikoApiEventType;
  readonly msgHash: string;
  readonly data: TaikoData;
}

interface TaikoData {
  readonly Raw: {
    readonly transactionHash: string;
  };
}

export interface TaikoApiResponse {
  readonly items: TaikoTransaction[];
}
