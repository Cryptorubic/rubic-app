import { AsyncPipe } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  ViewChild,
  ChangeDetectorRef
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { List } from 'immutable';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { TokensService } from 'src/app/core/services/backend/tokens-service/tokens.service';
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

  public tokensHostWidth: string;

  @ViewChild('filterForm')
  public set tokensHeader(value: ElementRef) {
    if (value) {
      setTimeout(() => {
        const { width } = getComputedStyle(value.nativeElement);
        this.tokensHostWidth = width;
      });
    }
  }

  constructor(
    private readonly tokensService: TokensService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.options = this.tokensService.tokens.asObservable();
    this.tokensHostWidth = '150px';
    this.$filteredFromOptions = this.tokensFromInput.valueChanges.pipe(
      startWith(''),
      map(value => this.filter(value))
    );
    this.$filteredToOptions = this.tokensToInput.valueChanges.pipe(
      startWith(''),
      map(value => this.filter(value))
    );
  }

  private filter(value: string): SwapToken[] {
    if (value.length < 2) {
      return [];
    }
    const filterValue = value.toLowerCase();
    const options = new AsyncPipe(this.cdr).transform(this.options);

    return options
      .filter((option: SwapToken) => {
        const tokenTitle = (option as any).token_title.toLowerCase();
        const tokenSymbol = (option as any).token_short_title.toLowerCase();
        const nameIndexMatch = tokenTitle.indexOf(filterValue) + 1;
        const symbolIndexMatch = tokenSymbol.indexOf(filterValue) + 1;

        return nameIndexMatch || symbolIndexMatch;
      })
      .toArray();
  }

  public switchTokens(): void {
    const toValue = this.tokensToInput.value;
    this.tokensToInput.setValue(this.tokensFromInput.value);
    this.tokensFromInput.setValue(toValue);
  }
}
