'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error: any) {
        // NextAuth wraps custom errors inside layers of causes or types.
        // Easiest robust detection is partial string match on the serialized error stack.
        const causeMsg = (error as any).cause?.err?.message || '';
        const errorStack = String(error) + (error.cause ? String(error.cause) : '') + (error.stack ? String(error.stack) : '') + causeMsg;

        if (errorStack.includes('2FA_REQUIRED')) {
            return '2FA_REQUIRED';
        }
        if (errorStack.includes('2FA_INVALID')) {
            return 'Invalid 2FA Code.';
        }
        if (errorStack.includes('RATE_LIMIT_EXCEEDED')) {
            return 'Too many login attempts. Please try again in 15 minutes.';
        }

        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                case 'CallbackRouteError':
                    return 'Something went wrong.';
                default:
                    return 'Something went wrong.';
            }
        }
        // NEXT_REDIRECT error must be bubbled up!
        throw error;
    }
}
