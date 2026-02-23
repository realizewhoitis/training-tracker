
import { Resend } from 'resend';
import prisma from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTemplatedEmail(
    templateName: string,
    toEmail: string,
    variables: Record<string, string>
) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Skipping email send.');
        return { success: false, error: 'API Key missing' };
    }

    try {
        const template = await prisma.emailTemplate.findUnique({
            where: { name: templateName }
        });

        if (!template) {
            console.error(`Email template "${templateName}" not found. Cannot send email.`);
            return { success: false, error: 'Template not found' };
        }

        // Parse subject and body, replacing {{variables}}
        let processedSubject = template.subject;
        let processedBody = template.body;

        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            processedSubject = processedSubject.replace(regex, value);
            processedBody = processedBody.replace(regex, value);
        }

        const { data, error } = await resend.emails.send({
            from: 'Orbit 911 <system@orbit911.com>', // Verified Production Domain
            to: toEmail,
            subject: processedSubject,
            html: processedBody
        });

        if (error) {
            console.error('Resend API returned an error:', error);
            return { success: false, error };
        }

        console.log(`Templated email "${templateName}" successfully sent to ${toEmail} (ID: ${data?.id})`);
        return { success: true, id: data?.id };
    } catch (error) {
        console.error('Exception caught while sending templated email:', error);
        return { success: false, error };
    }
}

export async function sendTwoFactorTokenEmail(email: string, token: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Skipping email send.');
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Orbit 911 <system@orbit911.com>', // Verified Production Domain
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
