export interface OptimizeResponse {
  withoutDestr: {
    celer: {
      input: number;
      output: number;
      loss: number;
    };
    deBridge: {
      input: number;
      output: number;
      loss: number;
    };
    symbiosis: {
      input: number;
      output: number;
      loss: number;
    };
  };
  optimizedDestr: {
    celer: {
      input: number;
      output: number;
      loss: number;
    };
    deBridge: {
      input: number;
      output: number;
      loss: number;
    };
    symbiosis: {
      input: number;
      output: number;
      loss: number;
    };
  };
  totalOutput: number;
  totalLoss: number;
}
