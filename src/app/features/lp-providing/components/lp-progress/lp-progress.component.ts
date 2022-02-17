import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { LpProvidingService } from '../../services/lp-providing.service';

@Component({
  selector: 'app-lp-progress',
  templateUrl: './lp-progress.component.html',
  styleUrls: ['./lp-progress.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LpProgressComponent implements OnInit {
  public readonly poolSize = this.service.poolSize;

  public readonly maxEnterAmount = this.service.maxEnterAmount;

  public readonly totalStaked$ = this.service.totalStaked$;

  public readonly usersTotalStaked$ = this.service.userTotalStaked$;

  public readonly needLogin$ = this.service.needLogin$;

  public readonly progressLoading$ = this.service.progressLoading$;

  constructor(private readonly service: LpProvidingService) {}

  public ngOnInit(): void {
    this.service.getLpProvidingProgress().subscribe(() => this.progressLoading$.next(false));
  }
}
