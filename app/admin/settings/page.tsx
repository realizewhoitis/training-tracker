import { getSettings, updateSettings } from './actions';
import { Settings, Upload, Save } from 'lucide-react';
import Image from 'next/image';

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

            <form action={updateSettings} className="space-y-6">

                {/* Organization Name */}
                <div className="space-y-2">
                    <label htmlFor="orgName" className="block text-sm font-medium text-gray-700">
                        Organization Name
                    </label>
                    <input
                        type="text"
                        name="orgName"
                        id="orgName"
                        defaultValue={settings.orgName}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                    <p className="text-xs text-gray-500">This name appears in report headers and the browser title.</p>
                </div>

                {/* License Management */}
                <div className="space-y-2 pt-4 border-t border-gray-100">
                    <h2 className="text-lg font-medium text-gray-900">License Information</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="licenseKey" className="block text-sm font-medium text-gray-700">License Key</label>
                            <input
                                name="licenseKey"
                                type="text"
                                defaultValue={settings?.licenseKey || ""}
                                placeholder="ORBIT-XXXX-XXXX-XXXX"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            />
                        </div>
                        <div className="flex items-end pb-2">
                            <span className="text-sm text-gray-500 mr-2">Status:</span>
                            <span className={`text-sm font-bold ${settings?.licenseStatus === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                                {settings?.licenseStatus || "UNKNOWN"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Logo Upload */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                        Center Logo
                    </label>

                    {settings.logoPath && (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 inline-block">
                            <p className="text-xs text-gray-500 mb-2">Current Logo:</p>
                            <Image
                                src={settings.logoPath?.startsWith('data:') ? settings.logoPath : `/api/files/${settings.logoPath}`}
                                alt="Current Logo"
                                width={150}
                                height={150}
                                className="object-contain h-24 w-auto"
                            />
                        </div>
                    )}

                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="logo-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-gray-500">PNG or JPG (MAX. 2MB)</p>
                            </div>
                            <input id="logo-upload" name="logo" type="file" className="hidden" accept="image/png, image/jpeg" />
                        </label>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        className="flex justify-center items-center w-full md:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                    >
                        <Save className="mr-2" size={20} />
                        Save Settings
                    </button>
                </div>

            </form>
        </div>
    );
}
