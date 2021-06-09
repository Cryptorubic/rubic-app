import { Component } from '@angular/core';
import { ContentLoaderService } from '../../../../core/services/content-loader/content-loader.service';
import { TeamCardContent } from '../../../../shared/models/content';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent {
  public cards: TeamCardContent[];

  constructor(contentLoaderService: ContentLoaderService) {
    this.cards = contentLoaderService.teamCardsContent;
  }
}
