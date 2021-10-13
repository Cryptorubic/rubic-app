// @ts-ignore
import config from 'src/test/enviroment.test.json';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

/**
 * Stub for unit tests.
 */
export default () => {
  return {
    connectionLinks: [
      {
        blockchainName: BLOCKCHAIN_NAME.ETHEREUM,
        rpcLink: config.providerLink
      },
      {
        blockchainName: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
        rpcLink: 'https://data-seed-prebsc-1-s1.binance.org:8545'
      },
      {
        blockchainName: BLOCKCHAIN_NAME.POLYGON,
        rpcLink: 'https://rpc-mumbai.maticvigil.com'
      }
    ],
    getBlockchainRpcLink(blockchainName: BLOCKCHAIN_NAME) {
      return this.connectionLinks.find(
        (connection: { blockchainName: BLOCKCHAIN_NAME }) =>
          connection.blockchainName === blockchainName
      )?.rpcLink;
    }
  };
};
