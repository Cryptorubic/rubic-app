import { OathConnectionService, OathConnectionView } from './oath-connection.service';
import QRCode from 'qrcode';

const pairing = `wc:${'a'.repeat(64)}@2?relay-protocol=irn&symKey=${'b'.repeat(64)}`;

describe('Oath connection guide', () => {
  it('keeps the newest QR when renders within one attempt finish out of order', async () => {
    const service = new OathConnectionService();
    let finishOld: (image: string) => void;
    const oldImage = new Promise<string>(resolve => {
      finishOld = resolve;
    });
    let renderCount = 0;
    spyOn(QRCode, 'toDataURL').and.callFake((() =>
      renderCount++ === 0 ? oldImage : Promise.resolve('new-image')) as typeof QRCode.toDataURL);
    let state: OathConnectionView | null;
    const sub = service.view$.subscribe(value => {
      state = value;
    });
    const attempt = service.begin();
    try {
      const oldRender = service.showUri(attempt, pairing);
      await service.showUri(attempt, pairing.replace('a'.repeat(64), 'c'.repeat(64)));
      finishOld('old-image');
      await oldRender;

      expect(state.qrImage).toBe('new-image');
      expect(state.appLink).toContain('c'.repeat(64));
    } finally {
      service.finish(attempt);
      sub.unsubscribe();
    }
  });

  it('ignores a superseded QR failure but reports a failure of the current render', async () => {
    const service = new OathConnectionService();
    let failOld: (error: Error) => void;
    const oldImage = new Promise<string>((_resolve, reject) => {
      failOld = reject;
    });
    let renderCount = 0;
    const renderer = spyOn(QRCode, 'toDataURL').and.callFake((() =>
      renderCount++ === 0 ? oldImage : Promise.resolve('new-image')) as typeof QRCode.toDataURL);
    const attempt = service.begin();
    try {
      const oldRender = service.showUri(attempt, pairing);
      await service.showUri(attempt, pairing);
      failOld(new Error('Old render failed'));

      await expectAsync(oldRender).toBeResolved();
      renderer.and.callFake((() =>
        Promise.reject(new Error('Current render failed'))) as typeof QRCode.toDataURL);
      await expectAsync(service.showUri(attempt, pairing)).toBeRejectedWithError(
        'Current render failed'
      );
    } finally {
      service.finish(attempt);
    }
  });

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
