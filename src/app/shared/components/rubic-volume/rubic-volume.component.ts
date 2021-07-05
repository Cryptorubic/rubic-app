import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VolumeContent } from '../../models/content';
import { ContentLoaderService } from '../../../core/services/content-loader/content-loader.service';

@Component({
  selector: 'app-rubic-volume',
  templateUrl: './rubic-volume.component.html',
  styleUrls: ['./rubic-volume.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicVolumeComponent {
  public volume: VolumeContent;

  constructor(contentLoaderService: ContentLoaderService) {
    this.volume = contentLoaderService.volumeContent;
  }
}
