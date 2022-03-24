import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { VolumeApiService } from 'src/app/core/services/backend/volume-api/volume-api.service';
import { TradeVolume } from '@core/services/backend/volume-api/models/trade-volume';
import { Observable } from 'rxjs';
import { ContentLoaderService } from '@core/services/content-loader/content-loader.service';
import { ThemeService } from '@core/services/theme/theme.service';

@Component({
  selector: 'app-rubic-volume',
  templateUrl: './rubic-volume.component.html',
  styleUrls: ['./rubic-volume.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicVolumeComponent {
  public volume$: Observable<TradeVolume>;

  public theme: string;

  public icon = {
    dark: 'assets/images/total-values/accumulated-icon.svg',
    light: 'assets/images/total-values/accumulated-icon_light.svg'
  };

  constructor(
    private readonly contentLoaderService: ContentLoaderService,
    private readonly volumeApiService: VolumeApiService,
    private readonly themeService: ThemeService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.volume$ = this.volumeApiService.tradingVolume$;
    this.themeService.theme$.subscribe(value => {
      this.theme = value;
      this.cdr.markForCheck();
    });
  }
}
