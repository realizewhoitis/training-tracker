import { AlertTriangle } from 'lucide-react';

export default function GracePeriodBanner({ daysRemaining }: { daysRemaining: number }) {
    return (
        <div className="bg-amber-100 border-b border-amber-200 w-full px-4 py-3 flex items-center justify-center text-amber-900 shadow-sm z-50">
            <AlertTriangle className="h-5 w-5 mr-3 text-amber-600 flex-shrink-0" />
            <div className="text-sm font-medium">
                <span className="font-bold">License Expired.</span> Your Orbit 911 instance is currently in Grace Period status ({daysRemaining} days remaining). The system is in <strong>Read-Only Mode</strong>. Please contact your system administrator to renew the license.
            </div>
        </div>
    );
}
