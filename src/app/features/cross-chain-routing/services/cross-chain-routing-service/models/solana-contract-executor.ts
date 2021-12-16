import { CrossChainRoutingTrade } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/CrossChainRoutingTrade';
import { CcrSettingsForm } from '@features/swaps/services/settings-service/settings.service';
import {
  Account,
  AccountMeta,
  PublicKey,
  Transaction,
  TransactionInstruction
} from '@solana/web3.js';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import {
  NATIVE_SOL,
  TOKENS
} from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/tokens';
import BigNumber from 'bignumber.js';
import { transitTokensWithMode } from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/transitTokens';
import {
  PDA_CONFIG,
  PDA_DELEGATE,
  SOLANA_CROSS_CHAIN_CONTRACT
} from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/solana-constants';
import {
  SYSTEM_PROGRAM_ID,
  TOKEN_PROGRAM_ID
} from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/accounts';
import { PrivateBlockchainAdapterService } from '@core/services/blockchain/web3/web3-public-service/private-blockchain-adapter.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { RaydiumRoutingService } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/utils/raydium-routering.service';
import { Buffer } from 'buffer';
import { SOLANA_CCR_LAYOUT } from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/solana-sctuct';
import { NATIVE_SOLANA_MINT_ADDRESS } from '@shared/constants/blockchain/NATIVE_ETH_LIKE_TOKEN_ADDRESS';
import { Web3Public } from '@core/services/blockchain/web3/web3-public-service/Web3Public';
import { CrossChainContractExecutorFacade } from '@features/cross-chain-routing/services/cross-chain-routing-service/cross-chain-contract-executor.facade';
import CustomError from '@core/errors/models/custom-error';

enum TransferDataType {
  NON_TRANSFER_TOKEN = 0,
  TRANSFER_TOKEN = 1,
  NATIVE = 2
}

export class SolanaContractExecutor {
  constructor(
    private readonly privateAdapter: PrivateBlockchainAdapterService,
    private readonly tokensService: TokensService,
    private readonly raydiumRoutingService: RaydiumRoutingService
  ) {}

