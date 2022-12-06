import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnInit,
  Self
} from '@angular/core';
import { Token } from '@shared/models/tokens/token';
import { TokensSelectorModalService } from '@features/swaps/shared/components/tokens-selector/services/tokens-selector-modal.service';
import { takeUntil } from 'rxjs/operators';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { TokensService } from '@core/services/tokens/tokens.service';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { DEFAULT_TOKEN_IMAGE } from '@shared/constants/tokens/default-token-image';
import { DOCUMENT } from '@angular/common';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';
import BigNumber from 'bignumber.js';
import { FormType } from '@features/swaps/shared/models/form/form-type';
import { SwapFormInput } from '@app/features/swaps/core/services/swap-form-service/models/swap-form-controls';

@Component({
  selector: 'app-select-asset-button-tokens',
  templateUrl: './select-asset-button.component.html',
  styleUrls: ['./select-asset-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class SelectAssetButtonComponent implements OnInit {
  @Input() loading: boolean;

  @Input() formType: FormType;

  @Input() disabled = false;

  @Input() idPrefix: string = '';

  public readonly DEFAULT_TOKEN_IMAGE = DEFAULT_TOKEN_IMAGE;

  public selectedToken: Token;

  public buttonHovered: boolean = null;

  public iframeForceDisabled = false;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly tokensSelectorModalService: TokensSelectorModalService,
    private readonly queryParamsService: QueryParamsService,
    private readonly tokensService: TokensService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly swapFormService: SwapFormService,
    @Self() private readonly destroy$: TuiDestroyService,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  public ngOnInit(): void {
    this.setFormValues(this.swapFormService.inputValue);
    this.swapFormService.inputValue$.pipe(takeUntil(this.destroy$)).subscribe(formValue => {
      this.setFormValues(formValue);
    });

    this.queryParamsService.tokensSelectionDisabled$
      .pipe(takeUntil(this.destroy$))
      .subscribe(([hideSelectionFrom, hideSelectionTo]) => {
        if (this.formType === 'from') {
          this.iframeForceDisabled = hideSelectionFrom;
        } else {
          this.iframeForceDisabled = hideSelectionTo;
        }
        this.cdr.markForCheck();
      });
  }

  private setFormValues(formValue: SwapFormInput): void {
    const formKey = this.formType === 'from' ? 'fromToken' : 'toToken';
    this.selectedToken = formValue[formKey];
    this.cdr.detectChanges();
  }

  public openTokensSelect(idPrefix: string): void {
    const { fromToken } = this.swapFormService.inputValue;

    this.gtmService.reloadGtmSession();

    this.tokensSelectorModalService
      .showDialog(this.formType, this.swapFormService.inputControl, idPrefix)
      .subscribe((selectedToken: TokenAmount) => {
        if (selectedToken) {
          const token = {
            ...selectedToken,
            amount: selectedToken?.amount?.isFinite()
              ? selectedToken.amount
              : fromToken?.amount || new BigNumber(NaN)
          };
          this.selectedToken = token;
          const inputElement = this.document.getElementById('token-amount-input-element');
          const isToAmountEmpty = !this.swapFormService?.inputValue?.fromAmount?.isFinite();

          if (inputElement && isToAmountEmpty) {
            setTimeout(() => {
              inputElement.focus();
            }, 0);
          }

          if (this.formType === 'from') {
            this.swapFormService.inputControl.patchValue({
              fromBlockchain: token.blockchain,
              fromToken: token
            });
          } else {
            this.swapFormService.inputControl.patchValue({
              toToken: token,
              toBlockchain: token.blockchain
            });
          }
        }
      });
  }

  public onImageError($event: Event): void {
    this.tokensService.onTokenImageError($event);
  }
}
