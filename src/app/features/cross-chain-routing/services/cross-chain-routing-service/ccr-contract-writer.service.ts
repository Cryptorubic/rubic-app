import { PrivateBlockchainAdapterService } from '@core/services/blockchain/web3/web3-public-service/private-blockchain-adapter.service';
import { CrossChainRoutingTrade } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/CrossChainRoutingTrade';
import { CROSS_CHAIN_ROUTING_SWAP_METHOD } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/CROSS_CHAIN_ROUTING_SWAP_METHOD';
import { Web3Public } from '@core/services/blockchain/web3/web3-public-service/Web3Public';
import BigNumber from 'bignumber.js';
import { TransactionOptions } from '@shared/models/blockchain/transaction-options';
import { PrivateAdapterService } from '@core/services/blockchain/web3/web3-private-service/private-adapter.service';
import { crossChainSwapContractAbi } from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/crossChainSwapContract/crossChainSwapContractAbi';
import { AbiItem } from 'web3-utils';
import { crossChainSwapContractAddresses } from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/crossChainSwapContract/crossChainSwapContractAddresses';
import { SupportedCrossChainSwapBlockchain } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/SupportedCrossChainSwapBlockchain';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/web3/web3-public-service/public-blockchain-adapter.service';
import { CcrSettingsForm } from '@features/swaps/services/settings-service/settings.service';
import {
  TransitTokens,
  transitTokensWithMode
} from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/transitTokens';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import {
  Account,
  AccountMeta,
  PublicKey,
  Transaction,
  TransactionInstruction
} from '@solana/web3.js';
import { DATA_LAYOUT } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/structure';
import {
  SYSTEM_PROGRAM_ID,
  TOKEN_PROGRAM_ID
} from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/accounts';
import {
  NATIVE_SOL,
  TOKENS
} from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/tokens';
import { closeAccount } from '@project-serum/serum/lib/token-instructions';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import { Injectable } from '@angular/core';
import { TokensService } from '@core/services/tokens/tokens.service';
import { RaydiumRoutingService } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/utils/raydium-router.info';
import {
  PDA_CONFIG,
  PDA_DELEGATE,
  SOLANA_CROSS_CHAIN_CONTRACT
} from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/solana-constants';
import { Buffer } from 'buffer';

@Injectable({
  providedIn: 'root'
})
export class CcrContractWriterService {
  private readonly contractAbi: AbiItem[];

  private readonly contractAddresses: Record<SupportedCrossChainSwapBlockchain, string[]>;

  private readonly transitTokens: TransitTokens;

  private targetAddress: string;

  constructor(
    private readonly privateAdapter: PrivateBlockchainAdapterService,
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService,
    private readonly tokensService: TokensService,
    private readonly raydiumCrossChainContractWriterService: RaydiumRoutingService
  ) {
    this.contractAbi = crossChainSwapContractAbi;
    this.contractAddresses = crossChainSwapContractAddresses;
    this.transitTokens = transitTokensWithMode;
  }

