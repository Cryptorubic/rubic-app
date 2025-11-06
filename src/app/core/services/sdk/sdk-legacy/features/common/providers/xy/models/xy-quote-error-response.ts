import { XyErrorCode } from '../constants/xy-error-code';

export interface XyQuoteErrorResponse {
  success: boolean;
  errorCode: XyErrorCode;
  errorMsg: string;
}
