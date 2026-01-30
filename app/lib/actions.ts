
'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if ((error as Error).message.includes('2FA_REQUIRED')) {
            return '2FA_REQUIRED';
        }
        if ((error as Error).message.includes('2FA_INVALID')) {
            return 'Invalid 2FA Code.';
        }

        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                case 'CallbackRouteError':
                    // NextAuth wraps thrown errors in CallbackRouteError
                    // We need to check the cause or the message again if it was wrapped
                    const msg = error.message;
                    if (msg.includes('2FA_REQUIRED') || error.cause?.err?.message.includes('2FA_REQUIRED')) {
                        return '2FA_REQUIRED';
                    }
                    if (msg.includes('2FA_INVALID') || error.cause?.err?.message.includes('2FA_INVALID')) {
                        return 'Invalid 2FA Code.';
                    }
                    return 'Something went wrong.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}
