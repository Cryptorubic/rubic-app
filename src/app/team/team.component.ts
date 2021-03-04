import { Component } from '@angular/core';
import { ICardContent } from './team-card/team-card.component';
// @ts-ignore
import team from '../../assets/content/team/team.json';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent {
  cards: Array<ICardContent> = team;

  constructor() {}
}