  private async executeSolanaContract(
    trade: CrossChainRoutingTrade,
    address: string,
    toBlockchainInContractNumber: number
  ): Promise<{ transaction: Transaction; signers: Account[] }> {
    const transaction = new Transaction();
    const signers: Account[] = [];
    const owner = new PublicKey(address);
    const privateBlockchainAdapter = this.privateAdapter[BLOCKCHAIN_NAME.SOLANA];

    const mintAccountsAddresses = await privateBlockchainAdapter.getTokenAccounts(address);
    const wsolAddress = mintAccountsAddresses[TOKENS.WSOL.mintAddress];

    const fromDecimals = new BigNumber(10).exponentiatedBy(trade.tokenIn.decimals);
    const amountIn = new BigNumber(trade.tokenInAmount.toString()).multipliedBy(fromDecimals);
    const toDecimals = new BigNumber(10).exponentiatedBy(trade.tokenOut.decimals);
    const amountOut = new BigNumber(trade.tokenOutAmount.toString()).multipliedBy(toDecimals);
    const from = this.tokensService.tokens.find(el => el.address === trade.tokenIn.address);
    const to = this.tokensService.tokens.find(el => el.address === trade.tokenOut.address);

    if (!from || !to) {
      throw new Error('Miss token info');
    }

    if (trade.tokenIn.address === NATIVE_SOL.mintAddress && wsolAddress) {
      transaction.add(
        closeAccount({
          source: new PublicKey(wsolAddress),
          destination: owner,
          owner
        })
      );
    }

    const fromMint =
      trade.tokenIn.address === NATIVE_SOL.mintAddress
        ? TOKENS.WSOL.mintAddress
        : trade.tokenIn.address;
    const toMint =
      trade.tokenOut.address === NATIVE_SOL.mintAddress
        ? TOKENS.WSOL.mintAddress
        : trade.tokenOut.address;

    const { from: fromAccount, to: toAccount } = await privateBlockchainAdapter.getTokensAccounts(
      mintAccountsAddresses,
      fromMint,
      toMint,
      owner,
      trade.tokenInAmount,
      trade.tokenOutAmount,
      transaction,
      signers
    );

    const fromFinalAmount = Math.floor(parseFloat(amountIn.toString()));
    const toFinalAmount = Math.floor(parseFloat(amountOut.toString()));

    // @TODO Solana.
    console.log(fromFinalAmount, toFinalAmount);
    const poolInfo = this.raydiumCrossChainContractWriterService.currentPoolInfo;

    transaction.add(
      this.createSolanaInstruction(
        new PublicKey(PDA_CONFIG),
        new PublicKey(PDA_CONFIG),
        TOKEN_PROGRAM_ID,
        new PublicKey(poolInfo.ammId),
        new PublicKey(poolInfo.ammAuthority),
        new PublicKey(poolInfo.ammOpenOrders),
        new PublicKey(poolInfo.ammTargetOrders),
        new PublicKey(poolInfo.poolCoinTokenAccount),
        new PublicKey(poolInfo.poolPcTokenAccount),
        new PublicKey(poolInfo.serumProgramId),
        new PublicKey(poolInfo.serumMarket),
        new PublicKey(poolInfo.serumBids),
        new PublicKey(poolInfo.serumAsks),
        new PublicKey(poolInfo.serumEventQueue),
        new PublicKey(poolInfo.serumCoinVaultAccount),
        new PublicKey(poolInfo.serumPcVaultAccount),
        new PublicKey(poolInfo.serumVaultSigner),
        fromAccount.key,
        toAccount.key,
        new PublicKey(address),
        new PublicKey(poolInfo.ammId), // ???
        new PublicKey(PDA_DELEGATE),
        new PublicKey(SYSTEM_PROGRAM_ID),
        {
          blockchain: new BigNumber(toBlockchainInContractNumber),
          tokenInAmount: trade.tokenIn.amount,
          secondPath: trade.secondPath,
          rbcTokenOut: new BigNumber(0), // ???
          tokenOutMin: new BigNumber(0), // ???
          newAddress: this.targetAddress,
          swapToCrypto: true
        }
      )
    );
    // @TODO Solana.
    // this.closeAccounts({ from: fromAccount, to: toAccount }, transaction, owner);

    return { transaction, signers };
  }

  private async executeEthLikeContract(
    trade: CrossChainRoutingTrade,
    options: TransactionOptions,
    userAddress: string,
    settings: CcrSettingsForm,
    toBlockchainInContractNumber: number
  ): Promise<string> {
    const { contractAddress, methodName, methodArguments, value } = await this.getContractData(
      trade,
      userAddress,
      settings,
      toBlockchainInContractNumber
    );
    let transactionHash;
    await (
      this.privateAdapter[trade.fromBlockchain] as PrivateAdapterService
    ).tryExecuteContractMethod(
      contractAddress,
      this.contractAbi,
      methodName,
      methodArguments,
      {
        ...options,
        value,
        onTransactionHash: (hash: string) => {
          if (options.onTransactionHash) {
            options.onTransactionHash(hash);
          }
          transactionHash = hash;
        }
      },
      err => {
        const includesErrCode = err?.message?.includes('-32000');
        const allowedErrors = [
          'insufficient funds for transfer',
          'insufficient funds for gas * price+ value',
          'insufficient funds for gas * price + value'
        ];
        const includesPhrase = Boolean(allowedErrors.find(error => err?.message?.includes(error)));
        return includesErrCode && includesPhrase;
      }
    );
    return transactionHash;
  }

