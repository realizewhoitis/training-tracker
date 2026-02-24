import HelpSidebar from './components/HelpSidebar';

export default function HelpLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)] rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            <HelpSidebar />
            <main className="flex-1 p-8 overflow-y-auto bg-white">
                <div className="max-w-4xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
