import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef
} from '@angular/core';
import { AvailableTokenAmount } from 'src/app/shared/models/tokens/AvailableTokenAmount';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { QueryParamsService } from 'src/app/core/services/query-params/query-params.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-tokens-list',
  templateUrl: './tokens-list.component.html',
  styleUrls: ['./tokens-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensListComponent implements OnChanges, AfterViewInit {
  @Input() tokens: AvailableTokenAmount[] = [];

  @Input() prevSelectedToken: TokenAmount;

  @Output() tokenSelect = new EventEmitter<AvailableTokenAmount>();

  @Output() pageUpdate = new EventEmitter<number>();

  @ViewChild(CdkVirtualScrollViewport) virtualScroll: CdkVirtualScrollViewport;

  public hintsShown: boolean[];

  public get noFrameLink(): string {
    return `https://rubic.exchange${this.queryParamsService.noFrameLink}`;
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private readonly queryParamsService: QueryParamsService
  ) {}

  public ngAfterViewInit(): void {
    this.virtualScroll.renderedRangeStream
      // .pipe(
      //   debounceTime(500),
      //   filter(el => {
      //     const endOfList = el.end > this.tokens.length - 50;
      //     const shouldFetch = this.tokensNetworkState
      //       ? this.tokensNetworkState.page <= Math.ceil(this.tokensNetworkState.count / 150)
      //       : true;
      //     return endOfList && shouldFetch;
      //   })
      // )
      .subscribe(() => {
        // this.pageUpdate.emit(this.tokensNetworkState.page + 1);
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

  onTokenSelect(token: AvailableTokenAmount) {
    if (token.available) {
      this.tokenSelect.emit(token);
    }
  }
}
