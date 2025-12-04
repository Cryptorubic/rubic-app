export interface BridgersGetTransDataByIdRequest {
  orderId: string;
}

export interface BridgersGetTransDataByIdResponse {
  data: {
    status: string;
    toHash: string;
  };
}
