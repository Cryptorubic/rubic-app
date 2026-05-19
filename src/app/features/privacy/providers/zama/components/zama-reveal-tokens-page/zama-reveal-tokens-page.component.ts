import { ChangeDetectionStrategy, Component, Self } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PrivateEvent } from '../../../shared-privacy-providers/models/private-event';
import { ZamaPrivateAssetsService } from '../../services/zama-private-assets.service';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { ZamaRevealFacadeService } from '../../services/zama-reveal-tokens-facade.service';
import { ZamaFacadeService } from '../../services/zama-sdk/zama-facade.service';
import {
  BLOCKCHAIN_NAME,
  compareAddresses,
  EvmBlockchainName,
  Token,
  TokenAmount
} from '@cryptorubic/core';

import { filter, firstValueFrom, map, startWith, switchMap, takeUntil, tap } from 'rxjs';
import { PrivateActionButtonService } from '../../../shared-privacy-providers/services/private-action-button/private-action-button.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { PrivateUnshieldFormConfig } from '../../../shared-privacy-providers/models/swap-form-types';
import { ZamaBalanceService } from '../../services/zama-sdk/zama-balance.service';
import { RevealWindowService } from '../../../shared-privacy-providers/services/reveal-window/reveal-window.service';
import BigNumber from 'bignumber.js';
import { FromAssetsService } from '@app/features/trade/components/assets-selector/services/from-assets.service';
import { getEmptySwapFormInput } from '@app/features/privacy/utils/empty-swap-form-input';
import { PendingUnshieldToken } from '../../services/zama-sdk/models/pending-unshield-token';

@Component({
  selector: 'app-zama-reveal-tokens-page',
  templateUrl: './zama-reveal-tokens-page.component.html',
  styleUrls: ['./zama-reveal-tokens-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TuiDestroyService,
    { provide: FromAssetsService, useClass: ZamaPrivateAssetsService },
    { provide: TokensFacadeService, useClass: ZamaRevealFacadeService }
  ]
})
export class ZamaRevealTokensPageComponent {
  public readonly receiverCtrl = new FormControl<string>('');

  public readonly creationConfig: PrivateUnshieldFormConfig = {
    withActionButton: true,
    withReceiver: true,
    withSrcAmount: true,
    withMaxBtn: true,
    receiverPlaceholder: 'Enter receiver’s EVM wallet address',
    direction: 'from',
    showPresets: false,
    showWarnings: false
  };

  public readonly pendingUnshieldBalance$ = this.zamaBalanceService.pendingUnshieldBalances$.pipe(
    switchMap(pendingBalances => {
      return this.zamaRevealFacade
        .getTokensList(BLOCKCHAIN_NAME.ETHEREUM, '', 'from', getEmptySwapFormInput())
        .pipe(
          map(tokens =>
            tokens.filter(token =>
              pendingBalances[token.blockchain as EvmBlockchainName]?.find(t =>
                compareAddresses(t.tokenAddress, token.address)
              )
            )
          ),
          map(unshieldTokens => {
            return unshieldTokens.map(unshieldToken => {
              const pendingBalance = pendingBalances[
                unshieldToken.blockchain as EvmBlockchainName
              ].find(t => compareAddresses(t.tokenAddress, unshieldToken.address));

              const pendingToken: PendingUnshieldToken = {
                ...unshieldToken,
                encryptedAmount: pendingBalance.encryptedAmount,
                decryptedWeiAmount: pendingBalance.decryptedWeiAmount
              };

              return pendingToken;
            });
          })
        );
    })
  );

  constructor(
    private readonly zamaFacadeService: ZamaFacadeService,
    private readonly privateActionButtonService: PrivateActionButtonService,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly zamaBalanceService: ZamaBalanceService,
    private readonly revealWindowService: RevealWindowService,
    private readonly zamaRevealFacade: ZamaRevealFacadeService
  ) {}

  ngOnInit(): void {
    this.receiverCtrl.valueChanges
      .pipe(
        startWith(this.receiverCtrl.value),
        tap(address => {
          this.privateActionButtonService.setReceiverAddress(address);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
    this.subscribeOnPrivateBalanceChanges();
  }

  private subscribeOnPrivateBalanceChanges(): void {
    this.zamaBalanceService.balances$
      .pipe(
        filter(() => !!this.revealWindowService.revealAsset?.address),
        map(shieldBalances => {
          const balances =
            shieldBalances[this.revealWindowService.revealAsset?.blockchain as EvmBlockchainName];

          return (
            balances &&
            balances.find(balance =>
              compareAddresses(balance.tokenAddress, this.revealWindowService.revealAsset.address)
            )
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(shieldBalance => {
        const revealAsset = this.revealWindowService.revealAsset;

        this.revealWindowService.setRevealAsset({
          ...revealAsset,
          amount: shieldBalance ? Token.fromWei(shieldBalance.amount, 6) : new BigNumber(0)
        });
      });
  }

  public async reveal({ token, loadingCallback, openPreview }: PrivateEvent): Promise<void> {
    try {
      const steps = await this.zamaFacadeService.prepareUnwrapSteps(
        token as TokenAmount<EvmBlockchainName>,
        this.receiverCtrl.value
      );
      const preview$ = openPreview({ steps });

      await firstValueFrom(preview$);
    } finally {
      loadingCallback();
    }
  }
}
