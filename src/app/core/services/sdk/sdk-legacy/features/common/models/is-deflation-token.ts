export type IsDeflationToken =
  | {
      isDeflation: false;
    }
  | {
      isDeflation: true;
      isWhitelisted: boolean;
    };
