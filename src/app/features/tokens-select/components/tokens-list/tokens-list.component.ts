import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges,
  ChangeDetectorRef
} from '@angular/core';
import { AvailableTokenAmount } from 'src/app/shared/models/tokens/AvailableTokenAmount';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { QueryParamsService } from 'src/app/core/services/query-params/query-params.service';

@Component({
  selector: 'app-tokens-list',
  templateUrl: './tokens-list.component.html',
  styleUrls: ['./tokens-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensListComponent implements OnChanges {
  @Input() tokens: AvailableTokenAmount[] = [];

  @Input() prevSelectedToken: TokenAmount;

  @Output() tokenSelect = new EventEmitter<AvailableTokenAmount>();

  public hintsShown: boolean[];

  public get noFrameLink(): string {
    return `https://rubic.exchange${this.queryParamsService.noFrameLink}`;
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private readonly queryParamsService: QueryParamsService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
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
