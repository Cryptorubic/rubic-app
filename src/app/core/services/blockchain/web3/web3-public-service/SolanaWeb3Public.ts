import BigNumber from 'bignumber.js';
import { toChecksumAddress } from 'web3-utils';
import {
  NATIVE_ETH_LIKE_TOKEN_ADDRESS,
  NATIVE_SOLANA_MINT_ADDRESS
} from '@shared/constants/blockchain/NATIVE_ETH_LIKE_TOKEN_ADDRESS';
import InsufficientFundsError from 'src/app/core/errors/models/instant-trade/InsufficientFundsError';
import { BIG_NUMBER_FORMAT } from 'src/app/shared/constants/formats/BIG_NUMBER_FORMAT';

import {
  Account,
  AccountInfo,
  Connection,
  PublicKey,
  RpcResponseAndContext,
  Transaction,
  TransactionResponse
} from '@solana/web3.js';
import { compareAddresses } from '@shared/utils/utils';
import { SolanaWallet } from '@core/services/blockchain/wallets/wallets-adapters/solana/models/types';
import { BlockchainTokenExtended } from '@shared/models/tokens/BlockchainTokenExtended';
import { CommonWalletAdapter } from '@core/services/blockchain/wallets/wallets-adapters/common-wallet-adapter';
import { NATIVE_SOL } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/tokens';

export class SolanaWeb3Public {
  public readonly connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  static get nativeTokenAddress(): string {
    return NATIVE_ETH_LIKE_TOKEN_ADDRESS;
  }

  static toWei(amount: BigNumber | string | number, decimals = 18): string {
    return new BigNumber(amount || 0).times(new BigNumber(10).pow(decimals)).toFixed(0);
  }

  static fromWei(amountInWei: BigNumber | string | number, decimals = 18): BigNumber {
    return new BigNumber(amountInWei).div(new BigNumber(10).pow(decimals));
  }

  static toChecksumAddress(address: string): string {
    return toChecksumAddress(address);
  }

  /**
   * @TODO Solana.
   * Gets allowance.
   */
  public async getAllowance(): Promise<BigNumber> {
    return new BigNumber(999999);
  }

  /**
   * Checks if a given address is a valid Solana address.
   * @param address The address to check validity.
   */
  public isAddressCorrect(address: string): boolean {
    // @TODO Solana.
    try {
      return Boolean(new PublicKey(address)?.toBase58());
    } catch {
      return false;
    }
  }

  /**
   * checks if address is Ether native address
   * @param address address to check
   */
  public isNativeAddress = (address: string): boolean => {
    return address === NATIVE_SOLANA_MINT_ADDRESS;
  };

  public async getTokenInfo(): Promise<BlockchainTokenExtended> {
    return null;
  }

  /**
   *
   * @param userAddress wallet address whose balance you want to find out
   * @param tokenAddress address of the smart-contract corresponding to the token
   */
  public async getTokenOrNativeBalance(
    userAddress: string,
    tokenAddress: string
  ): Promise<BigNumber> {
    return this.isNativeAddress(tokenAddress)
      ? new BigNumber(
          (
            await this.connection.getBalanceAndContext(new PublicKey(userAddress), 'confirmed')
          ).value.toString()
        )
      : (await this.getTokensBalances(userAddress, [tokenAddress]))?.[0];
  }

  /**
   * gets ERC-20 tokens balance as integer (multiplied to 10 ** decimals)
   * @param tokenAddress address of the smart-contract corresponding to the token
   * @param address wallet address whose balance you want to find out
   * @return account tokens balance as integer (multiplied to 10 ** decimals)
   */
  public async getTokenBalance(address: string, tokenAddress: string): Promise<BigNumber> {
    return (await this.getTokensBalances(address, [tokenAddress]))?.[0];
  }

  /**
   * @TODO SOLANA.
   * Predicts the volume of gas required to execute the contract method
   */
  public async getEstimatedGas(): Promise<BigNumber> {
    const { feeCalculator } = await this.connection.getRecentBlockhash();
    return new BigNumber(feeCalculator.lamportsPerSignature);
  }

  /**
   * get a transaction by hash in several attempts
   * @param hash hash of the target transaction
   * @param attempt current attempt number
   * @param attemptsLimit maximum allowed number of attempts
   * @param delay ms delay before next attempt
   */
  public async getTransactionByHash(
    hash: string,
    attempt?: number,
    attemptsLimit?: number,
    delay?: number
  ): Promise<TransactionResponse> {
    attempt = attempt || 0;
    const limit = attemptsLimit || 10;
    const timeoutMs = delay || 500;

    if (attempt >= limit) {
      return null;
    }

    const transaction = await this.connection.getTransaction(hash);
    if (transaction === null) {
      return new Promise(resolve =>
        setTimeout(() => resolve(this.getTransactionByHash(hash, attempt + 1)), timeoutMs)
      );
    }
    return transaction;
  }

