
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTwoFactorTokenEmail(email: string, token: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Skipping email send.');
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Orbit 911 <onboarding@resend.dev>', // Default Resend test domain
            to: email,
            subject: 'Your 2FA Code - Orbit 911',
            html: `<p>Your 2FA code is: <strong>${token}</strong></p>`
        });

        if (error) {
            console.error('Resend API returned an error:', error);
            console.log(`\n\n=== 2FA TOKEN FOR ${email} (FALLBACK) ===\n${token}\n=========================================\n\n`);
            return;
        }

        console.log(`2FA email successfully sent to ${email} (ID: ${data?.id})`);
    } catch (error) {
        console.error('Exception caught while sending 2FA email:', error);
        console.log(`\n\n=== 2FA TOKEN FOR ${email} (FALLBACK) ===\n${token}\n=========================================\n\n`);
    }
}
