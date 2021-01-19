import {Web3ApiService} from '../web3Api/web3-api.service';
import {IBridgeToken} from './types';
import {RubicError} from '../../errors/RubicError';
import BigNumber from 'bignumber.js';

export class BridgeTransaction {
    public txHash: string;
    constructor(
        public txId: string,
        public network: string,
        public token: IBridgeToken,
        public status: string,
        public depositAddress: string,
        public amount: BigNumber,
        public toAddress: string,
        public web3Api: Web3ApiService) {
    }

    public async sendDeposit(onTransactionHash?: (hash: string) => void): Promise<void> {
        let address;
        let decimals;
        switch (this.network) {
            case "ETH":
                address = this.token.ethContractAddress;
                decimals = this.token.ethContractDecimal;
                break
            case "BSC":
                address = this.token.bscContractAddress;
                decimals = this.token.bscContractDecimal;
                break
            default :
                throw new RubicError(`The ${this.network} network is not supported`);
        }

        const realAmount = this.amount.multipliedBy(10 ** decimals);

        const res =  await this.web3Api.transferTokens(address, this.depositAddress, realAmount.toString(), onTransactionHash);
        console.log(res);
        this.txHash = res;
    }
}
