const { OTP } = require('otplib');

(async () => {
    try {
        const totp = new OTP();
        const secret = 'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRJZ';

        // Proper await
        const token = await totp.generate({ secret });
        console.log('Token from TOTP:', token);

        // Now try verify
        const isValid = await totp.verify({ token, secret });
        console.log('Validity exact:', isValid);

        const isValidWindow = await totp.verify({ token, secret, epochTolerance: 20 });
        console.log('Validity window:', isValidWindow);

        console.log('Type of verify result:', typeof isValidWindow);
    } catch (e) {
        console.error(e);
    }
})();
