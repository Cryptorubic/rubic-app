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
  public team: Array<IPerson>;
  public advisers: Array<IPerson>;

  constructor() {}

  public ngOnInit(): void {
    this.team = [
      {
        name: 'Vladimir Tikhomirov',
        position: 'CEO',
        avatarPath: 'https://pbs.twimg.com/profile_images/685347483430486016/tr4jiGUK_400x400.jpg',
        linkedInUrl: 'https://ru.linkedin.com/'
      },
      {
        name: 'Veronika Trunina',
        position: 'Business Development',
        avatarPath: 'https://pbs.twimg.com/profile_images/685347483430486016/tr4jiGUK_400x400.jpg',
        linkedInUrl: 'https://ru.linkedin.com/'
      },
      {
        name: 'Nina Lukina',
        position: 'Backend Developer',
        avatarPath: 'https://pbs.twimg.com/profile_images/685347483430486016/tr4jiGUK_400x400.jpg',
        linkedInUrl: 'https://ru.linkedin.com/',
        gitHubUrl: 'https://github.com/'
      },
      {
        name: 'Alexandra Korneva',
        position: 'PR and Marketing',
        avatarPath: 'https://pbs.twimg.com/profile_images/685347483430486016/tr4jiGUK_400x400.jpg',
        linkedInUrl: 'https://ru.linkedin.com/'
      },
      {
        name: 'Max Strenk',
        position: 'Backend Developer',
        avatarPath: 'https://pbs.twimg.com/profile_images/685347483430486016/tr4jiGUK_400x400.jpg',
        linkedInUrl: 'https://ru.linkedin.com/',
        gitHubUrl: 'https://github.com/'
      },
      {
        name: 'Alexander Boyarshenchok',
        position: 'Designer',
        avatarPath: 'https://pbs.twimg.com/profile_images/685347483430486016/tr4jiGUK_400x400.jpg'
      },
      {
        name: 'Olga Kulakova',
        position: 'SMM',
        avatarPath: 'https://pbs.twimg.com/profile_images/685347483430486016/tr4jiGUK_400x400.jpg',
        linkedInUrl: 'https://ru.linkedin.com/'
      }
    ];

    this.advisers = [
      {
        name: 'Pavel Shterlyaev',
        position: 'Adviser / Partner - Founder BestRate.org',
        avatarPath: 'https://pbs.twimg.com/profile_images/685347483430486016/tr4jiGUK_400x400.jpg',
        linkedInUrl: 'https://ru.linkedin.com/'
      },
      {
        name: 'Hugo Hellebuyck',
        position: 'Adviser / Partner at Tangem',
        avatarPath: 'https://pbs.twimg.com/profile_images/685347483430486016/tr4jiGUK_400x400.jpg',
        linkedInUrl: 'https://ru.linkedin.com/'
      },
      {
        name: 'Eric Benz',
        position: 'CEO of Changelly',
        avatarPath: 'https://pbs.twimg.com/profile_images/685347483430486016/tr4jiGUK_400x400.jpg',
        linkedInUrl: 'https://ru.linkedin.com/'
      },
      {
        name: 'Dmitry Machikhin',
        position: 'Adviser / Head GMTLegal',
        avatarPath: 'https://pbs.twimg.com/profile_images/685347483430486016/tr4jiGUK_400x400.jpg',
        linkedInUrl: 'https://ru.linkedin.com/'
      }
    ];
  }

}
