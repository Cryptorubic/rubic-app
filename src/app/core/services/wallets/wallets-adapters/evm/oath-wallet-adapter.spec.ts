import { BehaviorSubject } from 'rxjs';
import { EventEmitter } from 'events';
import { NgZone } from '@angular/core';
import { BlockchainName } from '@cryptorubic/core';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { ErrorsService } from '@core/errors/errors.service';
import { RubicWindow } from '@shared/utils/rubic-window';
import { OathWalletAdapter } from './oath-wallet-adapter';
import { OathConnectionService } from '../../oath-connection.service';

const address = `0x${'1'.repeat(40)}`;
const pairing = `wc:${'a'.repeat(64)}@2?relay-protocol=irn&symKey=${'b'.repeat(64)}`;
type Provider = Awaited<ReturnType<typeof EthereumProvider.init>>;

class FakeProvider extends EventEmitter {
  public session: object | undefined;
  public chainId = 1;
  public enableCount = 0;
  public expired = 0;
  public deletedPairings = 0;
  public proposals: { id: number }[] = [];
  public pairings: { topic: string }[] = [];
  private rejectApproval: (reason: Error) => void;
  private acceptApproval: (accounts: string[]) => void;
  public request = jasmine.createSpy('request').and.resolveTo(null);
  public signer = {
    client: {
      proposal: { getAll: () => this.proposals },
      pairing: { getAll: () => this.pairings },
      core: {
        expirer: {
          set: (_id: number, _expiry: number) => {
            this.expired++;
            this.proposals = [];
            this.rejectApproval?.(new Error('Proposal expired'));
          }
        }
      },
      disconnect: async (_params: object): Promise<void> => {
        this.deletedPairings++;
        this.pairings = [];
      }
    }
  };

  public enable(): Promise<string[]> {
    this.enableCount++;
    if (this.session) return Promise.resolve([address]);
    return new Promise((resolve, reject) => {
      this.acceptApproval = resolve;
      this.rejectApproval = reject;
    });
  }

  public publish(): void {
    this.proposals = [{ id: this.enableCount }];
    this.pairings = [{ topic: 'test-pairing' }];
    this.emit('display_uri', pairing);
  }

  public approve(): void {
    this.proposals = [];
    this.session = {};
    this.acceptApproval([address]);
  }

  public async disconnect(): Promise<void> {
    this.session = undefined;
  }
}

const flush = () => new Promise<void>(resolve => setTimeout(resolve, 0));

describe('Oath WalletConnect adapter lifecycle', () => {
  let provider: FakeProvider;
  let service: OathConnectionService;
  let adapter: OathWalletAdapter;
  let account$: BehaviorSubject<string>;

  beforeEach(() => {
    provider = new FakeProvider();
    service = new OathConnectionService();
    spyOn(service, 'showUri').and.resolveTo();
    account$ = new BehaviorSubject<string>(null);
    adapter = new OathWalletAdapter(
      account$,
      new BehaviorSubject<BlockchainName>(null),
      { catch: jasmine.createSpy('safeError') } as unknown as ErrorsService,
      { run: (fn: () => void) => fn() } as NgZone,
      window as RubicWindow,
      service,
      async () => provider as unknown as Provider
    );
  });

  afterEach(async () => {
    service.cancel();
    if (service.attempt) service.finish(service.attempt);
    await adapter.deactivate();
  });

  it('restores an approved session without opening a QR guide', async () => {
    provider.session = {};
    await adapter.activate();

    expect(adapter.isActive).toBeTrue();
    expect(account$.value).toBe(address);
    expect(service.showUri).not.toHaveBeenCalled();
  });

  it('does not start hidden pairing when a stored session is gone', async () => {
    await expectAsync(adapter.activate()).toBeRejected();

    expect(provider.enableCount).toBe(0);
    expect(adapter.isActive).toBeFalse();
  });

  it('accepts a supported session and forwards account changes', async () => {
    service.begin();
    const activation = adapter.activate();
    await flush();
    provider.publish();

    expect(service.showUri).toHaveBeenCalled();
    provider.approve();
    await activation;

    expect(adapter.isActive).toBeTrue();
    provider.emit('accountsChanged', []);

    expect(account$.value).toBeNull();
  });

  it('rejects an unsupported session and unsupported chain-switch requests', async () => {
    provider.session = {};
    provider.chainId = 324;
    await expectAsync(adapter.activate()).toBeRejected();
    await expectAsync(adapter.switchChain('0x144')).toBeRejected();

    expect(provider.request).not.toHaveBeenCalled();
    expect(adapter.isActive).toBeFalse();
  });

  it('expires a cancelled proposal, deletes its pairing and allows a fresh retry', async () => {
    const attempt = service.begin();
    const activation = adapter.activate();
    const rejected = expectAsync(activation).toBeRejected();
    await flush();
    provider.publish();
    service.cancel();
    await rejected;
    await adapter.deactivate();

    expect(provider.expired).toBeGreaterThan(0);
    expect(provider.deletedPairings).toBe(1);
    expect(account$.value).toBeNull();
    expect(provider.listenerCount('display_uri')).toBe(0);
    service.finish(attempt);
    service.begin();
    const retry = adapter.activate();
    await flush();
    provider.publish();
    provider.approve();
    await retry;

    expect(provider.enableCount).toBe(2);
    expect(adapter.isActive).toBeTrue();
  });

  it('cancels a proposal created after the guide was closed', async () => {
    service.begin();
    const activation = adapter.activate();
    const rejected = expectAsync(activation).toBeRejected();
    await flush();
    service.cancel();
    await rejected;
    provider.publish();
    await adapter.deactivate();

    expect(provider.expired).toBeGreaterThan(0);
    expect(provider.deletedPairings).toBe(1);
    expect(account$.value).toBeNull();
    expect(service.showUri).not.toHaveBeenCalled();
  });
});
