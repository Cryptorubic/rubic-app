import { Component } from '@angular/core';
import { ContentLoaderService } from 'src/app/core/services/content-loader/content-loader.service';
import { CollaborationsContent } from '../../models/content';

@Component({
  selector: 'app-collaborations',
  templateUrl: './collaborations.component.html',
  styleUrls: ['./collaborations.component.scss']
})
export class CollaborationsComponent {
  public collaborations: CollaborationsContent[];

  constructor(contentLoaderService: ContentLoaderService) {
    this.collaborations = contentLoaderService.collaborationsContent;
  }
}
