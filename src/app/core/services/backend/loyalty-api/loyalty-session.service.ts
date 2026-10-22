import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ENVIRONMENT } from 'src/environments/environment';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { LoyaltyApiService } from './loyalty-api.service';
import { LoyaltySessionStorage } from './loyalty-session-storage';

@Injectable({ providedIn: 'root' })
export class LoyaltySessionService {
  private readonly loyaltyApiService = inject(LoyaltyApiService);
  private readonly sessionStorage = inject(LoyaltySessionStorage);
  private readonly walletConnector = inject(WalletConnectorService);

  public async ensureToken(address: string): Promise<string> {
    const stored = this.sessionStorage.get(address);
    if (stored) {
      return stored;
    }

    const { message } = await firstValueFrom(
      this.loyaltyApiService.createSessionMessage(
        address,
        ENVIRONMENT.local ? undefined : location.hostname
      )
    );
    const signature = await this.signPersonalMessage(message, address);
    const session = await firstValueFrom(
      this.loyaltyApiService.openSession({ userAddress: address, message, signature })
    );

    this.sessionStorage.set(address, session.token);
    return session.token;
  }

  private signPersonalMessage(message: string, address: string): Promise<string> {
    const hexMessage = `0x${Array.from(new TextEncoder().encode(message), byte =>
      byte.toString(16).padStart(2, '0')
    ).join('')}`;

    return this.walletConnector.provider.wallet.request({
      method: 'personal_sign',
      params: [hexMessage, address]
    });
  }
}
