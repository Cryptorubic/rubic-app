import { Component, ChangeDetectionStrategy, Injector, Inject } from '@angular/core';
import { ModalService } from '@app/core/modals/services/modal.service';

@Component({
  selector: 'app-iframe-settings-button',
  templateUrl: './iframe-settings-button.component.html',
  styleUrls: ['./iframe-settings-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IframeSettingsButtonComponent {
  constructor(
    private readonly dialogService: ModalService,
    @Inject(Injector) private readonly injector: Injector
  ) {}

  public openSettings(): void {
    // this.dialogService
    //   .showDialog<IframeSettingsComponent, void>(
    //     IframeSettingsComponent,
    //     {
    //       size: 'fullscreen',
    //       fitContent: true,
    //       title: 'Settings'
    //     },
    //     this.injector
    //   )
    //   .subscribe();
  }
}