  // eslint-disable-next-line complexity
  public async execute(
    trade: CrossChainRoutingTrade,
    address: string,
    toBlockchainInContractNumber: number,
    settings: CcrSettingsForm,
    targetAddress: string
  ): Promise<{ transaction: Transaction; signers: Account[] }> {
    const isBlockchainWorking = await this.checkHealth();
    if (!isBlockchainWorking) {
      throw new CustomError('Solana blockchain has low TPS count');
    }

    const transaction = new Transaction();
    const signers: Account[] = [];
    const owner = new PublicKey(address);
    const privateBlockchainAdapter = this.privateAdapter[BLOCKCHAIN_NAME.SOLANA];
    const mintAccountsAddresses = await privateBlockchainAdapter.getTokenAccounts(address);

    const fromDecimals = new BigNumber(10).exponentiatedBy(trade.tokenIn.decimals);
    const tokenInAmountMax = CrossChainContractExecutorFacade.calculateTokenInAmountMax(
      trade,
      settings
    );
    const amountIn = new BigNumber(tokenInAmountMax.toString()).multipliedBy(fromDecimals);

    const toDecimals = new BigNumber(10).exponentiatedBy(trade.tokenOut.decimals);
    const tokenOutAmountMin = CrossChainContractExecutorFacade.calculateTokenOutAmountMin(
      trade,
      settings
    );
    const amountOut = new BigNumber(tokenOutAmountMin.toString()).multipliedBy(toDecimals);

    const middleDecimals = new BigNumber(10).exponentiatedBy(
      transitTokensWithMode[BLOCKCHAIN_NAME.SOLANA].decimals
    );
    const amountMiddle = new BigNumber(trade.firstTransitTokenAmount.toString()).multipliedBy(
      middleDecimals
    );

    const from = this.tokensService.tokens.find(el => el.address === trade.tokenIn.address);
    const to = this.tokensService.tokens.find(el => el.address === trade.tokenOut.address);

    if (!from || !to) {
      throw new Error('Miss token info');
    }

    const fromMint =
      trade.tokenIn.address === NATIVE_SOL.mintAddress
        ? TOKENS.WSOL.mintAddress
        : trade.tokenIn.address;
    const toRouteMint = trade.firstPath[trade.firstPath.length - 1];
    const toMint = toRouteMint === NATIVE_SOL.mintAddress ? TOKENS.WSOL.mintAddress : toRouteMint;

    const fromFinalAmount = Math.floor(parseFloat(amountIn.toString()));
    const toFinalAmount = Math.floor(parseFloat(amountOut.toFixed()));
    const middleFinalAmount = Math.floor(parseFloat(amountMiddle.toFixed()));

    const poolInfo = this.raydiumRoutingService.currentPoolInfo;

    // @TODO Solana.
    const blockchainUuid: Partial<Record<BLOCKCHAIN_NAME, string>> = {
      [BLOCKCHAIN_NAME.ETHEREUM]: '3gB5xUoME2BhCXdaArynKutftLnN5mWLw9dnB2dpw2yx',
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '4JCZAgsC5XwXxgexidRmJmdtMCBSAcMqHAUF152x5a71',
      [BLOCKCHAIN_NAME.POLYGON]: 'CaXfJCA4ccnvmMDFxf9V57SxjAXDe9JC1TgYWXcuyxs1'
    };

    const isTransfer =
      trade.tokenIn.address === transitTokensWithMode[BLOCKCHAIN_NAME.SOLANA].address;
    const fromNative = trade.tokenIn.address === NATIVE_SOLANA_MINT_ADDRESS;
    let transferType;
    if (fromNative) {
      transferType = TransferDataType.NATIVE;
    } else if (isTransfer) {
      transferType = TransferDataType.TRANSFER_TOKEN;
    } else {
      transferType = TransferDataType.NON_TRANSFER_TOKEN;
    }

    const methodArguments = {
      blockchain: toBlockchainInContractNumber,
      tokenInAmount: fromFinalAmount,
      secondPath: trade.secondPath.map(el => Web3Public.toChecksumAddress(el)),
      exactRbcTokenOut: middleFinalAmount,
      // @TODO Solana.
      tokenOutMin: toFinalAmount,
      newAddress: targetAddress,
      swapToCrypto: true,
      transferType
    };

    const { from: fromAccount } =
      transferType !== TransferDataType.NATIVE
        ? await privateBlockchainAdapter.getOrCreatesTokensAccounts(
            mintAccountsAddresses,
            fromMint,
            toMint,
            owner,
            fromFinalAmount,
            transaction,
            signers
          )
        : { from: { key: PublicKey.default } };

    // @TODO Solana. Fix keys order.
    transaction.add(
      SolanaContractExecutor.createSolanaInstruction(
        new PublicKey(PDA_CONFIG),
        new PublicKey(blockchainUuid[trade.toBlockchain]),
        TOKEN_PROGRAM_ID,
        new PublicKey(poolInfo?.ammId || NATIVE_SOL.mintAddress),
        new PublicKey(poolInfo?.ammAuthority || NATIVE_SOL.mintAddress),
        new PublicKey(poolInfo?.ammOpenOrders || NATIVE_SOL.mintAddress),
        new PublicKey(poolInfo?.ammTargetOrders || NATIVE_SOL.mintAddress),
        new PublicKey(poolInfo?.poolCoinTokenAccount || NATIVE_SOL.mintAddress),
        new PublicKey(poolInfo?.poolPcTokenAccount || NATIVE_SOL.mintAddress),
        new PublicKey(poolInfo?.serumProgramId || NATIVE_SOL.mintAddress),
        new PublicKey(poolInfo?.serumMarket || NATIVE_SOL.mintAddress),
        new PublicKey(poolInfo?.serumBids || NATIVE_SOL.mintAddress),
        new PublicKey(poolInfo?.serumAsks || NATIVE_SOL.mintAddress),
        new PublicKey(poolInfo?.serumEventQueue || NATIVE_SOL.mintAddress),
        new PublicKey(poolInfo?.serumCoinVaultAccount || NATIVE_SOL.mintAddress),
        new PublicKey(poolInfo?.serumPcVaultAccount || NATIVE_SOL.mintAddress),
        new PublicKey(poolInfo?.serumVaultSigner || NATIVE_SOL.mintAddress),
        fromAccount.key,
        new PublicKey('6rvuMQ7B3cwpmPHhbMGQFBsfDfkgnxiwmWxxSnkd9FjK'),
        new PublicKey(address),
        new PublicKey(poolInfo?.programId || NATIVE_SOL.mintAddress),
        new PublicKey(PDA_DELEGATE),
        new PublicKey(SYSTEM_PROGRAM_ID),
        methodArguments
      )
    );

    return { transaction, signers };
  }

