'use client';

import { useState } from 'react';
import { generateTwoFactorSecret, enableTwoFactor, disableTwoFactor } from './actions';
import QRCode from 'qrcode';
import { Loader2 } from 'lucide-react';

export default function MFA_Setup({ isEnabled }: { isEnabled: boolean }) {
    const [step, setStep] = useState<'IDLE' | 'SCAN' | 'VERIFY'>('IDLE');
    const [secret, setSecret] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const startSetup = async () => {
        setLoading(true);
        try {
            const { secret, otpauth } = await generateTwoFactorSecret();
            setSecret(secret);
            const url = await QRCode.toDataURL(otpauth);
            setQrCodeUrl(url);
            setStep('SCAN');
        } catch (e) {
            console.error(e);
            setError('Failed to generate 2FA secret. Please ensure required libraries are installed.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await enableTwoFactor(secret, code);
            if (result.success) {
                setStep('IDLE');
                // Page will likely revalidate, but we can reset local state
            } else {
                setError(result.message || 'Verification failed');
            }
        } catch (e) {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDisable = async () => {
        if (!confirm('Are you sure you want to disable 2FA? Your account will be less secure.')) return;
        setLoading(true);
        await disableTwoFactor();
        setLoading(false);
    };

    if (isEnabled) {
        return (
            <button
                onClick={handleDisable}
                disabled={loading}
                className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium"
            >
                {loading ? 'Disabling...' : 'Disable 2FA'}
            </button>
        );
    }

    if (step === 'IDLE') {
        return (
            <div>
                {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
                <button
                    onClick={startSetup}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                    {loading ? (
                        <span className="flex items-center">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Setting up...
                        </span>
                    ) : (
                        'Setup 2FA'
                    )}
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-md">
            <h4 className="font-bold text-slate-800 mb-4">Setup Two-Factor Authentication</h4>

            <div className="mb-6 text-center bg-white p-4 border border-slate-200 rounded-lg inline-block">
                {qrCodeUrl && <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48 mx-auto" />}
                <p className="text-xs text-slate-500 mt-2">Scan with Google Authenticator or Authy</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Verify Code</label>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="000 000"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
                    />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <div className="flex gap-3">
                    <button
                        onClick={handleVerify}
                        disabled={loading || code.length < 6}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Verify & Enable'}
                    </button>
                    <button
                        onClick={() => setStep('IDLE')}
                        disabled={loading}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-medium"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
