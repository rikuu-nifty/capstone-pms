    // import { type SharedData } from '@/types';
    // import { usePage } from '@inertiajs/react';
    import { CircleCheckBig } from 'lucide-react';
    import { type PropsWithChildren } from 'react';

    interface AuthLayoutProps {
    title?: string;
    description?: string;
    }

    export default function AuthSplitLayout({
    children,
    //   title,
    //   description,
    }: PropsWithChildren<AuthLayoutProps>) {
    //   const { name } = usePage<SharedData>().props;

    return (
        <div className="relative grid h-screen w-screen lg:grid-cols-2">
        {/* LEFT SIDE */}
        <div className="flex flex-col items-center justify-center bg-gradient-to-b from-blue-700 to-blue-500 px-10 py-12 text-white">
            {/* Logo with white circular background */}
            <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-lg">
            <img
                src="https://www.auf.edu.ph/home/images/mascot/GEN.png?fbclid=IwY2xjawMgqbZleHRuA2FlbQIxMABicmlkETFFYUR4UDFweVZ5aUg4SjgwAR57RbJL-7uLCBniR8lWTo0VrNoDP7ZzMqtXuMKvWwl5Hg9gOC4sk1V1PwtPUw_aem_4l1fL_RgoA1KHo50bAt60Q"
                alt="AUF Logo"
                className="h-20 w-20 object-contain"
            />
            </div>

            {/* Title */}
            <h1 className="mb-3 text-4xl font-extrabold tracking-tight">Tap &amp; Track</h1>
            <p className="mb-10 max-w-s text-center text-base text-blue-100 leading-relaxed">
            Angeles University Foundation <br />
            NFC-Based University Property Management System
            </p>

            {/* Feature list */}
            <ul className="space-y-4 text-base">
            <li className="flex items-center gap-3">
                <CircleCheckBig className="h-5 w-5 text-white" /> NFC-powered asset tagging
            </li>
            <li className="flex items-center gap-3">
                <CircleCheckBig className="h-5 w-5 text-white" /> Real-time asset tracking & updates
            </li>
            <li className="flex items-center gap-3">
                <CircleCheckBig className="h-5 w-5 text-white" /> Role-based approvals & transfers
            </li>
            <li className="flex items-center gap-3">
                <CircleCheckBig className="h-5 w-5 text-white" /> Seamless inventory audits
            </li>
            </ul>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-20 bg-gray-50">
            <div className="mx-auto w-full max-w-md">
            {/* Card container */}
            <div className="rounded-2xl bg-white p-8 shadow-lg space-y-6">
                <div className="text-center sm:text-left">
                <h2 className="text-3xl font-semibold text-gray-900">Welcome Back!</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Sign in to access <strong>Tap & Track</strong>'s dashboard.
                </p>
                </div>

                {/* Login / Register Form */}
                {children}

                {/* Footer */}
                <div className="pt-4 text-center text-xs text-gray-500 border-t">
                Need help?{" "}
                <span className="font-medium text-blue-600">support@auf.edu.ph</span> | (045) 625-2888
                </div>
            </div>
            </div>
        </div>
        </div>
    );
    }
