export type Permit2ApproveConfig =
    | {
          usePermit2Approve: false;
          permit2Address: null;
      }
    | {
          usePermit2Approve: true;
          permit2Address: string;
      };
