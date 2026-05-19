import { BLOCKCHAIN_NAME, BlockchainName } from '@cryptorubic/core';

const ALTERNATIVE_ROUTER1_NETWORKS = [
  BLOCKCHAIN_NAME.LINEA,
  BLOCKCHAIN_NAME.BASE,
  BLOCKCHAIN_NAME.MANTLE,
  BLOCKCHAIN_NAME.SCROLL,
  BLOCKCHAIN_NAME.MANTA_PACIFIC,
  BLOCKCHAIN_NAME.METIS,
  BLOCKCHAIN_NAME.BLAST,
  BLOCKCHAIN_NAME.ROOTSTOCK,
  BLOCKCHAIN_NAME.HORIZEN_EON,
  BLOCKCHAIN_NAME.MERLIN,
  BLOCKCHAIN_NAME.MODE,
  BLOCKCHAIN_NAME.ZK_FAIR,
  BLOCKCHAIN_NAME.ZETACHAIN,
  BLOCKCHAIN_NAME.XLAYER,
  BLOCKCHAIN_NAME.TAIKO,
  BLOCKCHAIN_NAME.SEI,
  BLOCKCHAIN_NAME.CORE,
  BLOCKCHAIN_NAME.BAHAMUT,
  BLOCKCHAIN_NAME.BITLAYER,
  BLOCKCHAIN_NAME.FLARE
  // BLOCKCHAIN_NAME.SONIC,
  // BLOCKCHAIN_NAME.MORPH
] as const;

function isAlternativeRouter1Network(blockchain: BlockchainName): boolean {
  return ALTERNATIVE_ROUTER1_NETWORKS.some(chain => chain === blockchain);
}

export const rubicProxyContractAddress: Record<
  BlockchainName,
  {
    gateway: string;
    router: string;
  }
> = Object.values(BLOCKCHAIN_NAME).reduce(
  (acc, blockchain) => {
    // ERC20Proxy
    let gateway = '0x3335733c454805df6a77f825f266e136FB4a3333';
    // RubicMultiProxy
    let router = '0x6AA981bFF95eDfea36Bdae98C26B274FfcafE8d3';

    if (blockchain === BLOCKCHAIN_NAME.TELOS) {
      router = '0xA2d8CF32C16f070702c45a5686Fdb0a1d7171AAD';
    }
    if (blockchain === BLOCKCHAIN_NAME.ZK_SYNC) {
      router = '0xa63c029612ddaD00A269383Ab016D1e7c14E851D';
      gateway = '0x8E70e517057e7380587Ea6990dAe81cB1Ba405ce';
    }
    if (isAlternativeRouter1Network(blockchain)) {
      router = '0xAf14797CcF963B1e3d028a9d51853acE16aedBA1';
    }
    if (blockchain === BLOCKCHAIN_NAME.ZK_LINK) {
      router = '0x1a979E2386595837BaAB90Ba12B2E2a71C652576';
      gateway = '0x72f4Cd2a1707CbecE96E82be21f243fdF93867ee';
    }

    return { ...acc, [blockchain]: { gateway, router } };
  },
  {} as Record<
    BlockchainName,
    {
      gateway: string;
      router: string;
    }
  >
);
