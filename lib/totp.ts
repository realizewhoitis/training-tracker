import { createHmac, randomBytes } from 'crypto';

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Decode(secret: string): Buffer {
    let bits = '';
    for (const char of secret.toUpperCase().replace(/[= ]/g, '')) {
        const val = BASE32_CHARS.indexOf(char);
        if (val === -1) continue;
        bits += val.toString(2).padStart(5, '0');
    }
    const bytes: number[] = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
        bytes.push(parseInt(bits.slice(i, i + 8), 2));
    }
    return Buffer.from(bytes);
}

function hotp(key: Buffer, counter: number): string {
    const counterBuf = Buffer.alloc(8);
    counterBuf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
    counterBuf.writeUInt32BE(counter >>> 0, 4);
    const hash = createHmac('sha1', key).update(counterBuf).digest();
    const offset = hash[hash.length - 1] & 0x0f;
    const code =
        ((hash[offset] & 0x7f) << 24) |
        ((hash[offset + 1] & 0xff) << 16) |
        ((hash[offset + 2] & 0xff) << 8) |
        (hash[offset + 3] & 0xff);
    return (code % 1_000_000).toString().padStart(6, '0');
}

/** Generate a 6-digit TOTP code for the current 30-second window. */
export function generateTOTP(secret: string): string {
    const step = Math.floor(Date.now() / 1000 / 30);
    return hotp(base32Decode(secret), step);
}

/**
 * Verify a TOTP token.
 * windowSteps: number of 30-second steps to check in each direction.
 * windowSteps=20 gives a ±10 minute tolerance — enough for email delivery.
 */
export function verifyTOTP(token: string, secret: string, windowSteps = 1): boolean {
    const step = Math.floor(Date.now() / 1000 / 30);
    const key = base32Decode(secret);
    for (let w = -windowSteps; w <= windowSteps; w++) {
        if (hotp(key, step + w) === token) return true;
    }
    return false;
}

/** Generate a random base32 secret suitable for TOTP. */
export function generateTOTPSecret(byteLength = 20): string {
    const bytes = randomBytes(byteLength);
    let result = '';
    let bits = 0;
    let value = 0;
    for (const byte of bytes) {
        value = (value << 8) | byte;
        bits += 8;
        while (bits >= 5) {
            result += BASE32_CHARS[(value >>> (bits - 5)) & 0x1f];
            bits -= 5;
        }
    }
    if (bits > 0) result += BASE32_CHARS[(value << (5 - bits)) & 0x1f];
    return result;
}
