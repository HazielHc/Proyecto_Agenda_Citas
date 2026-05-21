import crypto from 'node:crypto';

const encoder = new TextEncoder();

export interface AuthSession {
  barberId: number;
  businessId: number;
  email: string;
  role: 'administrador' | 'barbero';
  name: string;
  businessName: string;
  exp?: number;
}

function base64Url(input: Buffer | string) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function decodeBase64Url(input: string) {
  const padded = input.padEnd(input.length + ((4 - (input.length % 4)) % 4), '=');
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is required');
  }
  return secret;
}

export function signToken(payload: Omit<AuthSession, 'exp'>) {
  const expiresIn = Number(process.env.JWT_EXPIRES_IN_SECONDS || 60 * 60 * 8);
  const header = { alg: 'HS256', typ: 'JWT' };
  const body: AuthSession = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresIn
  };

  const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(body))}`;
  const signature = crypto
    .createHmac('sha256', getJwtSecret())
    .update(unsigned)
    .digest();

  return `${unsigned}.${base64Url(signature)}`;
}

export function verifyToken(token: string): AuthSession {
  const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');
  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new Error('Invalid token');
  }

  const unsigned = `${encodedHeader}.${encodedPayload}`;
  const expected = base64Url(
    crypto.createHmac('sha256', getJwtSecret()).update(unsigned).digest()
  );

  const receivedBytes = encoder.encode(encodedSignature);
  const expectedBytes = encoder.encode(expected);
  if (
    receivedBytes.byteLength !== expectedBytes.byteLength ||
    !crypto.timingSafeEqual(receivedBytes, expectedBytes)
  ) {
    throw new Error('Invalid token signature');
  }

  const payload = JSON.parse(decodeBase64Url(encodedPayload)) as AuthSession;
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Expired token');
  }

  return payload;
}

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });

  return `scrypt:${salt}:${hash.toString('hex')}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, hash] = storedHash.split(':');
  if (algorithm !== 'scrypt' || !salt || !hash) {
    return false;
  }

  const candidate = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });

  const stored = Buffer.from(hash, 'hex');
  return stored.length === candidate.length && crypto.timingSafeEqual(stored, candidate);
}
