import { Component, OnInit } from '@angular/core';

export interface IPerson {
  name: string;
  position: string;
  avatarPath: string;
  linkedInUrl?: string;
  gitHubUrl?: string;
}

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit {
  public people: Array<IPerson>;

  constructor() {}

  public ngOnInit(): void {
    this.people = [{
      name: 'Vladimir Tikhomirov',
      position: 'CEO',
      avatarPath: 'https://pbs.twimg.com/profile_images/685347483430486016/tr4jiGUK_400x400.jpg',
      linkedInUrl: 'https://ru.linkedin.com/'
    }];
  }

}
