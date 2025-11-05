import { XyQuoteRequest } from './xy-quote-request';

export interface XyBuildTxRequest extends XyQuoteRequest {
    /**
     * Destination chain quote token receiver.
     */
    receiver: string;

    /**
     * Source chain bridge token address.
     */
    srcBridgeTokenAddress?: string;

    /**
     * Destination chain bridge token address.
     */
    dstBridgeTokenAddress?: string;
}
