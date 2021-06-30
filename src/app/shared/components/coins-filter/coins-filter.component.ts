import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { List } from 'immutable';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { TokenPart, TokenValueType } from 'src/app/shared/models/order-book/tokens';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';

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

  public virtualScrollFromTokensHeight: string;

  public virtualScrollToTokensHeight: string;

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
    this.virtualScrollFromTokensHeight = '240px';
    this.virtualScrollToTokensHeight = '240px';
    this.selectTokenEvent = new EventEmitter<TokenValueType>();
    // @ts-ignore TODO
    this.options = this.tokensService.tokens.asObservable();
    this.tokensHostWidth = '150px';
    this.$filteredFromOptions = this.tokensFromInput.valueChanges.pipe(
      startWith(''),
      map(value => this.filter(value, 'from'))
    );
    this.$filteredToOptions = this.tokensToInput.valueChanges.pipe(
      startWith(''),
      map(value => this.filter(value, 'to'))
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
        const tokenTitle = ((option as any).token_title || option.name).toLowerCase();
        const tokenSymbol = ((option as any).token_short_title || option.symbol).toLowerCase();
        const nameIndexMatch = tokenTitle.indexOf(filterValue) + 1;
        const symbolIndexMatch = tokenSymbol.indexOf(filterValue) + 1;

        return nameIndexMatch || symbolIndexMatch;
      })
      .toArray();

    if (filterOptions.length <= 5) {
      if (tokenType === 'from') {
        this.virtualScrollFromTokensHeight = `${filterOptions.length * 48}px`;
      } else {
        this.virtualScrollToTokensHeight = `${filterOptions.length * 48}px`;
      }
    } else if (tokenType === 'from') {
      this.virtualScrollFromTokensHeight = '240px';
    } else {
      this.virtualScrollToTokensHeight = '240px';
    }

    return filterOptions;
  }

  public selectToken(value: any, tokenType: TokenPart): void {
    this.isTokenSelected = true;
    this.selectTokenEvent.emit({ value: value.option.value, tokenType });
  }

  public switchTokens(): void {
    const oldFromValue = this.tokensFromInput.value;
    const oldToValue = this.tokensToInput.value;
    this.tokensToInput.setValue(oldFromValue);
    this.tokensFromInput.setValue(oldToValue);
    this.selectTokenEvent.emit({ value: oldFromValue, tokenType: 'to' });
    this.selectTokenEvent.emit({ value: oldToValue, tokenType: 'from' });
  }
}
