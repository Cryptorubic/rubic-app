import { Inject, Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';
import { EXTERNAL_LINKS } from '@shared/constants/common/links';
import { from, Observable, of } from 'rxjs';
import { ActivationResult } from '@shared/guards/models/types';
import { PublicBlockchainAdapterService } from '@app/core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { BLOCKCHAIN_NAME } from '../models/blockchain/blockchain-name';
import { ENVIRONMENT } from 'src/environments/environment';
import { LP_PROVIDING_CONTRACT_ABI } from '@app/features/liquidity-providing/constants/LP_PROVIDING_CONTRACT_ABI';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class UntilTimeGuard implements CanActivate {
  private readonly redirectUrl = EXTERNAL_LINKS.LANDING_STAKING;

  // private readonly expireDateUTC = Date.UTC(2022, 2, 1, 14, 0, 0, 0);

  // private readonly greenwichTimeApiUrl =
  //   'https://script.googleusercontent.com/macros/echo?user_content_key=Vhsl1EP7sG2pMrcSNoyf0eAn7o8_UMnbX13lYZadzbU6HWn8kDJHWNHkepkSmqSvn3Rj0G4LNOIISxLzLVZLi8i-_6Bp5L5km5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnJ9GRkcRevgjTvo8Dc32iw_BLJPcPfRdVKhJT5HNzQuXEeN3QFwl2n0M6ZmO-h7C6bwVq0tbM60-zM6AQdjHj01JxuldTWgDhQ&lib=MwxUjRcLr2qLlnVOLh12wSNkqcO1Ikdrk';

  // private readonly maxTimeDiff = 1000;

  private readonly lpProvidingContract = ENVIRONMENT.lpProviding.contractAddress;

  constructor(
    @Inject(WINDOW) private readonly window: RubicWindow,
    private readonly web3PublicService: PublicBlockchainAdapterService
  ) {}

  canActivate(): ActivationResult {
    return this.redirectIfExpired() as ActivationResult;
  }

  private redirectIfExpired(): Observable<Boolean> {
    return from(
      this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].callContractMethod<number>(
        this.lpProvidingContract,
        LP_PROVIDING_CONTRACT_ABI,
        'startTime'
      )
    ).pipe(
      switchMap(startTime => {
        // if LP contract has start time === 0 - round didnt started
        const isStarted = +startTime !== 0;
        if (!isStarted) {
          this.window.location.href = this.redirectUrl;
        }
        return of(isStarted);
      })
    );
  }
}
