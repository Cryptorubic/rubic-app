export interface RubicApiErrorDto {
  /**
   * Error code
   */
  code: number;

  /**
   * Error message
   */
  reason: string;

  /**
   * Error specific data
   */
  data?: object;
}

export interface RubicApiError extends RubicApiErrorDto {
  type: string;
}
