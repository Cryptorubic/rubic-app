import { AbiItem } from '@cryptorubic/web3';

export interface ContractParams {
    /**
     * Contract address in source network.
     */
    contractAddress: string;

    /**
     * Contract abi in source network.
     */
    contractAbi: AbiItem[];

    /**
     * Method's name to call in contract.
     */
    methodName: string;

    /**
     * Method's arguments to call method with.
     */
    methodArguments: unknown[];

    /**
     * Value in Wei to send with transaction.
     */
    value: string;
}
