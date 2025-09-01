import { Component, ChangeDetectorRef, Inject } from '@angular/core';
import { AuthService } from '@app/core/services/auth/auth.service';
import { UserInterface } from '@app/core/services/auth/models/user.interface';
import { TokensService } from '@app/core/services/tokens/tokens.service';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { blockchainIcon } from '@app/shared/constants/blockchain/blockchain-icon';
import { NATIVE_TOKEN_ADDRESS } from '@app/shared/constants/blockchain/native-token-address';
import ADDRESS_TYPE from '@app/shared/models/blockchain/address-type';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import BigNumber from 'bignumber.js';

import { Observable, combineLatest, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { TradesHistory } from '@core/header/components/header/components/mobile-user-profile/models/tradeHistory';
import { Router } from '@angular/router';
import { BlockchainName } from '@cryptorubic/core';
import { nativeTokensList } from '@cryptorubic/sdk';

interface ContextData {
  tradesHistory: TradesHistory;
}

@Component({
  selector: 'app-mobile-user-profile',
  templateUrl: './mobile-user-profile.component.html',
  styleUrls: ['./mobile-user-profile.component.scss']
})
export class MobileUserProfileComponent {
  public readonly currentBalance$: Observable<{ balance: BigNumber; symbol: string }>;

  public isWalletCopied: boolean;

  public readonly ADDRESS_TYPE = ADDRESS_TYPE;

  public toBlockchain: BlockchainName;

  public readonly currentUser$: Observable<
    UserInterface & { blockchainName: BlockchainName; blockchainIcon: string }
  >;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<void, ContextData>,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly tokenService: TokensService,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router
  ) {
    const currentUser$ = this.authService.currentUser$;

    const currentBlockchain$ = this.walletConnectorService.networkChange$.pipe(
      map(blockchainName => ({
        blockchainName,
        blockchainIcon: blockchainName ? blockchainIcon[blockchainName] : ''
      }))
    );

    this.currentUser$ = combineLatest([currentUser$, currentBlockchain$]).pipe(
      map(([user, blockchain]) => ({
        ...user,
        ...blockchain
      }))
    );

    this.currentBalance$ = this.walletConnectorService.networkChange$.pipe(
      switchMap(blockchain =>
        forkJoin([
          this.tokenService.getAndUpdateTokenBalance({
            address: NATIVE_TOKEN_ADDRESS,
            blockchain
          }),
          of(blockchain)
        ])
      ),
      map(([balance, blockchain]) => {
        return {
          balance,
          symbol: nativeTokensList[blockchain].symbol
        };
      })
    );
  }

  public onWalletAddressCopied(): void {
    this.isWalletCopied = true;
    setTimeout(() => {
      this.isWalletCopied = false;
      this.cdr.markForCheck();
    }, 700);
  }

  public logout(): void {
    this.context.completeWith();
    this.authService.disconnectWallet();
  }

  public async navigateHistory(): Promise<void> {
    await this.router.navigate(['/history']);
    this.context.completeWith();
  }
}