  private static createSolanaInstruction(
    pdaConfig: PublicKey,
    pdaBlockchainConfig: PublicKey,
    splProgramId: PublicKey,
    ammId: PublicKey,
    ammAuthority: PublicKey,
    ammOpenOrders: PublicKey,
    ammTargetOrders: PublicKey,
    poolCoinTokenAccount: PublicKey,
    poolPcTokenAccount: PublicKey,
    serumProgramId: PublicKey,
    serumMarket: PublicKey,
    serumBids: PublicKey,
    serumAsks: PublicKey,
    serumEventQueue: PublicKey,
    serumCoinVaultAccount: PublicKey,
    serumPcVaultAccount: PublicKey,
    serumVaultSigner: PublicKey,
    userSourceTokenAccount: PublicKey,
    userDestTokenAccount: PublicKey,
    userOwner: PublicKey,
    raydiumAmm: PublicKey,
    pdaDelegate: PublicKey,
    systemProgram: PublicKey,
    swapParams: {
      blockchain: number;
      tokenInAmount: number;
      secondPath: string[];
      exactRbcTokenOut: number;
      tokenOutMin: number;
      newAddress: string;
      swapToCrypto: boolean;
      transferType: number;
    }
  ): TransactionInstruction {
    const optionalTransferAccounts = [
      { pubkey: userSourceTokenAccount, isSigner: false, isWritable: true },
      { pubkey: userDestTokenAccount, isSigner: false, isWritable: true },
      { pubkey: splProgramId, isSigner: false, isWritable: false }
    ];
    const optionalNonTransferAccountsAccounts = [
      ...optionalTransferAccounts,
      { pubkey: ammId, isSigner: false, isWritable: true },
      { pubkey: ammAuthority, isSigner: false, isWritable: false },
      { pubkey: ammOpenOrders, isSigner: false, isWritable: true },
      { pubkey: ammTargetOrders, isSigner: false, isWritable: true },
      { pubkey: poolCoinTokenAccount, isSigner: false, isWritable: true },
      { pubkey: poolPcTokenAccount, isSigner: false, isWritable: true },
      { pubkey: serumProgramId, isSigner: false, isWritable: false },
      { pubkey: serumMarket, isSigner: false, isWritable: true },
      { pubkey: serumBids, isSigner: false, isWritable: true },
      { pubkey: serumAsks, isSigner: false, isWritable: true },
      { pubkey: serumEventQueue, isSigner: false, isWritable: true },
      { pubkey: serumCoinVaultAccount, isSigner: false, isWritable: true },
      { pubkey: serumPcVaultAccount, isSigner: false, isWritable: true },
      { pubkey: serumVaultSigner, isSigner: false, isWritable: false },
      { pubkey: raydiumAmm, isSigner: false, isWritable: false }
    ];
    const requiredKeys: Array<AccountMeta> = [
      { pubkey: pdaConfig, isSigner: false, isWritable: false },
      { pubkey: pdaBlockchainConfig, isSigner: false, isWritable: false },
      { pubkey: userOwner, isSigner: true, isWritable: false },
      { pubkey: pdaDelegate, isSigner: false, isWritable: true },
      { pubkey: systemProgram, isSigner: false, isWritable: false }
    ];

    const buffer = Buffer.alloc(1000);
    const length = SOLANA_CCR_LAYOUT.encode({ instructionNumber: 1, ...swapParams }, buffer);
    const data = buffer.slice(0, length);

    let keys: AccountMeta[];
    if (swapParams.transferType === TransferDataType.NATIVE) {
      keys = [...requiredKeys];
    } else if (swapParams.transferType === TransferDataType.TRANSFER_TOKEN) {
      keys = [...requiredKeys, ...optionalTransferAccounts];
    } else if (swapParams.transferType === TransferDataType.NON_TRANSFER_TOKEN) {
      keys = [...requiredKeys, ...optionalNonTransferAccountsAccounts];
    }

    return new TransactionInstruction({
      keys,
      programId: new PublicKey(SOLANA_CROSS_CHAIN_CONTRACT),
      data
    });
  }

  /**
   * Checks if TPS greater then minimum limit.
   */
  private async checkHealth(): Promise<boolean> {
    const samplesAmount = 10; // Performance samples are taken every 60 seconds.
    const privateAdapter = this.privateAdapter[BLOCKCHAIN_NAME.SOLANA];
    const samples = await privateAdapter.getRecentPerformanceSamples(samplesAmount);
    const totalTransactionsCount = samples.reduce((acc, curr) => acc + curr.numTransactions, 0);
    const averageTPS = totalTransactionsCount / samplesAmount / 60;
    const minimumTPSLimit = 1200;
    return averageTPS >= minimumTPSLimit;
  }
}