  public async executeCCRContract(
    trade: CrossChainRoutingTrade,
    options: TransactionOptions,
    userAddress: string,
    settings: CcrSettingsForm,
    toBlockchainInContractNumber: number
  ): Promise<string> {
    const type = BlockchainsInfo.getBlockchainType(trade.fromBlockchain);
    if (type === 'ethLike') {
      return this.executeEthLikeContract(
        trade,
        options,
        userAddress,
        settings,
        toBlockchainInContractNumber
      );
    }
    if (type === 'solana') {
      // const { transaction, signers } = this.executeSolanaContract(trade, userAddress, null);
      await this.executeSolanaContract(trade, userAddress, toBlockchainInContractNumber);
      return null;
    }
    return null;
  }

  /**
   * Returns contract's method's data to execute trade.
   * @param trade Cross chain trade.
   * @param walletAddress Wallet address.
   * @param settings Cross-chain form settings.
   * @param toBlockchainInContractNumber Number of blockchain.
   * @return string contractAddress
   * Contract address in source network.
   * @return string methodName
   * Method's name to call in contract.
   * @return unknown[] methodArguments
   * Method's arguments to call method with.
   * @return string value
   * Value in Wei to send with transaction.
   */
  public async getContractData(
    trade: CrossChainRoutingTrade,
    walletAddress: string,
    settings: CcrSettingsForm,
    toBlockchainInContractNumber: number
  ): Promise<{
    contractAddress: string;
    methodName: string;
    methodArguments: unknown[];
    value: string;
  }> {
    const contractAddress = this.contractAddresses[trade.fromBlockchain][trade.fromContractIndex];
    const blockchainFromAdapter = this.publicBlockchainAdapterService[trade.fromBlockchain];
    const blockchainToAdapter = this.publicBlockchainAdapterService[trade.toBlockchain];

    const isFromTokenNative = blockchainFromAdapter.isNativeAddress(trade.tokenIn.address);
    const methodName = isFromTokenNative
      ? CROSS_CHAIN_ROUTING_SWAP_METHOD.SWAP_CRYPTO
      : CROSS_CHAIN_ROUTING_SWAP_METHOD.SWAP_TOKENS;

    const tokenInAmountMax = this.calculateTokenInAmountMax(trade, settings);
    const tokenInAmountAbsolute = Web3Public.toWei(tokenInAmountMax, trade.tokenIn.decimals);
    const tokenOutAmountMin = this.calculateTokenOutAmountMin(trade, settings);
    const tokenOutMinAbsolute = Web3Public.toWei(tokenOutAmountMin, trade.tokenOut.decimals);

    const firstTransitTokenAmountAbsolute = Web3Public.toWei(
      trade.firstTransitTokenAmount,
      this.transitTokens[trade.fromBlockchain].decimals
    );

    const methodArguments = [
      [
        toBlockchainInContractNumber,
        tokenInAmountAbsolute,
        trade.firstPath,
        trade.secondPath,
        firstTransitTokenAmountAbsolute,
        tokenOutMinAbsolute,
        walletAddress,
        blockchainToAdapter.isNativeAddress(trade.tokenOut.address)
      ]
    ];

    const blockchainCryptoFee = Web3Public.toWei(trade.cryptoFee);
    const value = new BigNumber(blockchainCryptoFee)
      .plus(isFromTokenNative ? tokenInAmountAbsolute : 0)
      .toFixed(0);

    return {
      contractAddress,
      methodName,
      methodArguments,
      value
    };
  }

