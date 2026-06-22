import createHmac from 'create-hmac';

export function getSignature(secret: string, body: string): string {
  return createHmac('sha256', secret).update(body).digest('hex');
}
