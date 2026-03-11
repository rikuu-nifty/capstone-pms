import { CircleCheckBig } from 'lucide-react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="relative grid min-h-screen w-screen bg-slate-100 lg:grid-cols-2">
            <div className="hidden flex-col items-center justify-center bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 px-10 py-12 text-white lg:flex">
                <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-white/95 shadow-2xl ring-8 ring-white/15">
                    <img
                        src="https://www.auf.edu.ph/home/images/mascot/GEN.png?fbclid=IwY2xjawMgqbZleHRuA2FlbQIxMABicmlkETFFYUR4UDFweVZ5aUg4SjgwAR57RbJL-7uLCBniR8lWTo0VrNoDP7ZzMqtXuMKvWwl5Hg9gOC4sk1V1PwtPUw_aem_4l1fL_RgoA1KHo50bAt60Q"
                        alt="AUF Logo"
                        className="h-20 w-20 object-contain"
                    />
                </div>

                <h1 className="mb-3 text-4xl font-extrabold tracking-tight">Tap &amp; Track</h1>
                <p className="mb-10 max-w-md text-center text-base leading-relaxed text-blue-100">
                    Angeles University Foundation
                    <br />
                    NFC-Based University Property Management System
                </p>

                <div className="w-full max-w-md space-y-4 rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <CircleCheckBig className="h-5 w-5 text-white" />
                        <span className="text-sm font-medium">NFC-powered asset tagging</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <CircleCheckBig className="h-5 w-5 text-white" />
                        <span className="text-sm font-medium">Real-time asset tracking and updates</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <CircleCheckBig className="h-5 w-5 text-white" />
                        <span className="text-sm font-medium">Role-based approvals and transfers</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <CircleCheckBig className="h-5 w-5 text-white" />
                        <span className="text-sm font-medium">Seamless inventory audits</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
                <div className="w-full max-w-xl">
                    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_-20px_rgba(15,23,42,0.22)]">
                        <div className="space-y-6 p-8 sm:p-10">
                            <div className="text-center sm:text-left">
                                <h2 className="text-4xl font-bold tracking-tight text-slate-900">
                                    {title ?? 'Welcome Back!'}
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    {description ?? "Sign in to access Tap & Track's dashboard."}
                                </p>
                            </div>

                            {children}

                            <div className="border-t border-slate-200 pt-5 text-center text-xs text-slate-500">
                                Need help? <span className="font-medium text-blue-600">support@auf.edu.ph</span> | (045) 625-2888
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}