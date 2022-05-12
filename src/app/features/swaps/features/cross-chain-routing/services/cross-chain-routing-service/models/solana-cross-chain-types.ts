import { BlockchainNumber } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/models/blockchain-number';
import { PublicKey } from '@solana/web3.js';

export interface CrossChainArguments {
  blockchain: BlockchainNumber;
  tokenInAmount: number;
  secondPath: string[];
  exactRbcTokenOut: number;
  tokenOutMin: string;
  newAddress: string;
  swapToCrypto: boolean;
  transferType: TransferDataType;
  methodName: string;
}

export interface CrossChainPublicKeys {
  pdaConfig: PublicKey;
  pdaBlockchainConfig: PublicKey;
  splProgramId: PublicKey;
  ammId: PublicKey;
  ammAuthority: PublicKey;
  ammOpenOrders: PublicKey;
  ammTargetOrders: PublicKey;
  poolCoinTokenAccount: PublicKey;
  poolPcTokenAccount: PublicKey;
  serumProgramId: PublicKey;
  serumMarket: PublicKey;
  serumBids: PublicKey;
  serumAsks: PublicKey;
  serumEventQueue: PublicKey;
  serumCoinVaultAccount: PublicKey;
  serumPcVaultAccount: PublicKey;
  serumVaultSigner: PublicKey;
  userSourceTokenAccount: PublicKey;
  userDestTokenAccount: PublicKey;
  userOwner: PublicKey;
  raydiumAmm: PublicKey;
  pdaDelegate: PublicKey;
  systemProgram: PublicKey;
  wrappedSolMint: PublicKey;
  pdaWrapped: PublicKey;
}

export enum TransferDataType {
  NON_TRANSFER_TOKEN = 0,
  TRANSFER_TOKEN = 1,
  NATIVE = 2
}
