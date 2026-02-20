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
        const errorStack = String(error) + (error.cause ? String(error.cause) : '') + (error.stack ? String(error.stack) : '');

        if (errorStack.includes('2FA_REQUIRED')) {
            return '2FA_REQUIRED';
        }
        if (errorStack.includes('2FA_INVALID')) {
            return 'Invalid 2FA Code.';
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
