import { Injectable } from '@angular/core';
import { AuthService } from '@app/core/services/auth/auth.service';
import { Web3Pure } from '@app/core/services/blockchain/blockchain-adapters/common/web3-pure';
import { PrivateBlockchainAdapterService } from '@app/core/services/blockchain/blockchain-adapters/private-blockchain-adapter.service';
import { PublicBlockchainAdapterService } from '@app/core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { WalletConnectorService } from '@app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { TokensService } from '@app/core/services/tokens/tokens.service';
import { BLOCKCHAIN_NAME } from '@app/shared/models/blockchain/blockchain-name';
import { TuiDialogService } from '@taiga-ui/core';
import BigNumber from 'bignumber.js';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { ENVIRONMENT } from 'src/environments/environment';
import { LP_PROVIDING_CONTRACT_ABI } from '../constants/LP_PROVIDING_CONTRACT_ABI';
import { POOL_TOKENS } from '../constants/POOL_TOKENS';
import { LpError } from '../models/lp-error.enum';
import { LiquidityPeriod } from '../models/stake-period.enum';

@Injectable()
export class LpProvidingService {
  private readonly lpProvidingContract = ENVIRONMENT.lpProviding.contractAddress;

  public readonly minEnterAmount = ENVIRONMENT.lpProviding.minEnterAmount;

  public readonly maxEnterAmount = ENVIRONMENT.lpProviding.maxEnterAmount;

  public readonly poolSize = ENVIRONMENT.lpProviding.poolSize;

  private readonly blockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;

  private readonly brbcAddress = POOL_TOKENS[0].address;

  private readonly usdcAddress = POOL_TOKENS[1].address;

  private get userAddress(): string {
    return this.authService.userAddress;
  }

  public readonly needLogin$ = this.authService
    .getCurrentUser()
    .pipe(map(({ address }) => Boolean(address)));

  public infoLoading$ = new BehaviorSubject<boolean>(true);

  public progressLoading$ = new BehaviorSubject<boolean>(true);

  constructor(
    private readonly web3PublicService: PublicBlockchainAdapterService,
    private readonly web3PrivateService: PrivateBlockchainAdapterService,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly tokensService: TokensService,
    private readonly dialogService: TuiDialogService,
    private readonly notificationsService: NotificationsService
  ) {}

  public getRewards(): void {}

  public getUsdcAmountTotalStaked(): void {
    this.web3PublicService[this.blockchain].tryExecuteContractMethod(
      this.lpProvidingContract,
      LP_PROVIDING_CONTRACT_ABI,
      'getUsdcAmountStaked',
      [this.userAddress],
      this.userAddress
    );
  }

  public getPoolTokensBalances(): Observable<BigNumber[]> {
    return this.walletConnectorService.addressChange$.pipe(
      switchMap(address =>
        from(
          this.web3PublicService[this.blockchain].getTokensBalances(address, [
            this.usdcAddress,
            this.brbcAddress
          ])
        )
      ),
      tap(([usdcBalance, brbcBalance]) => {
        console.log(usdcBalance, brbcBalance);
      })
    );
  }

  public getTokensByOwner(): Observable<void> {
    return this.walletConnectorService.addressChange$.pipe(
      switchMap(ownerAddress =>
        from(
          this.web3PublicService[this.blockchain].tryExecuteContractMethod(
            this.lpProvidingContract,
            LP_PROVIDING_CONTRACT_ABI,
            'getTokensByOwner',
            [ownerAddress],
            ownerAddress
          )
        )
      ),
      tap(v => console.log(v))
    );
  }

  public needApprove(tokenAddress: string): void {
    this.web3PublicService[this.blockchain].getAllowance({
      tokenAddress: tokenAddress,
      ownerAddress: this.userAddress,
      spenderAddress: this.lpProvidingContract
    });
  }

  public approvePoolTokens(): void {
    this.web3PrivateService[this.blockchain].approveTokens(
      this.usdcAddress,
      this.lpProvidingContract,
      'infinity'
    );

    this.web3PrivateService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].approveTokens(
      this.brbcAddress,
      this.lpProvidingContract,
      'infinity'
    );
  }

  public approveNftToken(spenderAddress: string, nftId: number): void {
    this.web3PrivateService[this.blockchain].tryExecuteContractMethod(
      this.lpProvidingContract,
      LP_PROVIDING_CONTRACT_ABI,
      'approve',
      [spenderAddress, nftId]
    );
  }

  public requestWithdraw(nftId: number): void {
    this.web3PrivateService[this.blockchain].tryExecuteContractMethod(
      this.lpProvidingContract,
      LP_PROVIDING_CONTRACT_ABI,
      'requestWithdraw',
      [nftId]
    );
  }

  public withdraw(nftId: number): void {
    this.web3PrivateService[this.blockchain].tryExecuteContractMethod(
      this.lpProvidingContract,
      LP_PROVIDING_CONTRACT_ABI,
      'claimRewards',
      [nftId]
    );
  }

  public stake(amount: BigNumber, period: number): void {
    this.web3PrivateService[this.blockchain].tryExecuteContractMethod(
      this.lpProvidingContract,
      LP_PROVIDING_CONTRACT_ABI,
      'stake',
      [Web3Pure.toWei(amount), period]
    );
  }

  // public removeDeposit(nftId: number): void {}

  private checkErrors(amount: BigNumber): LpError {
    const balance = 10000;

    if (amount.gt(balance)) {
      return LpError.INSUFFICIENT_BALANCE;
    }

    if (amount.gt(this.maxEnterAmount)) {
      return LpError.LIMIT_GT_MAX;
    }

    if (amount.lt(this.minEnterAmount)) {
      return LpError.LIMIT_LT_MIN;
    }

    if (!amount.isFinite()) {
      return LpError.EMPTY_AMOUNT;
    }
  }

  public getRate(days: number): number {
    if (days < LiquidityPeriod.AVERAGE) {
      return 0.1;
    }

    if (days < LiquidityPeriod.LONG && days >= LiquidityPeriod.AVERAGE) {
      return 0.8;
    }

    return 1;
  }

  private calculateRelativeAmount(amount: BigNumber, relativeTo: 'usdc' | 'brbc'): BigNumber {
    return relativeTo === 'usdc' ? amount.multipliedBy(1) : amount.multipliedBy(2);
  }

  public async calculateUsdPrice(value: BigNumber, token: 'brbc' | 'usdc'): Promise<BigNumber> {
    const usdPrice = await this.tokensService.getAndUpdateTokenPrice({
      address: token === 'brbc' ? this.brbcAddress : this.usdcAddress,
      blockchain: this.blockchain
    });

    return value.multipliedBy(usdPrice);
  }
}
