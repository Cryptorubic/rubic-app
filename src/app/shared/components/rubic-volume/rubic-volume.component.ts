import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { VolumeApiService } from 'src/app/core/services/backend/volume-api/volume-api.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { TradeVolume } from 'src/app/core/services/backend/volume-api/models/TradeVolume';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ContentLoaderService } from '../../../core/services/content-loader/content-loader.service';

@Component({
  selector: 'app-rubic-volume',
  templateUrl: './rubic-volume.component.html',
  styleUrls: ['./rubic-volume.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicVolumeComponent {
  public volume$: Observable<TradeVolume>;

  constructor(
    private contentLoaderService: ContentLoaderService,
    private volumeApiService: VolumeApiService,
    private destroy$: TuiDestroyService,
    private cdr: ChangeDetectorRef
  ) {
    this.volume$ = this.volumeApiService.tradingVolume$.pipe(takeUntil(this.destroy$));
  }
}
