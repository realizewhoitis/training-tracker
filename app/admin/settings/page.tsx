import { getSettings } from './actions';
import { Settings } from 'lucide-react';
import SettingsForm from './SettingsForm';

export default async function SettingsPage() {
    const settings = await getSettings();

    return (
        <div className="max-w-2xl mx-auto p-6 md:p-10 space-y-8 h-full">
            <div className="border-b border-gray-200 pb-6">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center">
                    <Settings className="mr-3 text-slate-500" />
                    System Settings
                </h1>
                <p className="text-gray-500 mt-2">
                    Customize the appearance and identity of your training center.
                </p>
            </div>

            <SettingsForm settings={settings} />
        </div>
    );
}
