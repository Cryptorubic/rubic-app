import { Component, ChangeDetectionStrategy, Injector, Inject } from '@angular/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { IframeSettingsComponent } from 'src/app/features/swaps/features/swap-form/components/swap-settings/iframe-settings/iframe-settings.component';
import { TuiDialogService } from '@taiga-ui/core';

@Component({
  selector: 'app-iframe-settings-button',
  templateUrl: './iframe-settings-button.component.html',
  styleUrls: ['./iframe-settings-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IframeSettingsButtonComponent {
  constructor(
    private readonly dialogService: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector
  ) {}

  public openSettings(): void {
    this.dialogService
      .open<void>(new PolymorpheusComponent(IframeSettingsComponent, this.injector), {
        size: 'fullscreen'
      })
      .subscribe();
  }
}
