export interface LimitOrderApiResponse {
  createDateTime: string;
  data: {
    makerAsset: string;
    takerAsset: string;
    makingAmount: string;
    takingAmount: string;
  };
  orderInvalidReason: null | string;
}
