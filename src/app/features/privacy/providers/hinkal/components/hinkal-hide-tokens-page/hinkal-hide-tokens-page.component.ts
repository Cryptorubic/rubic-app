import { ChangeDetectionStrategy, Component, Self } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PrivateEvent } from '../../../shared-privacy-providers/models/private-event';
import { FromAssetsService } from '@app/features/trade/components/assets-selector/services/from-assets.service';
import { HinkalPrivateAssetsService } from '../../services/hinkal-private-assets.service';
import { firstValueFrom, startWith, takeUntil, tap } from 'rxjs';
import { HinkalFacadeService } from '../../services/hinkal-sdk/hinkal-facade.service';

import { EvmBlockchainName, TokenAmount } from '@cryptorubic/core';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { PrivateActionButtonService } from '../../../shared-privacy-providers/services/private-action-button/private-action-button.service';

@Component({
  selector: 'app-hinkal-hide-tokens-page',
  templateUrl: './hinkal-hide-tokens-page.component.html',
  styleUrls: ['./hinkal-hide-tokens-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TuiDestroyService,
    {
      provide: FromAssetsService,
      useClass: HinkalPrivateAssetsService
    }
  ]
})
export class HinkalHideTokensPageComponent {
  public readonly receiverCtrl = new FormControl<string>('');

  public readonly creationConfig = {
    withActionButton: true,
    withReceiver: false,
    withSrcAmount: true
  };

  constructor(
    private readonly hinkalFacadeService: HinkalFacadeService,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly privateActionButtonService: PrivateActionButtonService
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
  }

  public async hide({ token, loadingCallback, openPreview }: PrivateEvent): Promise<void> {
    try {
      const preview$ = openPreview({
        steps: [
          {
            label: 'Shield',
            action: () => this.hinkalFacadeService.deposit(token as TokenAmount<EvmBlockchainName>)
          }
        ]
      });
      await firstValueFrom(preview$);
    } finally {
      loadingCallback();
    }
  }
}
