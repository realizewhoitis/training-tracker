import { ShieldCheck, User, LayoutDashboard, KeyRound } from 'lucide-react';

export default function Chapter1Page() {
    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Chapter 1: Getting Started</h1>
                    <p className="text-slate-500">First-time login, dashboard navigation, and configuring your personal profile.</p>
                </div>
            </div>

            <div className="prose prose-slate max-w-none space-y-8 text-slate-700">

                {/* Section 1 */}
                <section>
                    <h2 className="flex items-center text-xl font-bold text-slate-800 border-b border-slate-100 pb-2">
                        <KeyRound className="w-5 h-5 mr-2 text-slate-400" />
                        First-Time Login & Two-Factor Authentication
                    </h2>
                    <p className="mt-4">
                        When navigating to the Orbit 911 login portal, you will be prompted for your email address and password. If your administrator has recently provisioned your account, you will have received a temporary automated password via your registered email inbox.
                    </p>

                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-4 text-amber-800 rounded-r-lg shadow-sm">
                        <strong>Important:</strong> Upon logging in with your temporary automatic password, the system will instantly reroute you to the <strong>Password Reset</strong> portal to enact a mandatory security rotation. You will not be able to access the dashboard until you secure your account with a permanent, private password.
                    </div>

                    <p>
                        Once your correct password is submitted, the system will prompt you for an <strong>Identity Verification Code (2FA)</strong>. A 6-digit Time-Based One-Time Password will be generated and dispatched exclusively to your email inbox. You have exactly 5 minutes to paste this code into the browser before it expires.
                    </p>

                    <div className="my-6 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 flex flex-col items-center justify-center shadow-inner">
                        <span className="text-slate-400 text-sm font-mono">[📸 Insert Screenshot: The Login Portal showing the 6-Digit 2FA Code Input]</span>
                    </div>
                </section>

                {/* Section 2 */}
                <section>
                    <h2 className="flex items-center text-xl font-bold text-slate-800 border-b border-slate-100 pb-2 mt-8">
                        <LayoutDashboard className="w-5 h-5 mr-2 text-slate-400" />
                        The Main Dashboard
                    </h2>
                    <p className="mt-4">
                        Upon successful authentication, you will arrive at the main Dashboard. Your dashboard is highly dynamic and automatically restricts visibility based on your assigned <strong>Role</strong>.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-700">
                        <li><strong>For General Employees:</strong> The dashboard will primarily display your personal schedule, assigned assets, and upcoming mandatory training deadlines.</li>
                        <li><strong>For Supervisors & Administrators:</strong> The dashboard summarizes global agency statistics, such as active training rosters, pending observation reports, and expiring team certifications.</li>
                    </ul>

                    <div className="my-6 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 flex flex-col items-center justify-center shadow-inner">
                        <span className="text-slate-400 text-sm font-mono">[📸 Insert Screenshot: The Dashboard overview highlighting the dynamic stat widgets]</span>
                    </div>
                </section>

                {/* Section 3 */}
                <section>
                    <h2 className="flex items-center text-xl font-bold text-slate-800 border-b border-slate-100 pb-2 mt-8">
                        <User className="w-5 h-5 mr-2 text-slate-400" />
                        Your Personal Profile
                    </h2>
                    <p className="mt-4">
                        Navigate to the <strong>My Profile</strong> tab on the left-hand navigation sidebar to view your permanent employee records. This interface serves as your personal hub for agency data.
                    </p>
                    <p className="mt-4">
                        From here, you can directly monitor the hardware assets currently issued to your name, review a chronological timeline of all your completed Training Events, and read finalized Daily Observation Reports (DORs) filed by your Field Training Officers during probationary periods.
                    </p>

                    <div className="bg-blue-50 border border-blue-200 p-4 my-6 text-blue-800 rounded-lg shadow-sm">
                        <strong>Self-Service Updates:</strong> To update your internal email address or name, click the "Update Settings" form located at the top of your Profile page. Changing your email address here will automatically update the destination where your 2FA verification tokens are sent.
                    </div>
                </section>

            </div>
        </div>
    );
}
