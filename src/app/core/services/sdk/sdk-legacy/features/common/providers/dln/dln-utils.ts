import {
  BLOCKCHAIN_NAME,
  BlockchainName,
  BlockchainsInfo,
  CHAIN_TYPE,
  Token
} from '@cryptorubic/core';

export class DlnUtils {
  public static getSupportedAddress(token: Token): string {
    if (token.blockchain === BLOCKCHAIN_NAME.SOLANA && token.isNative) {
      return '11111111111111111111111111111111';
    }
    return token.address;
  }

  public static getFakeReceiver(blockchain: BlockchainName): string {
    const type = BlockchainsInfo.getChainType(blockchain);
    if (type === CHAIN_TYPE.EVM) {
      return '0xe388Ed184958062a2ea29B7fD049ca21244AE02e';
    }
    if (type === CHAIN_TYPE.SOLANA) {
      return 'HZgssrdZjBdypDux7tHWWDZ7hF7hhwUXN445t85GaoQT';
    }
    throw new Error('Chain type is not supported');
  }
}
