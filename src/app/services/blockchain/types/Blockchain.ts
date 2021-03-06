export enum BLOCKCHAIN_NAME {
  ETHEREUM = 'ETH',
  BINANCE_SMART_CHAIN = 'BSC',
  MATIC = 'MAT'
}

export interface IBlockchain {
  name: BLOCKCHAIN_NAME;
  id: Number;
}

export const BLOCKCHAINS: {
  networksList: IBlockchain[];
  getBlockchainById(id: Number | string): IBlockchain;
  getBlockchainByName(name: BLOCKCHAIN_NAME): IBlockchain;
} = {
  networksList: [
    {
      name: BLOCKCHAIN_NAME.ETHEREUM,
      id: 1
    },
    {
      name: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      id: 56
    },
    {
      name: BLOCKCHAIN_NAME.MATIC,
      id: 137
    }
  ],
  getBlockchainById(id: Number | string): IBlockchain {
    return this.networksList.find(network => network.id === Number(id));
  },
  getBlockchainByName(name: BLOCKCHAIN_NAME): IBlockchain {
    return this.networksList.find(network => network.name === name);
  }
};
