import {
  Component,
  ChangeDetectionStrategy,
  TemplateRef,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3-private-service/web3-private.service';
import { MessageBoxComponent } from 'src/app/shared/components/message-box/message-box.component';
import { NetworkError } from 'src/app/shared/models/errors/provider/NetworkError';
import { RubicError } from 'src/app/shared/models/errors/RubicError';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';

@Component({
  selector: 'app-advert-modal',
  templateUrl: './advert-modal.component.html',
  styleUrls: ['./advert-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdvertModalComponent implements AfterViewInit {
  @ViewChild('modal') modal: TemplateRef<any>;

  private matModal: MatDialogRef<any>;

  private readonly token: SwapToken;

  private readonly cookieName: string = 'bridge_modal_shown';

  constructor(
    private dialog: MatDialog,
    private readonly cookieService: CookieService,
    private readonly web3Private: Web3PrivateService,
    private readonly translateServuce: TranslateService
  ) {
    this.token = {
      address: '0x8E3BCC334657560253B83f08331d85267316e08a',
      symbol: 'BRBC',
      decimals: 18,
      image: `${window.location.origin}/assets/images/icons/coins/brbc.svg`,
      blockchain: undefined,
      price: undefined,
      name: undefined,
      rank: undefined
    };
  }

  public ngAfterViewInit(): void {
    const isModalShown = Boolean(this.cookieService.get(this.cookieName));
    if (!isModalShown) {
      this.open();
    }
  }

  public async addToken(): Promise<void> {
    try {
      await this.web3Private.addToken(this.token);
      this.close();
    } catch (err) {
      console.error(err);
      this.showErrorModal(err);
      this.close(true);
    }
  }

  private showErrorModal(err: Error): void {
    const eror = err instanceof RubicError ? err : new RubicError(this.translateServuce);
    const data = { title: 'Warning', descriptionText: eror.comment } as any;
    if (err instanceof NetworkError) {
      data.title = 'Error';
      data.descriptionText = `You have selected the wrong network. To add BRSC please choose ${err.networkToChoose} from MetaMask, and reload page.`;
    }
    this.dialog.open(MessageBoxComponent, { width: '400px', data });
  }

  public open(): void {
    this.matModal = this.dialog.open(this.modal);
    this.matModal.afterClosed().subscribe((doNotSaveCookie: boolean) => {
      if (!doNotSaveCookie) {
        this.cookieService.set(this.cookieName, '1', null, null, null, null, null);
      }
    });
  }

  public close(doNotSaveCookie?: boolean): void {
    this.matModal.close(doNotSaveCookie);
  }
}
