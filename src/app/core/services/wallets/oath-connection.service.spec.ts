import { OathConnectionService, OathConnectionView } from './oath-connection.service';
import QRCode from 'qrcode';

const pairing = `wc:${'a'.repeat(64)}@2?relay-protocol=irn&symKey=${'b'.repeat(64)}`;

describe('Oath connection guide', () => {
  it('does not show a QR that finishes rendering after cancellation or a retry', async () => {
    const service = new OathConnectionService();
    let complete: (image: string) => void;
    const image = new Promise<string>(resolve => {
      complete = resolve;
    });
    spyOn(QRCode, 'toDataURL').and.callFake((() => image) as typeof QRCode.toDataURL);
    let state: OathConnectionView | null;
    const sub = service.view$.subscribe(value => {
      state = value;
    });
    const first = service.begin();
    const render = service.showUri(first, pairing);
    service.cancel();
    service.finish(first);
    const second = service.begin();
    complete('old-image');
    await render;

    expect(state).toEqual({});
    expect(first.signal.aborted).toBeTrue();
    service.finish(second);

    expect(state).toBeNull();
    sub.unsubscribe();
  });

  it('clears the guide and times out an unanswered connection after five minutes', () => {
    jasmine.clock().install();
    try {
      const service = new OathConnectionService();
      const attempt = service.begin();
      jasmine.clock().tick(300001);

      expect(attempt.signal.aborted).toBeTrue();
      service.finish(attempt);

      expect(service.attempt).toBeNull();
    } finally {
      jasmine.clock().uninstall();
    }
  });
});
