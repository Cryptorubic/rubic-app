import { Component, Inject, Input } from '@angular/core';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';

interface ICardLink {
  icon: string;
  url: string;
}

export interface ICardContent {
  img: string;
  name: string;
  role: string;
  links: Array<ICardLink>;
}

@Component({
  selector: 'app-team-card',
  templateUrl: './team-card.component.html',
  styleUrls: ['./team-card.component.scss']
})
export class TeamCardComponent {
  @Input() content: ICardContent;

  constructor(@Inject(WINDOW) private readonly window: RubicWindow) {}

  onClick(): void {
    this.window.open(this.content.links[0].url, '_blank');
  }
}
