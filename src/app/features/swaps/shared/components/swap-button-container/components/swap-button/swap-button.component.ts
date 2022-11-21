import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Self
} from '@angular/core';
import { SwapButtonService } from '@features/swaps/shared/components/swap-button-container/services/swap-button.service';
import { SwapButtonContainerService } from '@features/swaps/shared/components/swap-button-container/services/swap-button-container.service';
import { takeUntil } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { TradeService } from '@features/swaps/core/services/trade-service/trade.service';

@Component({
  selector: 'app-swap-button',
  templateUrl: './swap-button.component.html',
  styleUrls: ['./swap-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class SwapButtonComponent implements OnInit {
  @Input() buttonText: string;

  @Output() readonly onClick = new EventEmitter<void>();

  public readonly idPrefix = this.swapButtonContainerService.idPrefix;

  public readonly loading$ = this.swapButtonService.loading$;

  public readonly disabled$ = this.swapButtonService.disabled$;

  constructor(
    private readonly swapButtonContainerService: SwapButtonContainerService,
    private readonly swapButtonService: SwapButtonService,
    private readonly cdr: ChangeDetectorRef,
    private readonly tradeService: TradeService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit(): void {
    // @TODO get rid of manual change detection
    this.disabled$.pipe(takeUntil(this.destroy$)).subscribe(() => this.cdr.detectChanges());
  }

  public onSwapClick(): void {
    this.onClick.emit();
  }

  public onHoveredChange(isHovered: boolean): void {
    this.tradeService.isButtonHovered = isHovered;
  }
}
