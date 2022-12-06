import { Injectable } from '@angular/core';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { BLOCKCHAIN_NAME, BlockchainName, BlockchainsInfo } from 'rubic-sdk';
import { BehaviorSubject, Observable, shareReplay } from 'rxjs';
import { distinctUntilChanged, first, map } from 'rxjs/operators';
import { observableToBehaviorSubject } from '@shared/utils/observableToBehaviorSubject';
import { FormControl, FormGroup } from '@angular/forms';
import {
  SwapForm,
  SwapFormInput,
  SwapFormInputControl,
  SwapFormOutput,
  SwapFormOutputControl
} from '@features/swaps/core/services/swaps-form-service/models/swap-form-controls';
import { distinctObjectUntilChanged } from '@shared/utils/distinct-object-until-changed';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { shareReplayConfig } from '@shared/constants/common/share-replay-config';

@Injectable({
  providedIn: 'root'
})
// @todo rename
export class SwapsFormService {
  public readonly form = new FormGroup<SwapForm>({
    input: new FormGroup<SwapFormInputControl>({
      fromAssetType: new FormControl(null),
      fromAsset: new FormControl(null),
      toBlockchain: new FormControl(BLOCKCHAIN_NAME.ETHEREUM),
      toToken: new FormControl(null),
      fromAmount: new FormControl(null)
    }),
    output: new FormGroup<SwapFormOutputControl>({
      toAmount: new FormControl(null)
    })
  });

  /**
   * Input control, used to patch value.
   */
  public readonly inputControl = this.form.controls.input;

  public get inputValue(): SwapFormInput {
    return this.form.get('input').value;
  }

  private readonly _inputValue$ = new BehaviorSubject<SwapFormInput>(this.inputValue);

  public readonly inputValue$ = this._inputValue$.asObservable();

  public readonly fromBlockchain$: Observable<BlockchainName | null> = this.inputValue$.pipe(
    map(inputValue => {
      const assetType = inputValue.fromAssetType;
      return BlockchainsInfo.isBlockchainName(assetType) ? assetType : null;
    }),
    distinctUntilChanged(),
    shareReplay(shareReplayConfig)
  );

  public readonly toBlockchain$: Observable<BlockchainName> = this.inputValue$.pipe(
    map(inputValue => inputValue.toBlockchain),
    distinctUntilChanged(),
    shareReplay(shareReplayConfig)
  );

  public readonly toToken$: Observable<TokenAmount> = this.inputValue$.pipe(
    map(inputValue => inputValue.toToken),
    distinctObjectUntilChanged(),
    shareReplay(shareReplayConfig)
  );

  /**
   * Output control, used to patch value.
   */
  public readonly outputControl = this.form.controls.output;

  public get outputValue(): SwapFormOutput {
    return this.form.get('output').value;
  }

  private readonly _outputValue$ = new BehaviorSubject<SwapFormOutput>(this.outputValue);

  public readonly outputValue$ = this._outputValue$.asObservable();

  private readonly _isFilled$: BehaviorSubject<boolean> = observableToBehaviorSubject(
    this.inputValue$.pipe(
      map(form =>
        Boolean(
          form.fromAssetType &&
            form.fromAsset &&
            form.toBlockchain &&
            form.toToken &&
            form.fromAmount?.gt(0)
        )
      )
    ),
    false
  );

  public readonly isFilled$ = this._isFilled$.asObservable();

  public get isFilled(): boolean {
    return this._isFilled$.getValue();
  }

  constructor(private readonly walletConnectorService: WalletConnectorService) {
    this.setupFromBlockchain();

    this.subscribeOnFormValueChange();
  }

  private setupFromBlockchain(): void {
    this.walletConnectorService.networkChange$.pipe(first(Boolean)).subscribe(network => {
      if (!this.inputValue.fromAssetType) {
        this.inputControl.patchValue({ fromAssetType: network });
      }
    });
  }

  private subscribeOnFormValueChange(): void {
    this.form.get('input').valueChanges.subscribe(inputValue => {
      this._inputValue$.next(inputValue);
    });

    this.form.get('output').valueChanges.subscribe(outputValue => {
      this._outputValue$.next(outputValue);
    });
  }
}
