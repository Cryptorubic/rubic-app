declare module 'create-hmac' {
  interface Hmac {
    update(data: string | Buffer): Hmac;
    digest(encoding: 'hex' | 'base64' | 'latin1'): string;
    digest(): Buffer;
  }
  function createHmac(algorithm: string, key: string | Buffer): Hmac;
  export default createHmac;
}
