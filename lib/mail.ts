
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTwoFactorTokenEmail(email: string, token: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Skipping email send.');
        return;
    }

    try {
        await resend.emails.send({
            from: 'Orbit 911 <onboarding@resend.dev>', // Default Resend test domain
            to: email,
            subject: 'Your 2FA Code - Orbit 911',
            html: `<p>Your 2FA code is: <strong>${token}</strong></p>`
        });
        console.log(`2FA email sent to ${email}`);
    } catch (error) {
        console.error('Failed to send 2FA email:', error);
        // Don't crash the app if email fails, but log it
    }
}
