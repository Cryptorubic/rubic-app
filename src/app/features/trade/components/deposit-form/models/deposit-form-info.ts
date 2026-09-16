import { CrossChainTransferTrade } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/cross-chain-transfer-trade';
import { OnChainTransferTrade } from '@app/core/services/sdk/sdk-legacy/features/on-chain/calculation-manager/common/on-chain-transfer-trade/on-chain-transfer-trade';

export type TransferTrade = CrossChainTransferTrade | OnChainTransferTrade;
