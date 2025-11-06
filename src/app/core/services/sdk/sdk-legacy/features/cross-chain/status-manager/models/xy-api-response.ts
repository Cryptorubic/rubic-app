export interface XyApiResponse {
  success: boolean;
  msg: string;
  status:
    | 'Done'
    | 'Processing'
    | 'Not Found'
    | 'Receive bridge token'
    | 'Receive synapse bridge token'
    | 'Pending refund'
    | 'Refunded';
  tx: string | null;
}
