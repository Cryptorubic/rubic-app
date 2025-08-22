export const CONVERSION_DIRECTION = {
  FROM: 'FROM',
  TO: 'TO'
};

export type ConversionDirection = (typeof CONVERSION_DIRECTION)[keyof typeof CONVERSION_DIRECTION];
