const crypto = require('crypto');
const { authenticator } = require('otplib');

const generateBase32Secret = (length = 32) => {
    const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
        secret += base32chars[bytes[i] % 32];
    }
    return secret;
};

try {
    const s16 = generateBase32Secret(16);
    console.log("16 chars:", s16);
    const token16 = authenticator.generate(s16);
    console.log("Token generated:", token16);

    const s32 = generateBase32Secret(32);
    console.log("32 chars:", s32);
    const token32 = authenticator.generate(s32);
    console.log("Token generated:", token32);

} catch (e) {
    console.error("Error for length 16/32:", e.message);
}

try {
    const s20 = generateBase32Secret(20);
    console.log("20 chars:", s20);
    const token20 = authenticator.generate(s20);
    console.log("This shouldn't be reached");
} catch (e) {
    console.error("Error for length 20:", e.message);
}