  /**
   * Calculates maximum sent amount of token-in, based on tokens route and slippage.
   */
  public calculateTokenInAmountMax(
    trade: CrossChainRoutingTrade,
    settings: CcrSettingsForm
  ): BigNumber {
    if (trade.firstPath.length === 1) {
      return trade.tokenInAmount;
    }
    const slippageTolerance = settings.slippageTolerance / 100;
    return trade.tokenInAmount.multipliedBy(1 + slippageTolerance);
  }

  /**
   * Calculates minimum received amount of token-out, based on tokens route and slippage.
   */
  public calculateTokenOutAmountMin(
    trade: CrossChainRoutingTrade,
    settings: CcrSettingsForm
  ): BigNumber {
    if (trade.secondPath.length === 1) {
      return trade.tokenOutAmount;
    }
    const slippageTolerance = settings.slippageTolerance / 100;
    return trade.tokenOutAmount.multipliedBy(1 - slippageTolerance);
  }

  private createSolanaInstruction(
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
      blockchain: BigNumber;
      tokenInAmount: BigNumber;
      secondPath: string[];
      rbcTokenOut: BigNumber;
      tokenOutMin: BigNumber;
      newAddress: string;
      swapToCrypto: boolean;
    }
  ): TransactionInstruction {
    const keys: Array<AccountMeta> = [
      // SPL accounts.
      { pubkey: pdaConfig, isSigner: false, isWritable: false },
      { pubkey: pdaBlockchainConfig, isSigner: false, isWritable: false },
      { pubkey: splProgramId, isSigner: false, isWritable: false },
      // Amm accounts
      { pubkey: ammId, isSigner: false, isWritable: true },
      { pubkey: ammAuthority, isSigner: false, isWritable: false },
      { pubkey: ammOpenOrders, isSigner: false, isWritable: true },
      { pubkey: ammTargetOrders, isSigner: false, isWritable: true },
      { pubkey: poolCoinTokenAccount, isSigner: false, isWritable: true },
      { pubkey: poolPcTokenAccount, isSigner: false, isWritable: true },
      // Serum accounts
      { pubkey: serumProgramId, isSigner: false, isWritable: false },
      { pubkey: serumMarket, isSigner: false, isWritable: true },
      { pubkey: serumBids, isSigner: false, isWritable: true },
      { pubkey: serumAsks, isSigner: false, isWritable: true },
      { pubkey: serumEventQueue, isSigner: false, isWritable: true },
      { pubkey: serumCoinVaultAccount, isSigner: false, isWritable: true },
      { pubkey: serumPcVaultAccount, isSigner: false, isWritable: true },
      { pubkey: serumVaultSigner, isSigner: false, isWritable: false },
      { pubkey: userSourceTokenAccount, isSigner: false, isWritable: true },
      { pubkey: userDestTokenAccount, isSigner: false, isWritable: true },
      { pubkey: userOwner, isSigner: true, isWritable: false },
      // User accounts.
      { pubkey: userSourceTokenAccount, isSigner: false, isWritable: true },
      { pubkey: userDestTokenAccount, isSigner: false, isWritable: true },
      { pubkey: userOwner, isSigner: true, isWritable: false },
      // Other accounts.
      { pubkey: raydiumAmm, isSigner: false, isWritable: false },
      { pubkey: pdaDelegate, isSigner: false, isWritable: true },
      { pubkey: systemProgram, isSigner: false, isWritable: false }
    ];

    const dataLayout = DATA_LAYOUT;
    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
      {
        blockchain: swapParams.blockchain,
        token_in_amount: swapParams.tokenInAmount,
        second_path: swapParams.secondPath,
        exact_rbc_token_out: swapParams.rbcTokenOut,
        token_out_min: swapParams.tokenOutMin,
        new_address: swapParams.newAddress,
        swap_to_crypto: swapParams.swapToCrypto
      },
      data
    );

    return new TransactionInstruction({
      keys,
      programId: new PublicKey(SOLANA_CROSS_CHAIN_CONTRACT),
      data
    });
  }

  setTargetNetworkAddress(address: string): void {
    this.targetAddress = address;
  }
}
