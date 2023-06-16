import { GasPrice } from 'rubic-sdk/lib';

/**
 * Calculates standard deviation for a given set of numbers
 * @param gasPrices Gas price values
 * @returns Standard deviation
 */
export const calculateDeviation = (gasPrices: number[]) => {
  const average = gasPrices.reduce((acc, price) => acc + price, 0) / gasPrices.length;
  const deviation = gasPrices.reduce((acc, price) => acc + Math.pow(price - average, 2), 0);
  return Math.sqrt(deviation / (gasPrices.length - 1));
};

/**
 * Decides which values to use, based on calculated standard deviation
 * @param gasPrices List of gas prices from different sources
 * @param deviation Standard Deviation of gas prices
 * @returns Average value
 */
export const calculateAverageValue = (gasPrices: number[], deviation: number): string => {
  const MAX_ALLOWED_DEVIATION = 10_000_000_000;
  const MAX_ALLOWED_DIFF = 20_000_000_000;

  if (deviation === 0) {
    return gasPrices[0].toFixed();
  }

  if (deviation <= MAX_ALLOWED_DEVIATION) {
    return Math.round(
      gasPrices.reduce((acc, price) => acc + price, 0) / gasPrices.length
    ).toFixed();
  }

  const sorted = gasPrices.sort((a, b) => a - b);
  const cleanData: number[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i] - sorted[i + 1] < MAX_ALLOWED_DIFF) {
      cleanData.push(sorted[i]);
    }
  }

  return Math.round(cleanData.reduce((acc, price) => acc + price, 0) / gasPrices.length).toFixed();
};

/**
 * Calculates average gas price, with taking standard deviation into account
 * @param estimations Gas price estimations from different sources
 * @returns Average EIP-1559 compatible gas price values
 */
export const getAverageGasPrice = (estimations: GasPrice[]): GasPrice => {
  if (estimations.length === 1) return estimations[0];

  const [baseFees, maxFeesPerGas, maxPriorityFeesPerGas] = [
    estimations.map(estimation => Number(estimation.baseFee)),
    estimations.map(estimation => Number(estimation.maxFeePerGas)),
    estimations.map(estimation => Number(estimation.maxPriorityFeePerGas))
  ];

  const baseFeeDeviation = calculateDeviation(baseFees);
  const maxFeePerGasDeviation = calculateDeviation(maxFeesPerGas);
  const maxPriorityFeePerGasDeviation = calculateDeviation(maxPriorityFeesPerGas);

  return {
    baseFee: calculateAverageValue(baseFees, baseFeeDeviation),
    maxFeePerGas: calculateAverageValue(maxFeesPerGas, maxFeePerGasDeviation),
    maxPriorityFeePerGas: calculateAverageValue(
      maxPriorityFeesPerGas,
      maxPriorityFeePerGasDeviation
    )
  };
};
