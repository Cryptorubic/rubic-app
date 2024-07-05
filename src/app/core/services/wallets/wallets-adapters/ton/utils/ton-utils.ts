export class TonUtils {
  //   public static toString(rawAddr: string): string {
  //     return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
  //   }

  //   private static toStringBuffer(workchain: number): Buffer {
  //     const addr = Buffer.alloc(34);
  //     addr[0] = tag;
  //     addr[1] = workChain;
  //     addr.set(this.hash, 2);
  //     const addressWithChecksum = Buffer.alloc(36);
  //     addressWithChecksum.set(addr);
  //     addressWithChecksum.set(crc16(addr), 34);
  //     return addressWithChecksum;
  //   }

  public static isAddressFriendly(source: string): boolean {
    if (source.length !== 48) {
      return false;
    }
    if (!/[A-Za-z0-9+/_-]+/.test(source)) {
      return false;
    }

    return true;
  }

  public static isAddressRaw(source: string): boolean {
    if (source.indexOf(':') === -1) {
      return false;
    }
    let [wc, hash] = source.split(':');

    if (!Number.isInteger(parseFloat(wc))) {
      return false;
    }
    if (!/[a-f0-9]+/.test(hash.toLowerCase())) {
      return false;
    }
    if (hash.length !== 64) {
      return false;
    }

    return true;
  }
}
