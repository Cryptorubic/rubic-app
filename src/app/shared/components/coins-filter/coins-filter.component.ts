import { AsyncPipe } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  EventEmitter,
  Output
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { List } from 'immutable';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { TokensService } from 'src/app/core/services/backend/tokens-service/tokens.service';
import { TokenPart, TokenValueType } from 'src/app/shared/models/order-book/tokens';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';

@Component({
  selector: 'app-coins-filter',
  templateUrl: './coins-filter.component.html',
  styleUrls: ['./coins-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoinsFilterComponent {
  public tokensFromInput = new FormControl();

  public tokensToInput = new FormControl();

  public readonly options: Observable<List<SwapToken>>;

  public readonly $filteredFromOptions: Observable<SwapToken[]>;

  public readonly $filteredToOptions: Observable<SwapToken[]>;

  @Output() public readonly selectTokenEvent: EventEmitter<TokenValueType>;

  public tokensHostWidth: string;

  private isTokenSelected: boolean;

  public virtualScrollBaseHeight: string;

  public virtualScrollQuoteHeight: string;

  @ViewChild('filterForm')
  public set tokensHeader(value: ElementRef) {
    if (value) {
      const { width } = getComputedStyle(value.nativeElement);
      this.tokensHostWidth = width;
      this.cdr.detectChanges();
    }
  }

  constructor(
    private readonly tokensService: TokensService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.virtualScrollBaseHeight = '240px';
    this.virtualScrollQuoteHeight = '240px';
    this.selectTokenEvent = new EventEmitter<TokenValueType>();
    this.options = this.tokensService.tokens.asObservable();
    this.tokensHostWidth = '150px';
    this.$filteredFromOptions = this.tokensFromInput.valueChanges.pipe(
      startWith(''),
      map(value => this.filter(value, 'base'))
    );
    this.$filteredToOptions = this.tokensToInput.valueChanges.pipe(
      startWith(''),
      map(value => this.filter(value, 'quote'))
    );
  }

  private filter(value: string, tokenType: TokenPart): SwapToken[] {
    if (this.isTokenSelected) {
      this.selectTokenEvent.emit({ value: null, tokenType });
    }
    this.isTokenSelected = true;
    if (!value || value.length < 2) {
      return [];
    }
    const filterValue = value.toLowerCase();
    const options = new AsyncPipe(this.cdr).transform(this.options);

    const filterOptions = options
      .filter((option: SwapToken) => {
        const tokenTitle = (option as any).token_title.toLowerCase();
        const tokenSymbol = (option as any).token_short_title.toLowerCase();
        const nameIndexMatch = tokenTitle.indexOf(filterValue) + 1;
        const symbolIndexMatch = tokenSymbol.indexOf(filterValue) + 1;

        return nameIndexMatch || symbolIndexMatch;
      })
      .toArray();

    if (filterOptions.length <= 5) {
      if (tokenType === 'base') {
        this.virtualScrollBaseHeight = `${filterOptions.length * 48}px`;
      } else {
        this.virtualScrollQuoteHeight = `${filterOptions.length * 48}px`;
      }
    } else if (tokenType === 'base') {
      this.virtualScrollBaseHeight = '240px';
    } else {
      this.virtualScrollQuoteHeight = '240px';
    }

    return filterOptions;
  }

  public selectToken(value: any, tokenType: TokenPart): void {
    this.isTokenSelected = true;
    this.selectTokenEvent.emit({ value: value.option.value, tokenType });
  }

  public switchTokens(): void {
    const oldBaseValue = this.tokensFromInput.value;
    const oldQuoteValue = this.tokensToInput.value;
    this.tokensToInput.setValue(oldBaseValue);
    this.tokensFromInput.setValue(oldQuoteValue);
    this.selectTokenEvent.emit({ value: oldBaseValue, tokenType: 'quote' });
    this.selectTokenEvent.emit({ value: oldQuoteValue, tokenType: 'base' });
  }
}
