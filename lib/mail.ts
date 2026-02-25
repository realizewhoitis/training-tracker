
import { Resend } from 'resend';
import { getTenantPrisma } from '@/lib/prisma';

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
        const template = await (await getTenantPrisma()).emailTemplate.findUnique({
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

export async function sendDailyDORDigestEmail(email: string, submissions: any[]) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Skipping daily digest email send.');
        return;
    }

    const rows = submissions.map(sub => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px;">
                ${new Date(sub.date).toLocaleDateString()}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 500;">
                ${sub.trainee?.empName || 'Unknown Trainee'}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px;">
                ${sub.trainer?.name || 'Unknown Trainer'}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px;">
                ${sub.template?.title || 'Evaluation'}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px;">
                <a href="${process.env.NEXTAUTH_URL || 'https://orbit911.com'}/admin/forms/submissions/${sub.id}" style="color: #2563eb; text-decoration: none; font-weight: 500;">Review</a>
            </td>
        </tr>
    `).join('');

    const html = `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; color: #1e293b;">
            <div style="background-color: #f8fafc; padding: 24px; border-bottom: 2px solid #e2e8f0; border-radius: 8px 8px 0 0;">
                <h2 style="margin: 0; color: #0f172a;">Daily DOR Digest</h2>
                <p style="margin: 8px 0 0 0; color: #64748b;">Summary of observation reports submitted in the last 24 hours.</p>
            </div>
            
            <div style="padding: 24px;">
                <p style="font-size: 16px; margin-bottom: 24px;">There have been <strong>${submissions.length}</strong> new evaluations submitted since yesterday.</p>
                
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr>
                            <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #475569; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Date</th>
                            <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #475569; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Trainee</th>
                            <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #475569; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Evaluator</th>
                            <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #475569; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Form</th>
                            <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #475569; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
            
            <div style="padding: 24px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; border-radius: 0 0 8px 8px; text-align: center;">
                This is an automated notification from Orbit 911. You are receiving this because your account bears the RECEIVE_DAILY_REPORTS capability. To unsubscribe, contact your administrator.
            </div>
        </div>
    `;

    try {
        const { data, error } = await resend.emails.send({
            from: 'Orbit 911 <system@orbit911.com>', // Verified Production Domain
            to: email,
            subject: 'Daily Operations Digest - Orbit 911',
            html: html
        });

        if (error) {
            console.error('Resend API returned an error:', error);
            return;
        }

        console.log(`Daily digest email successfully sent to ${email} (ID: ${data?.id})`);
    } catch (error) {
        console.error('Exception caught while sending daily digest email:', error);
    }
}
