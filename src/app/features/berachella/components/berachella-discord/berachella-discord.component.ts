import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';
import { BerachellaStateService } from '@features/berachella/services/berachella-state.service';
import { map, startWith } from 'rxjs/operators';
import { BerachellaActionService } from '@features/berachella/services/berachella-action.service';

@Component({
  selector: 'app-berachella-discord',
  templateUrl: './berachella-discord.component.html',
  styleUrls: ['./berachella-discord.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BerachellaDiscordComponent {
  public readonly discordLoading$ = this.stateService.discordLoading$;

  public readonly discordConnected$ = this.stateService.discordConnected$;

  public readonly loggedIn$ = this.stateService.currentUser$.pipe(
    map(user => Boolean(user?.address)),
    startWith(false)
  );

  constructor(
    @Inject(WINDOW) private window: RubicWindow,
    private readonly stateService: BerachellaStateService,
    private readonly actionService: BerachellaActionService
  ) {
    const code = this.getCode();
    if (code) {
      this.actionService.signWallet(code);
    }
  }

  public authDiscord(): void {
    let authUrl =
      'https://discord.com/oauth2/authorize?client_id=1389833731149135932&response_type=code&redirect_uri=https%3A%2F%2Fapp.rubic.exchange%2Fberachella&scope=guilds.join+identify';
    const origin = `${this.window.location.origin}/`;
    if (origin.includes('local')) {
      authUrl =
        'https://discord.com/oauth2/authorize?client_id=1389833731149135932&response_type=code&redirect_uri=https%3A%2F%2Flocal.rubic.exchange%3A4224%2Fberachella&scope=guilds.join+identify';
    }
    if (origin.includes('dev-app')) {
      authUrl =
        'https://discord.com/oauth2/authorize?client_id=1389833731149135932&response_type=code&redirect_uri=https%3A%2F%2Fdev-app.rubic.exchange%2Fberachella&scope=guilds.join+identify';
    }

    this.window.open(authUrl);
  }

  public openDiscord(): void {
    this.window.open('https://discord.gg/rubic-finance', '_blank');
  }

  private getCode(): string | null {
    const search = this.window.location.search; // убираем leading '#'
    const params = new URLSearchParams(search);
    const code = params.get('code');
    return code || null;
  }
}
