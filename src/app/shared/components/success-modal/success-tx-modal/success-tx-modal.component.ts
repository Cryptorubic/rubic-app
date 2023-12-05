import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy
} from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import ADDRESS_TYPE from '@shared/models/blockchain/address-type';
import { SuccessTxModalType } from '@shared/components/success-trx-notification/models/modal-type';
import {
  BLOCKCHAIN_NAME,
  BlockchainName,
  CROSS_CHAIN_TRADE_TYPE,
  CrossChainTradeType
} from 'rubic-sdk';
import { ROUTE_PATH } from '@shared/constants/common/links';
import { Router } from '@angular/router';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { map } from 'rxjs';
import { AirdropPointsService } from '@shared/services/airdrop-points-service/airdrop-points.service';

@Component({
  selector: 'polymorpheus-success-tx-modal',
  templateUrl: './success-tx-modal.component.html',
  styleUrls: ['./success-tx-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessTxModalComponent implements AfterViewInit, OnDestroy {
  public isSwapAndEarnSwap: boolean;

  public idPrefix: string;

  public type: SuccessTxModalType;

  public ccrProviderType: CrossChainTradeType;

  public txHash: string;

  public blockchain: BlockchainName;

  public readonly ADDRESS_TYPE = ADDRESS_TYPE;

  public readonly CROSS_CHAIN_PROVIDER = CROSS_CHAIN_TRADE_TYPE;

  public readonly BLOCKCHAIN_NAME = BLOCKCHAIN_NAME;

  public hideUnusedUI: boolean = this.queryParamsService.hideUnusedUI;

  public readonly bonusPoints$ = this.airdropPointsService.points$.pipe(
    map(points => this.getBonusPoints(points.participant))
  );

  constructor(
    private readonly queryParamsService: QueryParamsService,
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<
      boolean,
      {
        idPrefix: string;
        type: SuccessTxModalType;
        txHash: string;
        blockchain: BlockchainName;
        ccrProviderType: CrossChainTradeType;
        isSwapAndEarnSwap?: boolean;
      }
    >,
    private readonly router: Router,
    private readonly airdropPointsService: AirdropPointsService
  ) {
    this.isSwapAndEarnSwap = context.data.isSwapAndEarnSwap;
    this.idPrefix = context.data.idPrefix;
    this.type = context.data.type;
    this.txHash = context.data.txHash;
    this.blockchain = context.data.blockchain;
    this.ccrProviderType = context.data.ccrProviderType;
  }

  ngAfterViewInit(): void {
    if (this.isSwapAndEarnSwap) {
      SuccessTxModalComponent.toggleConfettiBackground('show');
    }
  }

  ngOnDestroy(): void {
    this.airdropPointsService.updateSwapToEarnUserPointsInfo();
    SuccessTxModalComponent.toggleConfettiBackground('remove');
  }

  private static toggleConfettiBackground(action: 'show' | 'remove'): void {
    const overlay = document.querySelector('.t-overlay');

    if (action === 'show') {
      overlay.classList.add('t-overlay-it-confetti');
    }

    if (action === 'remove') {
      overlay.classList.remove('t-overlay-it-confetti');
    }
  }

  public onConfirm(): void {
    this.airdropPointsService.updateSwapToEarnUserPointsInfo();
    this.context.completeWith(null);
  }

  public async navigateToSwapAndEarn(): Promise<void> {
    await this.router.navigate([ROUTE_PATH.AIRDROP], { queryParamsHandling: '' });

    this.context.completeWith(null);
  }

  public getBonusPoints(isParticipant: boolean): number {
    return isParticipant ? 12 : 25;
  }
}
