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

@Component({
  selector: 'app-tokens-list',
  templateUrl: './tokens-list.component.html',
  styleUrls: ['./tokens-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensListComponent implements OnChanges {
  @Input() tokens: AvailableTokenAmount[] = [];

  @Output() tokenSelect = new EventEmitter<AvailableTokenAmount>();

  public hintsShown: boolean[];

  constructor(private cdr: ChangeDetectorRef) {}

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
