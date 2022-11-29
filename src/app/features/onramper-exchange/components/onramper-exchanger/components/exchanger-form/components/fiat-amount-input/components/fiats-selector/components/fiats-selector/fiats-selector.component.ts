import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  Self,
  ViewChild
} from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, skip, takeUntil } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { TokensListComponent } from '@features/swaps/shared/components/tokens-select/components/tokens-list/tokens-list.component';
import { DOCUMENT } from '@angular/common';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { FiatItem } from '@features/onramper-exchange/components/onramper-exchanger/components/exchanger-form/components/fiat-amount-input/components/fiats-selector/models/fiat-item';
import { fiats } from '@features/onramper-exchange/components/onramper-exchanger/components/exchanger-form/components/fiat-amount-input/components/fiats-selector/constants/fiats';

type ComponentContext = TuiDialogContext<FiatItem, {}>;

@Component({
  selector: 'polymorpheus-fiats-select',
  templateUrl: './fiats-selector.component.html',
  styleUrls: ['./fiats-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class FiatsSelectorComponent implements OnInit, OnDestroy {
  @ViewChild(TokensListComponent) private tokensList: TokensListComponent;

  public fiatsToShow: FiatItem[] = fiats;

  private readonly searchQuery$: BehaviorSubject<string> = new BehaviorSubject('');

  get searchQuery(): string {
    return this.searchQuery$.value;
  }

  set searchQuery(value: string) {
    this.searchQuery$.next(value);
  }

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: ComponentContext,
    private readonly cdr: ChangeDetectorRef,
    @Self() private readonly destroy$: TuiDestroyService,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  ngOnInit(): void {
    this.setWindowHeight();
    this.initSubscriptions();
  }

  ngOnDestroy(): void {
    this.resetWindowHeight();
  }

  /**
   * Sets window height through html class name, to prevent broken scroll in Safari.
   */
  private setWindowHeight(): void {
    this.document.documentElement.style.setProperty(
      '--window-inner-height',
      `${window.innerHeight}px`
    );
    this.document.documentElement.classList.add('is-locked');
  }

  private resetWindowHeight(): void {
    this.document.documentElement.classList.remove('is-locked');
  }

  /**
   * Inits subscriptions for searchQuery.
   */
  private initSubscriptions(): void {
    this.searchQuery$.pipe(skip(1), debounceTime(100), takeUntil(this.destroy$)).subscribe(() => {
      this.updateFiatsList();
    });
  }

  /**
   * Handles fiat selection event.
   * @param fiat Selected fiat.
   */
  public selectFiat(fiat: FiatItem): void {
    this.context.completeWith(fiat);
  }

  /**
   * Updates default and favourite tokens lists.
   */
  private updateFiatsList(): void {
    if (this.searchQuery.length) {
      this.fiatsToShow = fiats.filter(fiat =>
        fiat.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.fiatsToShow = fiats;
    }
    this.cdr.detectChanges();
  }
}
