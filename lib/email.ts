
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("⚠️ RESEND_API_KEY is missing. Email skipped.");
        console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Orbit 911 <notifications@orbit911.com>', // You might need to verify a domain or use 'onboarding@resend.dev' for testing
            to,
            subject,
            html,
        });

        if (error) {
            console.error("❌ Failed to send email:", error);
            throw error;
        }

        console.log(`📧 Email sent to ${to}: ${data?.id}`);
        return data;
    } catch (error) {
        console.error("❌ Failed to send email:", error);
        throw error;
    }
}

export function generateDORSubmittedEmail(traineeName: string, trainerName: string, date: Date, dorId: number) {
    return `
    <div style="font-family: sans-serif; color: #333;">
        <h2>New DOR Submitted</h2>
        <p>Hello ${traineeName},</p>
        <p>A new Daily Observation Report has been submitted by your trainer, <strong>${trainerName}</strong>.</p>
        
        <p><strong>Date:</strong> ${date.toLocaleDateString()}</p>
        <p><strong>Report ID:</strong> #${dorId}</p>
        
        <p>Please log in to your dashboard to review and sign this report.</p>
        
        <a href="${process.env.AUTH_URL || 'http://localhost:3000'}/dor/${dorId}" 
           style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
           View Report
        </a>
    </div>
    `;
}

export function generateDORSignedEmail(trainerName: string, traineeName: string, date: Date, dorId: number) {
    return `
    <div style="font-family: sans-serif; color: #333;">
        <h2>DOR Signed by Trainee</h2>
        <p>Hello ${trainerName},</p>
        <p><strong>${traineeName}</strong> has reviewed and signed their Daily Observation Report.</p>
        
        <p><strong>Date:</strong> ${date.toLocaleDateString()}</p>
        <p><strong>Report ID:</strong> #${dorId}</p>
        
        <a href="${process.env.AUTH_URL || 'http://localhost:3000'}/dor/${dorId}" 
           style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
           View Signed Report
        </a>
    </div>
    `;
}
