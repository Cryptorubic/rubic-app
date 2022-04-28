import { CrossChainTrade } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-trade';
import { AccountMeta, PublicKey, Signer, TransactionInstruction } from '@solana/web3.js';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import {
  NATIVE_SOL,
  TOKENS
} from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/tokens';
import {
  PDA_CONFIG,
  PDA_DELEGATE,
  PDA_POOL,
  PDA_WRAPPED,
  SOLANA_CROSS_CHAIN_CONTRACT
} from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/solana/solana-constants';
import {
  SYSTEM_PROGRAM_ID,
  TOKEN_PROGRAM_ID
} from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/accounts';
import { PrivateBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/private-blockchain-adapter.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { Buffer } from 'buffer';
import { Injectable } from '@angular/core';
import { ContractsDataService } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contracts-data.service';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';
import { SolanaContractData } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/solana-contract-data';
import { tuiPure } from '@taiga-ui/cdk';
import { NATIVE_SOLANA_MINT_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import { BLOCKCHAIN_UUID } from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/solana/solana-blockchain-accounts-addresses';
import { ContractExecutorFacadeService } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/contract-executor-facade.service';
import { SolanaWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-private.service';
import { SOLANA_CCR_LAYOUT } from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/solana/raydium-ccr-sctuct';
import { CROSS_CHAIN_METHODS } from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/solana/cross-chain-methods';
import { SolanaWeb3Public } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-public';
import { RaydiumService } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/raydium.service';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import {
  CrossChainArguments,
  CrossChainPublicKeys,
  TransferDataType
} from '../models/solana-cross-chain-types';

@Injectable({
  providedIn: 'root'
})
export class SolanaContractExecutorService {
  private readonly contracts = this.contractsDataService.contracts;

  @tuiPure
  private get contract(): SolanaContractData {
    return this.contracts[BLOCKCHAIN_NAME.SOLANA] as SolanaContractData;
  }

  /**
   * Creates solana cross-chain instruction.
   * @param publicKeys Public keys to perform swap.
   * @param swapParams Contract swap arguments.
   */
  private static createSolanaInstruction(
    publicKeys: CrossChainPublicKeys,
    swapParams: CrossChainArguments
  ): TransactionInstruction {
    const optionalTransferAccounts = [
      { pubkey: publicKeys.userSourceTokenAccount, isSigner: false, isWritable: true },
      { pubkey: publicKeys.userDestTokenAccount, isSigner: false, isWritable: true },
      { pubkey: publicKeys.splProgramId, isSigner: false, isWritable: false }
    ];
    const optionalSwapAccounts = [
      { pubkey: publicKeys.ammId, isSigner: false, isWritable: true },
      { pubkey: publicKeys.ammAuthority, isSigner: false, isWritable: false },
      { pubkey: publicKeys.ammOpenOrders, isSigner: false, isWritable: true },
      { pubkey: publicKeys.ammTargetOrders, isSigner: false, isWritable: true },
      { pubkey: publicKeys.poolCoinTokenAccount, isSigner: false, isWritable: true },
      { pubkey: publicKeys.poolPcTokenAccount, isSigner: false, isWritable: true },
      { pubkey: publicKeys.serumProgramId, isSigner: false, isWritable: false },
      { pubkey: publicKeys.serumMarket, isSigner: false, isWritable: true },
      { pubkey: publicKeys.serumBids, isSigner: false, isWritable: true },
      { pubkey: publicKeys.serumAsks, isSigner: false, isWritable: true },
      { pubkey: publicKeys.serumEventQueue, isSigner: false, isWritable: true },
      { pubkey: publicKeys.serumCoinVaultAccount, isSigner: false, isWritable: true },
      { pubkey: publicKeys.serumPcVaultAccount, isSigner: false, isWritable: true },
      { pubkey: publicKeys.serumVaultSigner, isSigner: false, isWritable: false },
      { pubkey: publicKeys.raydiumAmm, isSigner: false, isWritable: false }
    ];
    const optionalNativeAccounts: Array<AccountMeta> = [
      { pubkey: publicKeys.wrappedSolMint, isSigner: false, isWritable: false },
      { pubkey: publicKeys.pdaWrapped, isSigner: false, isWritable: true },
      { pubkey: publicKeys.splProgramId, isSigner: false, isWritable: false },
      { pubkey: publicKeys.userDestTokenAccount, isSigner: false, isWritable: true },
      { pubkey: publicKeys.splProgramId, isSigner: false, isWritable: false }
    ];
    const requiredKeys: Array<AccountMeta> = [
      { pubkey: publicKeys.pdaConfig, isSigner: false, isWritable: false },
      { pubkey: publicKeys.pdaBlockchainConfig, isSigner: false, isWritable: false },
      { pubkey: publicKeys.userOwner, isSigner: true, isWritable: false },
      { pubkey: publicKeys.pdaDelegate, isSigner: false, isWritable: true },
      { pubkey: publicKeys.systemProgram, isSigner: false, isWritable: false }
    ];

    const buffer = Buffer.alloc(1000);
    const length = SOLANA_CCR_LAYOUT.encode({ instructionNumber: 1, ...swapParams }, buffer);
    const data = buffer.slice(0, length);

    let keys: AccountMeta[];
    if (swapParams.transferType === TransferDataType.NATIVE) {
      keys = [...requiredKeys, ...optionalNativeAccounts, ...optionalSwapAccounts];
    } else if (swapParams.transferType === TransferDataType.TRANSFER_TOKEN) {
      keys = [...requiredKeys, ...optionalTransferAccounts];
    } else if (swapParams.transferType === TransferDataType.NON_TRANSFER_TOKEN) {
      keys = [...requiredKeys, ...optionalTransferAccounts, ...optionalSwapAccounts];
    }

    return new TransactionInstruction({
      keys,
      programId: new PublicKey(SOLANA_CROSS_CHAIN_CONTRACT),
      data
    });
  }

  /**
   * Checks if TPS greater then minimum limit.
   * @param privateAdapter Solana Web3 private adapter.
   */
  public static async checkHealth(privateAdapter: SolanaWeb3PrivateService): Promise<boolean> {
    const samplesAmount = 10; // Performance samples are taken every 60 seconds.
    const samples = await privateAdapter.getRecentPerformanceSamples(samplesAmount);

    const totalTransactionsCount = samples.reduce((acc, curr) => acc + curr.numTransactions, 0);
    const averageTPS = totalTransactionsCount / samplesAmount / 60;
    const minimumTPSLimit = 1200;

    return averageTPS >= minimumTPSLimit;
  }

  /**
   * Gets cross-chain transfer type.
   * @param fromNative Is swap from native token.
   * @param isTransfer Is transfer from transit token.
   */
  private static getTransferType(fromNative: boolean, isTransfer: boolean): TransferDataType {
    if (fromNative) {
      return TransferDataType.NATIVE;
    }
    if (isTransfer) {
      return TransferDataType.TRANSFER_TOKEN;
    }
    return TransferDataType.NON_TRANSFER_TOKEN;
  }

  constructor(
    private readonly contractsDataService: ContractsDataService,
    private readonly privateAdapter: PrivateBlockchainAdapterService,
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService,
    private readonly tokensService: TokensService,
    private readonly raydiumService: RaydiumService,
    private readonly walletConnectorService: WalletConnectorService
  ) {}

  public async executeTrade(
    trade: CrossChainTrade,
    address: string,
    targetAddress: string,
    isToNative: boolean
  ): Promise<string> {
    const { owner, signers, setupInstructions, tradeInstructions } =
      SolanaWeb3Public.createBaseSwapInformation(address);

    this.handleTokenError(trade);

    const methodArguments = this.getArguments(trade, targetAddress, isToNative);
    const publicKeys = await this.getPublicKeys(
      trade,
      methodArguments,
      owner,
      setupInstructions,
      signers,
      address
    );

    setupInstructions.push(
      SolanaContractExecutorService.createSolanaInstruction(publicKeys, methodArguments)
    );

    const transactionData = SolanaWeb3Public.createTransactions(
      setupInstructions,
      tradeInstructions,
      signers
    );

    return this.publicBlockchainAdapterService[
      BLOCKCHAIN_NAME.SOLANA
    ].signAndSendRaydiumTransaction(transactionData, this.walletConnectorService);
  }

  /**
   * Gets cross-chain contract arguments.
   * @param trade Current cross-chain trade.
   * @param targetAddress Target blockchain user address.
   * @param isToNative Is swap to native token.
   */
  private getArguments(
    trade: CrossChainTrade,
    targetAddress: string,
    isToNative: boolean
  ): CrossChainArguments {
    const isTransfer = trade.tokenIn.address === this.contract.transitToken.address;
    const fromNative = trade.tokenIn.address === NATIVE_SOLANA_MINT_ADDRESS;
    const transferType = SolanaContractExecutorService.getTransferType(fromNative, isTransfer);
    // From amount
    const tokenInAmountAbsolute = Web3Pure.toWei(trade.tokenInAmount, trade.tokenIn.decimals);
    const fromFinalAmount = parseInt(tokenInAmountAbsolute);
    // Transit amount
    const fromTransitTokenAmountMin =
      ContractExecutorFacadeService.calculateFromTransitTokenAmountMin(trade);
    const fromTransitTokenAmountMinAbsolute = Web3Pure.toWei(
      fromTransitTokenAmountMin,
      this.contract.transitToken.decimals
    );
    const fromTransitTokenAmount = parseInt(fromTransitTokenAmountMinAbsolute);
    // To amount
    const tokenOutAmountMin = ContractExecutorFacadeService.calculateTokenOutAmountMin(trade);
    const tokenOutAmountAbsolute = Web3Pure.toWei(tokenOutAmountMin, trade.tokenOut.decimals);

    const swapToUserMethodName = this.contracts[trade.toBlockchain].getSwapToUserMethodName(
      trade.toProviderIndex,
      isToNative
    );

    return {
      blockchain: this.contracts[trade.toBlockchain].numOfBlockchain,
      tokenInAmount: fromFinalAmount,
      secondPath: this.contracts[trade.toBlockchain].getSecondPath(
        trade.toTrade,
        trade.toProviderIndex,
        trade.fromBlockchain
      ),
      exactRbcTokenOut: fromTransitTokenAmount,
      tokenOutMin: tokenOutAmountAbsolute,
      newAddress: targetAddress,
      swapToCrypto: isToNative,
      transferType,
      methodName: CROSS_CHAIN_METHODS[swapToUserMethodName].slice(2)
    };
  }

  /**
   * Handles missed token error.
   * @param trade Current cross-chain trade.
   */
  private handleTokenError(trade: CrossChainTrade): void {
    const from = this.tokensService.tokens.find(el => el.address === trade.tokenIn.address);
    const to = this.tokensService.tokens.find(el => el.address === trade.tokenOut.address);

    if (!from || !to) {
      throw new Error('Miss token info');
    }
  }

  /**
   * Gets all public keys needed for cross-chain swap.
   * @param trade Current cross-chain trade.
   * @param methodArguments Arguments for swap contract.
   * @param owner Owner account.
   * @param setupInstructions Prepare swap instructions .
   * @param signers List of signers.
   * @param address User address.
   */
  private async getPublicKeys(
    trade: CrossChainTrade,
    methodArguments: CrossChainArguments,
    owner: PublicKey,
    setupInstructions: TransactionInstruction[],
    signers: Signer[],
    address: string
  ): Promise<CrossChainPublicKeys> {
    const poolInfo = this.raydiumService.routerManager.currentPoolInfo;
    const blockchainUUID = BLOCKCHAIN_UUID[this.contracts[trade.toBlockchain].numOfBlockchain];

    const fromMint =
      trade.tokenIn.address === NATIVE_SOL.mintAddress
        ? TOKENS.WSOL.mintAddress
        : trade.tokenIn.address;
    const middleMint = this.contract.transitToken.address;

    const fromAccount =
      methodArguments.transferType !== TransferDataType.NATIVE
        ? (
            await this.privateAdapter[BLOCKCHAIN_NAME.SOLANA].getOrCreatesTokensAccounts(
              fromMint,
              middleMint,
              owner,
              methodArguments.tokenInAmount,
              setupInstructions,
              signers
            )
          )?.from
        : { key: PublicKey.default };

    return {
      pdaConfig: new PublicKey(PDA_CONFIG),
      pdaBlockchainConfig: new PublicKey(blockchainUUID),
      splProgramId: TOKEN_PROGRAM_ID,
      ammId: new PublicKey(poolInfo?.ammId || NATIVE_SOL.mintAddress),
      ammAuthority: new PublicKey(poolInfo?.ammAuthority || NATIVE_SOL.mintAddress),
      ammOpenOrders: new PublicKey(poolInfo?.ammOpenOrders || NATIVE_SOL.mintAddress),
      ammTargetOrders: new PublicKey(poolInfo?.ammTargetOrders || NATIVE_SOL.mintAddress),
      poolCoinTokenAccount: new PublicKey(poolInfo?.poolCoinTokenAccount || NATIVE_SOL.mintAddress),
      poolPcTokenAccount: new PublicKey(poolInfo?.poolPcTokenAccount || NATIVE_SOL.mintAddress),
      serumProgramId: new PublicKey(poolInfo?.serumProgramId || NATIVE_SOL.mintAddress),
      serumMarket: new PublicKey(poolInfo?.serumMarket || NATIVE_SOL.mintAddress),
      serumBids: new PublicKey(poolInfo?.serumBids || NATIVE_SOL.mintAddress),
      serumAsks: new PublicKey(poolInfo?.serumAsks || NATIVE_SOL.mintAddress),
      serumEventQueue: new PublicKey(poolInfo?.serumEventQueue || NATIVE_SOL.mintAddress),
      serumCoinVaultAccount: new PublicKey(
        poolInfo?.serumCoinVaultAccount || NATIVE_SOL.mintAddress
      ),
      serumPcVaultAccount: new PublicKey(poolInfo?.serumPcVaultAccount || NATIVE_SOL.mintAddress),
      serumVaultSigner: new PublicKey(poolInfo?.serumVaultSigner || NATIVE_SOL.mintAddress),
      userSourceTokenAccount: fromAccount.key,
      userDestTokenAccount: new PublicKey(PDA_POOL),
      userOwner: new PublicKey(address),
      raydiumAmm: new PublicKey(poolInfo?.programId || NATIVE_SOL.mintAddress),
      pdaDelegate: new PublicKey(PDA_DELEGATE),
      systemProgram: new PublicKey(SYSTEM_PROGRAM_ID),
      wrappedSolMint: new PublicKey(TOKENS.WSOL.mintAddress),
      pdaWrapped: new PublicKey(PDA_WRAPPED)
    };
  }
}