  /**
   * @TODO SOLANA.
   * get balance of multiple tokens via multicall.
   * @param address wallet address
   * @param tokensAddresses tokens addresses
   */
  public async getTokensBalances(address: string, tokensAddresses: string[]): Promise<BigNumber[]> {
    // @TODO Solana.
    type ReturnValue = Promise<{
      result: RpcResponseAndContext<
        Array<{
          pubkey: PublicKey;
          account: AccountInfo<{
            parsed: {
              info: {
                tokenAmount: {
                  amount: number;
                  decimals: number;
                };
                mint: string;
              };
            };
          }>;
        }>
      >;
    }>;
    const resp = await (
      this.connection as Connection & {
        _rpcRequest: (owner: string, data: unknown[]) => ReturnValue;
      }
    )._rpcRequest('getTokenAccountsByOwner', [
      address,
      {
        programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
      },
      {
        encoding: 'jsonParsed'
      }
    ]);

    const nativeSolBalance = await this.connection.getBalanceAndContext(
      new PublicKey(address),
      'confirmed'
    );

    return tokensAddresses.map(tokenAddress => {
      if (tokenAddress === NATIVE_SOL.mintAddress) {
        return new BigNumber(nativeSolBalance.value.toFixed(5));
      }
      const tokenWithBalance = resp.result.value.find(token => {
        const { info } = token.account.data.parsed;
        return compareAddresses(info.mint, tokenAddress);
      });
      return new BigNumber(
        tokenWithBalance ? tokenWithBalance.account.data.parsed.info.tokenAmount.amount : NaN
      );
    });
  }

  public async signTransaction(
    walletAdapter: CommonWalletAdapter<SolanaWallet>,
    transaction: Transaction,
    signers: Array<Account> = []
  ): Promise<Transaction> {
    transaction.recentBlockhash = (await this.connection.getRecentBlockhash()).blockhash;
    transaction.setSigners(new PublicKey(walletAdapter.address), ...signers.map(s => s.publicKey));
    if (signers.length > 0) {
      transaction.partialSign(...signers);
    }
    return await walletAdapter.wallet.signTransaction(transaction);
  }

  /**
   * Checks if the specified address contains the required amount of these tokens.
   * Throws an InsufficientFundsError if the balance is insufficient
   * @param token token balance for which you need to check
   * @param amount required balance
   * @param userAddress the address where the required balance should be
   */
  public async checkBalance(
    token: { address: string; symbol: string; decimals: number },
    amount: BigNumber,
    userAddress: string
  ): Promise<void> {
    const balance = await this.getTokenBalance(userAddress, token.address);
    const amountAbsolute = SolanaWeb3Public.toWei(amount, token.decimals);

    if (balance.lt(amountAbsolute)) {
      const formattedTokensBalance = SolanaWeb3Public.fromWei(balance, token.decimals).toFormat(
        BIG_NUMBER_FORMAT
      );
      throw new InsufficientFundsError(
        token.symbol,
        formattedTokensBalance,
        amount.toFormat(BIG_NUMBER_FORMAT)
      );
    }
  }

  /**
   * Tries to execute method of smart-contract.
   * @param contractAddress Address of smart-contract which method is to be executed.
   * @param contractAbi Abi of smart-contract which method is to be executed.
   * @param methodName Method to execute.
   * @param methodArguments Method's arguments.
   * @param fromAddress Address, from which transaction will be sent.
   * @param [options] Additional options.
   * @param [options.value] Value in Wei to be attached to the transaction.
   * @param [options.gas] Gas limit to be attached to the transaction.
   */
  public async tryExecuteContractMethod(): /*
    contractAddress: string,
    contractAbi: AbiItem[],
    methodName: string,
    methodArguments: unknown[],
    fromAddress: string,
    options: TransactionOptions = {} */
  Promise<void | never> {
    // const contract = new this.web3.eth.Contract(contractAbi, contractAddress);
    //
    // try {
    //   await contract.methods[methodName](...methodArguments).call({
    //     from: fromAddress,
    //     ...(options.value && { value: options.value }),
    //     ...(options.gas && { gas: options.gas })
    //     // ...(options.gasPrice && { gasPrice: options.gasPrice }) doesn't work on mobile
    //   });
    //   return;
    // } catch (err) {
    //   console.error('Method execution error:', err);
    //   throw err;
    // }
    return null;
  }
}
