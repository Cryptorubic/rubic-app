import { BLOCKCHAIN_NAME, BlockchainName } from '@cryptorubic/core';
import ADDRESS_TYPE from '@shared/models/blockchain/address-type';

type AddressTypeKeys = keyof typeof ADDRESS_TYPE;
type AddressTypeFields = { [K in AddressTypeKeys]: string };

interface ScannerObject extends AddressTypeFields {
  baseUrl: string;
  nativeCoinUrl: string;
}

export const blockchainScanner: Record<BlockchainName, ScannerObject> = {
  [BLOCKCHAIN_NAME.ETHEREUM]: {
    baseUrl: 'https://etherscan.io/',
    nativeCoinUrl: 'stat/supply/',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
    baseUrl: 'https://bscscan.com/',
    nativeCoinUrl: 'stat/supply/',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.POLYGON]: {
    baseUrl: 'https://polygonscan.com/',
    nativeCoinUrl: 'stat/supply/',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.POLYGON_ZKEVM]: {
    baseUrl: 'https://zkevm.polygonscan.com/',
    nativeCoinUrl: 'stat/supply/',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.HARMONY]: {
    baseUrl: 'https://explorer.harmony.one/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'address/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.AVALANCHE]: {
    baseUrl: 'https://snowtrace.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.MOONRIVER]: {
    baseUrl: 'https://moonriver.moonscan.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'address/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.FANTOM]: {
    baseUrl: 'https://ftmscan.com/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'address/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.ARBITRUM]: {
    baseUrl: 'https://arbiscan.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'address/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.AURORA]: {
    baseUrl: 'https://explorer.mainnet.aurora.dev/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'address/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.SOLANA]: {
    baseUrl: 'https://solscan.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.NEAR]: {
    baseUrl: 'https://explorer.near.org/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'accounts/',
    [ADDRESS_TYPE.TOKEN]: 'accounts/',
    [ADDRESS_TYPE.TRANSACTION]: 'transactions/',
    [ADDRESS_TYPE.BLOCK]: 'blocks/'
  },
  [BLOCKCHAIN_NAME.TELOS]: {
    baseUrl: 'https://www.teloscan.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'address/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.OPTIMISM]: {
    baseUrl: 'https://optimism.blockscout.com/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.CRONOS]: {
    baseUrl: 'https://cronoscan.com/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'address/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.OKE_X_CHAIN]: {
    baseUrl: 'https://www.oklink.com/en/okc/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'address/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.GNOSIS]: {
    baseUrl: 'https://blockscout.com/xdai/mainnet/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'address/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.FUSE]: {
    baseUrl: 'https://explorer.fuse.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'address/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.MOONBEAM]: {
    baseUrl: 'https://moonscan.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'address/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.CELO]: {
    baseUrl: 'https://explorer.celo.org/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'address/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.BOBA]: {
    baseUrl: 'https://bobascan.com/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.BOBA_BSC]: {
    baseUrl: 'https://blockexplorer.bnb.boba.network/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.ASTAR_EVM]: {
    baseUrl: 'https://blockscout.com/astar/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.ASTAR]: {
    baseUrl: 'https://astar.subscan.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.BITCOIN]: {
    baseUrl: 'https://blockchair.com/bitcoin/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'transaction/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.ETHEREUM_POW]: {
    baseUrl: 'https://www.oklink.com/en/ethw/',
    nativeCoinUrl: 'stat/supply/',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.TRON]: {
    baseUrl: 'https://tronscan.org/#/',
    nativeCoinUrl: 'token/0/transfers',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'contract/',
    [ADDRESS_TYPE.TRANSACTION]: 'transaction/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.KAVA]: {
    baseUrl: 'https://explorer.kava.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.BITGERT]: {
    baseUrl: 'https://brisescan.com/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.OASIS]: {
    baseUrl: 'https://explorer.emerald.oasis.dev/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.METIS]: {
    baseUrl: 'https://andromeda-explorer.metis.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.DFK]: {
    baseUrl: 'https://subnets.avax.network/defi-kingdoms/dfk-chain/explorer/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.KLAYTN]: {
    baseUrl: 'https://scope.klaytn.com/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.VELAS]: {
    baseUrl: 'https://evmexplorer.velas.com/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'address/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.SYSCOIN]: {
    baseUrl: 'https://explorer.syscoin.org/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'address/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.EOS]: {
    baseUrl: 'https://bloks.eosargentina.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'key/',
    [ADDRESS_TYPE.TOKEN]: 'account/',
    [ADDRESS_TYPE.TRANSACTION]: 'transaction/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.ETHEREUM_CLASSIC]: {
    baseUrl: 'https://blockscout.com/etc/mainnet/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.FILECOIN]: {
    baseUrl: 'https://filfox.info/en/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.FLARE]: {
    baseUrl: 'https://flare-explorer.flare.network/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.IOTEX]: {
    baseUrl: 'https://iotexscan.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.ONTOLOGY]: {
    baseUrl: 'https://explorer.ont.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.THETA]: {
    baseUrl: 'https://explorer.thetatoken.org/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'account/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'txs/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.XDC]: {
    baseUrl: 'https://xdcscan.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'tokens/',
    [ADDRESS_TYPE.TRANSACTION]: 'txs/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.BITCOIN_CASH]: {
    baseUrl: 'https://blockchair.com/bitcoin-cash/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'transaction/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.ICP]: {
    baseUrl: 'https://www.icpexplorer.org/#/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'acct/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.CARDANO]: {
    baseUrl: 'https://explorer.cardano.org/en/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'transaction?id=',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.AION]: {
    baseUrl: 'https://mainnet.theoan.com/#/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'account/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'transaction/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.ALGORAND]: {
    baseUrl: 'https://algoexplorer.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.APTOS]: {
    baseUrl: 'https://explorer.aptoslabs.com/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'account/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'txn/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.ARDOR]: {
    baseUrl: 'https://ardor.tools/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'account/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'transaction/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.ARK]: {
    baseUrl: 'https://live.arkscan.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'wallets/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'transactions/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.COSMOS]: {
    baseUrl: 'https://atomscan.com/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'accounts/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'transactions/',
    [ADDRESS_TYPE.BLOCK]: 'blocks/'
  },
  [BLOCKCHAIN_NAME.BAND_PROTOCOL]: {
    baseUrl: 'https://atomscan.com/band-protocol/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'accounts/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'transactions/',
    [ADDRESS_TYPE.BLOCK]: 'blocks/'
  },
  [BLOCKCHAIN_NAME.BITCOIN_DIAMOND]: {
    baseUrl: 'https://bcd.tokenview.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.BSV]: {
    baseUrl: 'https://bsv.tokenview.io/en/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.BITCOIN_GOLD]: {
    baseUrl: 'https://btg.tokenview.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.CASPER]: {
    baseUrl: 'https://casperstats.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.DASH]: {
    baseUrl: 'https://blockchair.com/dash/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'transaction/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.DECRED]: {
    baseUrl: 'https://dcrdata.decred.org/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.DIGI_BYTE]: {
    baseUrl: 'https://digibyteblockexplorer.com/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.DIVI]: {
    baseUrl: 'https://chainz.cryptoid.info/divi/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.DOGECOIN]: {
    baseUrl: 'https://blockchair.com/dogecoin/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'transaction/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.POLKADOT]: {
    baseUrl: 'https://explorer.polkascan.io/polkadot/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'transaction/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.MULTIVERS_X]: {
    baseUrl: 'https://explorer.multiversx.com/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'accounts/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'transactions/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.FIO_PROTOCOL]: {
    baseUrl: 'https://fio.bloks.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'account/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'transaction/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.FIRO]: {
    baseUrl: 'https://explorer.firo.org/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.FLOW]: {
    baseUrl: 'https://flowscan.org/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'account/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'transaction/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.HEDERA]: {
    baseUrl: 'https://hederaexplorer.io/search-details/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'account/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'transaction/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.HELIUM]: {
    baseUrl: 'https://explorer.helium.wtf/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'account/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'txns/',
    [ADDRESS_TYPE.BLOCK]: 'blocks/'
  },
  [BLOCKCHAIN_NAME.ICON]: {
    baseUrl: 'https://iconwat.ch/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.IOST]: {
    baseUrl: 'https://www.iostabc.com/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'account/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.IOTA]: {
    baseUrl: 'https://explorer.iota.org/mainnet',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'account/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'message/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.KADENA]: {
    baseUrl: 'https://explorer.chainweb.com/mainnet/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'account/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'txdetail/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.KOMODO]: {
    baseUrl: 'https://kmdexplorer.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.KUSAMA]: {
    baseUrl: 'https://kusama.subscan.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'account/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'extrinsic/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.LISK]: {
    baseUrl: 'https://liskscan.com/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'account/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'transaction/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.LITECOIN]: {
    baseUrl: 'https://blockchair.com/litecoin/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'transaction/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.TERRA]: {
    baseUrl: 'https://terrasco.pe/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.TERRA_CLASSIC]: {
    baseUrl: 'https://atomscan.com/terra/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'accounts/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'transactions/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.MINA_PROTOCOL]: {
    baseUrl: 'https://minaexplorer.com/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'wallet/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'transaction/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.NANO]: {
    baseUrl: 'https://nanoblockexplorer.com/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'account/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'block/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.NEO]: {
    baseUrl: 'https://neoscan.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'account/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'transaction/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.OSMOSIS]: {
    baseUrl: 'https://atomscan.com/osmosis/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'accounts/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'transactions/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.PIVX]: {
    baseUrl: 'https://chainz.cryptoid.info/pivx/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'account/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.POLYX]: {
    baseUrl: 'https://polymesh.subscan.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'account/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'extrinsic/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.QTUM]: {
    baseUrl: 'https://qtum.info/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.THOR_CHAIN]: {
    baseUrl: 'https://thorchain.net/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.RAVENCOIN]: {
    baseUrl: 'https://api.ravencoin.org/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.SIA]: {
    baseUrl: 'https://explore.sia.tech/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.SECRET]: {
    baseUrl: 'https://atomscan.com/secret-network/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'accounts/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'transactions/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.STACKS]: {
    baseUrl: 'https://explorer.stacks.co/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'txid/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.STARKNET]: {
    baseUrl: 'https://starkscan.co/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'contract/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.STEEM]: {
    baseUrl: 'https://steemscan.com/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'account/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'transaction/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.STRATIS]: {
    baseUrl: 'https://chainz.cryptoid.info/strax/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'account/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },

  [BLOCKCHAIN_NAME.SOLAR]: {
    baseUrl: 'https://explorer.solar.org/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'wallets/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'transactions/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.TON]: {
    baseUrl: 'https://tonviewer.com/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: '',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'transaction/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.VE_CHAIN]: {
    baseUrl: 'https://explore.vechain.org/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'accounts/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'transactions/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.WAVES]: {
    baseUrl: 'https://wavesexplorer.com/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'accounts/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'transactions/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.WAX]: {
    baseUrl: 'https://waxblock.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'account/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'transaction/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.DX_CHAIN]: {
    baseUrl: 'https://dxscan.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.E_CASH]: {
    baseUrl: 'https://explorer.e.cash/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.NEM]: {
    baseUrl: 'https://explorer.nemtool.com/#/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 's_account?account=',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 's_tx?hash=',
    [ADDRESS_TYPE.BLOCK]: 's_block/'
  },
  [BLOCKCHAIN_NAME.STELLAR]: {
    baseUrl: 'https://stellarchain.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'accounts/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'transactions/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.MONERO]: {
    baseUrl: 'https://blockchair.com/monero/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'account/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'transaction/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.RIPPLE]: {
    baseUrl: 'https://xrpscan.com/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'account/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.TEZOS]: {
    baseUrl: 'https://tzstats.com/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: '',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: '',
    [ADDRESS_TYPE.BLOCK]: ''
  },
  [BLOCKCHAIN_NAME.VERGE]: {
    baseUrl: 'https://verge-blockchain.info/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'account/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.SYMBOL]: {
    baseUrl: 'https://symbol.fyi/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'accounts/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'transactions/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.ZCASH]: {
    baseUrl: 'https://explorer.zcha.in/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'accounts/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'transactions/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.HORIZEN]: {
    baseUrl: 'https://explorer.horizen.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.ZILLIQA]: {
    baseUrl: 'https://viewblock.io/zilliqa/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: '',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.KAVA_COSMOS]: {
    baseUrl: 'https://www.mintscan.io/kava/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'account/',
    [ADDRESS_TYPE.TOKEN]: 'assets',
    [ADDRESS_TYPE.TRANSACTION]: 'txs/',
    [ADDRESS_TYPE.BLOCK]: 'blocks/'
  },
  [BLOCKCHAIN_NAME.ZK_SYNC]: {
    baseUrl: 'https://explorer.zksync.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'address/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.PULSECHAIN]: {
    baseUrl: 'https://otter.pulsechain.com/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'address/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.LINEA]: {
    baseUrl: 'https://lineascan.build/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'address/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.BASE]: {
    baseUrl: 'https://base.blockscout.com/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.MANTLE]: {
    baseUrl: 'https://explorer.mantle.xyz/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'address/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.GOERLI]: {
    baseUrl: 'https://goerli.etherscan.io//',
    nativeCoinUrl: 'stat/supply/',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET]: {
    baseUrl: 'https://testnet.bscscan.com/',
    nativeCoinUrl: 'stat/supply/',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.MUMBAI]: {
    baseUrl: 'https://mumbai.polygonscan.com/',
    nativeCoinUrl: 'stat/supply/',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.FUJI]: {
    baseUrl: 'https://testnet.snowtrace.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.SCROLL_SEPOLIA]: {
    baseUrl: 'https://sepolia-blockscout.scroll.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.ARTHERA]: {
    baseUrl: 'https://explorer-test.arthera.net/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.ZETACHAIN]: {
    baseUrl: 'https://zetachain.blockscout.com/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.SEPOLIA]: {
    baseUrl: 'https://sepolia.etherscan.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.MANTA_PACIFIC]: {
    baseUrl: 'https://pacific-explorer.manta.network/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.SCROLL]: {
    baseUrl: 'https://scrollscan.com/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.BERACHAIN_TESTNET]: {
    baseUrl: 'https://artio.beratrail.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.BLAST_TESTNET]: {
    baseUrl: 'https://testnet.blastscan.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.BLAST]: {
    baseUrl: 'https://blastscan.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.HOLESKY]: {
    baseUrl: 'https://holesky.etherscan.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.KROMA]: {
    baseUrl: 'https://kroscan.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.HORIZEN_EON]: {
    baseUrl: 'https://eon-explorer.horizenlabs.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.MERLIN]: {
    baseUrl: 'https://scan.merlinchain.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.ROOTSTOCK]: {
    baseUrl: 'https://explorer.rsk.co/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'address/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.MODE]: {
    baseUrl: 'https://explorer.mode.network/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'address/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.ZK_FAIR]: {
    baseUrl: 'https://scan.zkfair.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'address/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.ZK_LINK]: {
    baseUrl: 'https://explorer.zklink.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'address/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.XLAYER]: {
    baseUrl: 'https://www.okx.com/ru/explorer/xlayer/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'address/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.TAIKO]: {
    baseUrl: 'https://taikoscan.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.SEI]: {
    baseUrl: 'https://seitrace.com/?chain=pacific-1/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.CORE]: {
    baseUrl: 'https://scan.coredao.org/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.BAHAMUT]: {
    baseUrl: 'https://www.ftnscan.com/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.BITLAYER]: {
    baseUrl: 'https://www.btrscan.com/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.GRAVITY]: {
    baseUrl: 'https://gscan.xyz/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.UNICHAIN_SEPOLIA_TESTNET]: {
    baseUrl: 'https://sepolia.uniscan.xyz/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.FRAXTAL]: {
    baseUrl: 'https://fraxscan.com/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  // [BLOCKCHAIN_NAME.SONIC]: {
  //   baseUrl: 'https://sonicscan.org/',
  //   nativeCoinUrl: '',
  //   [ADDRESS_TYPE.WALLET]: 'address/',
  //   [ADDRESS_TYPE.TOKEN]: 'token/',
  //   [ADDRESS_TYPE.TRANSACTION]: 'tx/',
  //   [ADDRESS_TYPE.BLOCK]: 'block/'
  // }
  // [BLOCKCHAIN_NAME.SONEIUM_TESTNET]: {
  //   baseUrl: 'https://soneium-minato.blockscout.com/',
  //   nativeCoinUrl: '',
  //   [ADDRESS_TYPE.WALLET]: 'address/',
  //   [ADDRESS_TYPE.TOKEN]: 'token/',
  //   [ADDRESS_TYPE.TRANSACTION]: 'tx/',
  //   [ADDRESS_TYPE.BLOCK]: 'block/'
  // },
  [BLOCKCHAIN_NAME.MORPH]: {
    baseUrl: 'https://explorer.morphl2.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.BERACHAIN]: {
    baseUrl: 'https://berascan.com/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.SONEIUM]: {
    baseUrl: 'https://soneium.blockscout.com/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.UNICHAIN]: {
    baseUrl: 'https://uniscan.xyz/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  // [BLOCKCHAIN_NAME.MONAD_TESTNET]: {
  //   baseUrl: 'https://testnet.monadexplorer.com/',
  //   nativeCoinUrl: '',
  //   [ADDRESS_TYPE.WALLET]: 'address/',
  //   [ADDRESS_TYPE.TOKEN]: 'token/',
  //   [ADDRESS_TYPE.TRANSACTION]: 'tx/',
  //   [ADDRESS_TYPE.BLOCK]: 'block/'
  // }
  [BLOCKCHAIN_NAME.SUI]: {
    baseUrl: 'https://suiscan.xyz/mainnet/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'account/',
    [ADDRESS_TYPE.TOKEN]: 'coin/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.WANCHAIN]: {
    baseUrl: 'https://wanscan.org/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  }
};
