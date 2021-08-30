import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { AvailableTokenAmount } from 'src/app/shared/models/tokens/AvailableTokenAmount';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { debounceTime, filter } from 'rxjs/operators';

@Component({
  selector: 'app-tokens-list',
  templateUrl: './tokens-list.component.html',
  styleUrls: ['./tokens-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensListComponent implements OnChanges, AfterViewInit {
  @Input() tokens: AvailableTokenAmount[] = [];

  @Input() tokensNetworkState: { count: number; page: number };

  @Input() lastPage: number;

  @Output() tokenSelect = new EventEmitter<AvailableTokenAmount>();

  @Output() pageUpdate = new EventEmitter<number>();

  @ViewChild(CdkVirtualScrollViewport) virtualScroll: CdkVirtualScrollViewport;

  public hintsShown: boolean[];

  constructor() {}

  public ngAfterViewInit(): void {
    this.virtualScroll.renderedRangeStream
      .pipe(
        debounceTime(500),
        filter(el => {
          const endOfList = el.end > this.tokens.length - 50;
          const shouldFetch = this.tokensNetworkState
            ? this.tokensNetworkState.page <= Math.ceil(this.tokensNetworkState.count / 150)
            : true;
          return endOfList && shouldFetch;
        })
      )
      .subscribe(() => {
        this.pageUpdate.emit(this.tokensNetworkState.page + 1);
      });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (
      JSON.stringify(changes.tokens.currentValue) !== JSON.stringify(changes.tokens.previousValue)
    ) {
      const tokensNumber = changes.tokens.currentValue.length;
      this.hintsShown = Array(tokensNumber).fill(false);
    }
  }

  public onTokenSelect(token: AvailableTokenAmount): void {
    if (token.available) {
      this.tokenSelect.emit(token);
    }
  }
}
