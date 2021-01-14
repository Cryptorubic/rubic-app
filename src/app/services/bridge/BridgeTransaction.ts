import {Web3ApiService} from '../web3Api/web3-api.service';

class BridgeTransaction {
    constructor(
        public txId: string,
        public status: string,
        public depositAddress: string,
        public amount,
        public toAddress: string,
        public web3Api: Web3ApiService) {

    }

    public sendDeposit() {

    }
}
