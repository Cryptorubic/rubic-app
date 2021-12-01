import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VolumeApiService } from 'src/app/core/services/backend/volume-api/volume-api.service';
import { TradeVolume } from 'src/app/core/services/backend/volume-api/models/TradeVolume';
import { Observable } from 'rxjs';
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
    private readonly contentLoaderService: ContentLoaderService,
    private readonly volumeApiService: VolumeApiService
  ) {
    this.volume$ = this.volumeApiService.tradingVolume$;
  }
}
