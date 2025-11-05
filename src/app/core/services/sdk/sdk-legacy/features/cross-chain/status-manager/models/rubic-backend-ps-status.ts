export type RubicBackendPsStatus =
    | {
          status: 'SUCCESS';
          dest_transaction: string;
      }
    | { status: 'PENDING' };
