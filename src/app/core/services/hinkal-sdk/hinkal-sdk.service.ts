import { Injectable } from '@angular/core';
import { ThemeService } from '../theme/theme.service';
import {
  blockchainId,
  BlockchainName,
  BlockchainsInfo,
  CHAIN_TYPE,
  compareAddresses
} from '@cryptorubic/core';
import { ERC20Token, Hinkal, RelayerTransaction, UserKeys } from '@hinkal/common';
import { ethers } from 'ethers';
import { prepareEthersHinkal } from '@hinkal/common/providers/prepareEthersHinkal';
import BigNumber from 'bignumber.js';
import { ErrorsService } from '@app/core/errors/errors.service';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { RubicAny } from '@app/shared/models/utility-types/rubic-any';

export const SUPPORT_PRIVATE_SWAP_CHAIN_IDS = [1, 137, 42161, 10, 8453];

@Injectable({
  providedIn: 'root'
})
export class HinkalSDKService {
  public hinkalSDK: Hinkal<unknown> | null;

  constructor(
    private readonly themeService: ThemeService,
    private readonly errorService: ErrorsService
  ) {}

  public isPrivateMode(): boolean {
    return this.themeService.theme === 'private';
  }

  public async prepareHinkalSDK(
    blockchain: BlockchainName,
    wallet: RubicAny,
    forceInit?: boolean
  ): Promise<void> {
    const chainType = BlockchainsInfo.getChainType(blockchain);

    if (!forceInit && (chainType !== CHAIN_TYPE.EVM || !this.isPrivateMode())) {
      this.hinkalSDK = null;
      return;
    }

    const signer = new ethers.providers.Web3Provider(wallet).getSigner();

    this.hinkalSDK = await prepareEthersHinkal(signer, {
      generateProofRemotely: true,
      disableCaching: false
    });
  }

  public async getPrivateBalance(chainId: number, tokenAddress: string): Promise<BigNumber> {
    try {
      const resp = await this.getPrivateBalances(chainId, [tokenAddress]);
      return resp[0];
    } catch {
      return new BigNumber(NaN);
    }
  }

  public async getPrivateBalances(chainId: number, tokens: string[]): Promise<BigNumber[]> {
    const keys = this.hinkalSDK.userKeys;
    const [ethAddress] = await Promise.all([
      this.hinkalSDK.getEthereumAddress(),
      this.hinkalSDK.resetMerkleTreesIfNecessary()
    ]);

    // const bal = await this.hinkalSDK.getTotalBalance(chainId, keys, ethAddress, true, true);
    // const bal = await getShieldedBalance(
    //   this.hinkalSDK,
    //   chainId,
    //   keys.getShieldedPrivateKey(),
    //   keys.getShieldedPublicKey(),
    //   ethAddress,
    //   true,
    //   true,
    //   true
    // );
    // console.log(bal);
    const fetchedBalances = await this.hinkalSDK.getTotalBalance(chainId, keys, ethAddress);

    const balances: BigNumber[] = [];

    for (let token of tokens) {
      const balance = fetchedBalances.find(tokenBalance =>
        compareAddresses(tokenBalance.token.erc20TokenAddress, token)
      );

      const tokenIndex = tokens.indexOf(token);
      if (balance) {
        balances[tokenIndex] = new BigNumber(balance.balance.toString());
      } else {
        balances[tokenIndex] = new BigNumber(NaN);
      }
    }
    console.log(balances);
    console.log(tokens);
    return balances;
  }

  public async deposit(token: BalanceToken, _receiver: string, weiAmount: string): Promise<string> {
    try {
      if (!this.hinkalSDK) {
        await this.prepareHinkalSDK(token.blockchain, window.ethereum, true);
      }

      const depositToken: ERC20Token = {
        chainId: blockchainId[token.blockchain],
        erc20TokenAddress: token.address,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals
      };
      const deposit = await this.hinkalSDK.deposit([depositToken], [BigInt(weiAmount)]);

      const res = await deposit.wait();

      return res.transactionHash;
    } catch (err) {
      console.log('FAILED TO DEPOSIT', err);
      this.errorService.catch(err);
      return '';
    }
  }

  public async withdraw(token: BalanceToken, receiver: string, weiAmount: string): Promise<string> {
    try {
      const withdrawToken: ERC20Token = {
        chainId: blockchainId[token.blockchain],
        erc20TokenAddress: token.address,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals
      };

      const withdraw = (await this.hinkalSDK.withdraw(
        [withdrawToken],
        [-BigInt(weiAmount)],
        receiver,
        false,
        undefined,
        undefined,
        undefined,
        false
      )) as RelayerTransaction;

      return withdraw.transactionHash;
    } catch (err) {
      console.log('FAILED TO WITHDRAW', err);
      this.errorService.catch(err);
      return '';
    }
  }

  public async transfer(
    token: BalanceToken,
    privateShieldedKey: string,
    weiAmount: string
  ): Promise<string> {
    try {
      const s = BigInt(Date.now());
      const { stealthAddress, encryptionKey } = UserKeys.getStealthAddressWithEKey(
        s,
        privateShieldedKey
      );

      const { h0, h1 } = UserKeys.getStealthAddressCompressedPoints(s, privateShieldedKey);

      const privateRecipientAddress = `${s},${stealthAddress},${encryptionKey},${h0},${h1}`;

      const transferToken: ERC20Token = {
        chainId: blockchainId[token.blockchain],
        erc20TokenAddress: token.address,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals
      };

      const transfer = (await this.hinkalSDK.transfer(
        [transferToken],
        [-BigInt(weiAmount)],
        privateRecipientAddress,
        undefined,
        undefined,
        undefined,
        false
      )) as RelayerTransaction;
      return transfer.transactionHash;
    } catch (err) {
      console.log('FAILED TO WITHDRAW', err);
      this.errorService.catch(err);
      return '';
    }
  }
}
