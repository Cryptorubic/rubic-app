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
import { BlockchainName, nativeTokensList } from 'rubic-sdk';

import { Observable, combineLatest, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

enum TradesHistory {
  CROSS_CHAIN,
  LIMIT_ORDER
}

@Component({
  selector: 'app-mobile-user-profile',
  templateUrl: './mobile-user-profile.component.html',
  styleUrls: ['./mobile-user-profile.component.scss']
})
export class MobileUserProfileComponent {
  public menu: TradesHistory = TradesHistory.CROSS_CHAIN;

  public readonly TradesHistory = TradesHistory;

  public readonly currentBalance$: Observable<{ balance: BigNumber; symbol: string }>;

  public isWalletCopied: boolean;

  public readonly ADDRESS_TYPE = ADDRESS_TYPE;

  public toBlockchain: BlockchainName;

  public readonly currentUser$: Observable<
    UserInterface & { blockchainName: BlockchainName; blockchainIcon: string }
  >;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<void, void>,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly tokenService: TokensService,
    private readonly cdr: ChangeDetectorRef
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
        from(
          this.tokenService.getAndUpdateTokenBalance({
            address: NATIVE_TOKEN_ADDRESS,
            blockchain
          })
        ).pipe(
          map(balance => ({
            balance,
            symbol: nativeTokensList[blockchain].symbol
          }))
        )
      )
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

  public switchMenu(menu: TradesHistory): void {
    this.menu = menu;
  }
}
