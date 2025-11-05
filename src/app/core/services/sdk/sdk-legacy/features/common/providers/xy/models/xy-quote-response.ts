import { XyQuoteErrorResponse } from './xy-quote-error-response';
import { XyQuoteSuccessResponse } from './xy-quote-success-response';

export interface XyQuoteResponse extends XyQuoteSuccessResponse, XyQuoteErrorResponse {}
