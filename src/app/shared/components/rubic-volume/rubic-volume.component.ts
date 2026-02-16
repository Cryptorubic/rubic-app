import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VolumeApiService } from 'src/app/core/services/backend/volume-api/volume-api.service';
import { ThemeService } from '@core/services/theme/theme.service';

@Component({
  selector: 'app-rubic-volume',
  templateUrl: './rubic-volume.component.html',
  styleUrls: ['./rubic-volume.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicVolumeComponent {
  public readonly volume$ = this.volumeApiService.tradingVolume$;

  public readonly theme$ = this.themeService.theme$;

  public readonly icon = {
    dark: 'assets/images/total-values/accumulated-icon.svg',
    light: 'assets/images/total-values/accumulated-icon_light.svg',
    private: 'assets/images/total-values/accumulated-icon.svg'
  };

  constructor(
    private readonly volumeApiService: VolumeApiService,
    private readonly themeService: ThemeService
  ) {}
}
