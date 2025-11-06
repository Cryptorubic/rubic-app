import { XyQuoteErrorResponse } from './xy-quote-error-response';
import { XyRoute } from './xy-quote-success-response';

export interface XyBuildTxResponse extends XyQuoteErrorResponse {
  success: boolean;
  route: XyRoute;
  tx: {
    to: string;
    data: string;
    value: string;
  };
}
