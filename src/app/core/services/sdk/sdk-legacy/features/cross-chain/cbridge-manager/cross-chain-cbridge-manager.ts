import { BlockchainName } from '@cryptorubic/core';
import { TransactionReceipt } from 'viem';

export class CrossChainCbridgeManager {
    public static async makeRefund(
        _fromBlockchain: BlockchainName,
        _sourceTransaction: string,
        _estimateAmount: string,
        _onTransactionHash: (hash: string) => void
    ): Promise<TransactionReceipt | null> {
        // const txData = Injector.rubicApiService.;
        //
        // return Injector.web3PrivateService
        //     .getWeb3Private(CHAIN_TYPE.EVM)
        //     .trySendTransaction(
        //         cbridgeContractAddress[fromBlockchain].providerRouter,
        //         cbridgeContractAbi,
        //         'withdraw',
        //         [wdmsg, sigs, signers, powers],
        //         {
        //             onTransactionHash
        //         }
        //     );
        // @TODO API
        throw new Error('Not supported yet');
    }
}
