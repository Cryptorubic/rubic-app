import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared.module';
import { TeamPageRoutingModule } from './team-page-routing.module';
import { TeamComponent } from './components/team/team.component';
import { TeamCardComponent } from './components/team-card/team-card.component';

@NgModule({
  declarations: [TeamComponent, TeamCardComponent],
  imports: [CommonModule, TeamPageRoutingModule, SharedModule]
})
export class TeamPageModule {}
