import { HttpService } from '@app/core/services/http/http.service';
import { firstValueFrom } from 'rxjs';

interface SignMessage {
  message: {
    value: string;
  };
}
export class RetroBridgeApiService {
  private static readonly RETRO_BRIDGE_API_ENDPOINT = 'https://backend.retrobridge.io/api';

  private static API_KEY = 'rubic';

  public static async getMessageToAuthWallet(httpService: HttpService): Promise<string> {
    const { data } = await firstValueFrom(
      httpService.get<{ data: SignMessage }>(
        `${this.RETRO_BRIDGE_API_ENDPOINT}/wallet_auth/message`
      )
    );
    return data.message.value;
  }

  public static async sendSignedMessage(
    walletAddress: string,
    signature: string,
    networkType: string,
    httpService: HttpService
  ): Promise<never | void> {
    try {
      await firstValueFrom(
        httpService.post(
          `${this.RETRO_BRIDGE_API_ENDPOINT}/wallet_auth/message`,
          {
            wallet_address: walletAddress,
            network_type: networkType,
            signature
          },
          '',
          { withCredentials: true }
        )
      );
    } catch (err) {
      console.error(err);
    }
  }

  public static async checkWallet(
    walletAddress: string,
    networkType: string,
    httpService: HttpService
  ): Promise<string> {
    const { message } = await firstValueFrom(
      httpService.get<{ message: string }>(
        `${this.RETRO_BRIDGE_API_ENDPOINT}/wallet_auth/wallet/${walletAddress}`,
        {
          headers: {
            'network-type': networkType
          },
          withCredentials: true
        }
      )
    );
    return message;
  }
}
