import { BLOCKCHAIN_NAME, BlockchainName } from '../../../../../core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from '../../../../../core/blockchain/utils/blockchains-info/blockchains-info';
import { blockchainId } from '../../../../../core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Injector } from '../../../../../core/injector/injector';
import { OnChainSubtype } from '../common/models/on-chain-subtype';
import { SymbiosisTradeType } from './models/symbiosis-trade-data';
import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../../../on-chain/calculation-manager/models/on-chain-trade-type';
import { PriceToken } from '../../../../../common/tokens/price-token';
import { PriceTokenAmount } from '../../../../../common/tokens/price-token-amount';

export class SymbiosisUtils {
    public static getChainId(token: PriceToken): number;
    public static getChainId(blockchain: BlockchainName): number;
    public static getChainId(entity: PriceToken | BlockchainName): number {
        const blockchain = typeof entity === 'object' ? entity.blockchain : entity;
        if (BlockchainsInfo.isTonBlockchainName(blockchain)) {
            return 85918;
        }
        if (BlockchainsInfo.isTronBlockchainName(blockchain)) {
            return 728126428;
        }
        if (BlockchainsInfo.isBitcoinBlockchainName(blockchain)) {
            return 3652501241;
        }
        return blockchainId[blockchain];
    }

    public static getRevertableAddress(receiverAddress: string | undefined, walletAddress: string, toBlockchain: BlockchainName): string {
        if (toBlockchain === BLOCKCHAIN_NAME.BITCOIN || toBlockchain === BLOCKCHAIN_NAME.TON) {
            return walletAddress;
        }

        return receiverAddress || walletAddress;
    }

    public static getSubtype(
        tradeType: {
            in?: SymbiosisTradeType;
            out?: SymbiosisTradeType;
        },
        toBlockchain: BlockchainName
    ): OnChainSubtype {
        const mapping: Record<SymbiosisTradeType | 'default', OnChainTradeType | undefined> = {
            dex: ON_CHAIN_TRADE_TYPE.SYMBIOSIS_SWAP,
            '1inch': ON_CHAIN_TRADE_TYPE.ONE_INCH,
            'open-ocean': ON_CHAIN_TRADE_TYPE.OPEN_OCEAN,
            wrap: ON_CHAIN_TRADE_TYPE.WRAPPED,
            izumi: ON_CHAIN_TRADE_TYPE.IZUMI,
            default: undefined
        };
        return {
            from: mapping?.[tradeType?.in || 'default'],
            to: toBlockchain === BLOCKCHAIN_NAME.BITCOIN ? ON_CHAIN_TRADE_TYPE.REN_BTC : mapping?.[tradeType?.out || 'default']
        };
    }

    public static async getReceiver(
        from: PriceTokenAmount,
        to: PriceTokenAmount,
        wallet: string,
        receiver?: string
    ): Promise<{ receiverAddress: string; toAddress: string }> {
        const isEvmDestination = BlockchainsInfo.isEvmBlockchainName(to.blockchain);
        let receiverAddress = isEvmDestination ? receiver || wallet : receiver;
        let toAddress = isEvmDestination ? to.address : from.address;

        if (to.blockchain === BLOCKCHAIN_NAME.TRON) {
            const adapter = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.TRON);
            const tronHexReceiverAddress = await adapter.convertTronAddressToHex(receiver!);
            receiverAddress = `0x${tronHexReceiverAddress.slice(2)}`;

            const toTokenTronAddress = await adapter.convertTronAddressToHex(to.address);
            toAddress = `0x${toTokenTronAddress.slice(2)}`;
        }

        if (from.isNative && from.blockchain === BLOCKCHAIN_NAME.METIS) {
            toAddress = '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000';
        }

        return { receiverAddress: receiverAddress!, toAddress };
    }
}
