import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContentLoaderService } from '../../../core/services/content-loader/content-loader.service';
import { VolumeContent } from '../../models/content';

@Component({
  selector: 'app-volume-block',
  templateUrl: './volume-block.component.html',
  styleUrls: ['./volume-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VolumeBlockComponent {
  public volume: VolumeContent;

  constructor(contentLoaderService: ContentLoaderService) {
    this.volume = contentLoaderService.volumeContent;
  }
}
