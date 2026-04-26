import AppLogoIcon from '@/components/app-logo-icon';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, BarChart3, CheckCircle2, ClipboardCheck, FileText, LockKeyhole, ShieldCheck, Sparkles, Warehouse } from 'lucide-react';

const features = [
    {
        icon: Warehouse,
        title: 'Centralized Asset Inventory',
        description: 'Keep property records, locations, assignments, and equipment details organized in one reliable workspace.',
    },
    {
        icon: ClipboardCheck,
        title: 'Guided Verification',
        description: 'Simplify verification forms and approval steps with clear status tracking and structured review flows.',
    },
    {
        icon: BarChart3,
        title: 'Operational Reports',
        description: 'Generate inventory, transfer, scheduling, and assignment reports that help teams make faster decisions.',
    },
];

const services = ['Inventory tracking', 'Transfer workflows', 'Off-campus monitoring', 'Role-based access', 'Audit trail', 'PDF reports'];

const metrics = [
    { value: '24/7', label: 'Accessible workspace' },
    { value: '6+', label: 'Core property workflows' },
    { value: '100%', label: 'Approval visibility' },
];

const capstoneLogos = [
    {
        src: '/images/capstone-citadel.png',
        alt: 'Angeles University Foundation crest',
        className: 'h-28 w-28 object-contain sm:h-32 sm:w-32',
    },
    {
        src: '/images/capstone-auf-des.jpg',
        alt: 'AUF DES logo',
        className: 'h-24 w-24 rounded-sm object-cover sm:h-28 sm:w-28',
    },
];

const routeOr = (name: string, fallback: string) => {
    try {
        return route(name);
    } catch {
        return fallback;
    }
};

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const isAuthenticated = Boolean(auth?.user);
    const homeHref = routeOr('home', '/');
    const dashboardHref = routeOr('dashboard', '/dashboard');
    const loginHref = routeOr('login', '/login');
    const registerHref = routeOr('register', '/register');
    const primaryHref = isAuthenticated ? dashboardHref : loginHref;
    const primaryLabel = isAuthenticated ? 'Open Dashboard' : 'Get Started';

    return (
        <>
            <Head title="Tap & Track: Property Management System">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>

            <main className="relative min-h-screen overflow-hidden bg-slate-100 text-slate-950">
                <div className="landing-gradient absolute inset-0" />
                <div className="landing-grid absolute inset-0" />
                <div className="landing-float landing-float-one absolute h-64 w-64 rounded-full bg-blue-400/25 blur-3xl" />
                <div className="landing-float landing-float-two absolute h-72 w-72 rounded-full bg-sky-300/25 blur-3xl" />

                <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10">
                    <header className="flex items-center justify-between gap-5 rounded-[24px] border border-slate-200/80 bg-white/80 px-4 py-3 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-5">
                        <Link href={homeHref} className="flex items-center gap-3">
                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 shadow-blue-900/10 ring-slate-200">
                                <AppLogoIcon className="h-9 w-9 object-contain" />
                            </span>
                            <span className="leading-tight">
                                <span className="block text-sm font-semibold tracking-wide text-blue-800">Tap & Track</span>
                                <span className="hidden text-xs font-medium text-slate-500 sm:block">University Property Management System</span>
                            </span>
                        </Link>

                        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
                            <a href="#features" className="transition hover:text-blue-700">
                                Features
                            </a>
                            <a href="#services" className="transition hover:text-blue-700">
                                Services
                            </a>
                            <a href="#security" className="transition hover:text-blue-700">
                                Security
                            </a>
                        </nav>

                        <div className="flex items-center gap-2">
                            {!isAuthenticated && (
                                <Link
                                    href={registerHref}
                                    className="hidden rounded-full px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 sm:inline-flex"
                                >
                                    Register
                                </Link>
                            )}
                            <Link
                                href={primaryHref}
                                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/15 transition hover:-translate-y-0.5 hover:bg-blue-700"
                            >
                                {primaryLabel}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </header>

                    <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:py-20">
                        <div className="max-w-3xl">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/70 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm backdrop-blur">
                                <Sparkles className="h-4 w-4 text-blue-600" />
                                Smarter asset tracking for university teams
                            </div>

                            <h1 className="max-w-4xl text-5xl leading-[1.02] font-bold tracking-normal text-slate-950 sm:text-6xl lg:text-7xl">
                                From asset check to record track, manage it all with Tap & Track.
                            </h1>
                            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                                A clean, reliable system for inventory records, property verification, transfers, scheduling, reports, and approvals.
                                Built to help teams work with less friction and better visibility.
                            </p>

                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                <Link
                                    href={primaryHref}
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-900/15 transition hover:-translate-y-0.5 hover:bg-blue-700"
                                >
                                    {primaryLabel}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <a
                                    href="#features"
                                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/75 px-6 py-3.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-white"
                                >
                                    Explore Features
                                </a>
                            </div>

                            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
                                {metrics.map((metric) => (
                                    <div key={metric.label} className="rounded-2xl border border-white/75 bg-white/70 p-4 shadow-sm backdrop-blur">
                                        <div className="text-2xl font-bold text-blue-700">{metric.value}</div>
                                        <div className="mt-1 text-xs leading-5 font-medium text-slate-500">{metric.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute -inset-5 rounded-[32px] bg-gradient-to-br from-blue-200/60 via-white/30 to-cyan-200/60 blur-2xl" />
                            <div className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/85 p-4 shadow-[0_30px_100px_rgba(15,23,42,0.18)] backdrop-blur-xl">
                                <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                                    <div className="mb-4 flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-xs font-semibold tracking-[0.18em] text-blue-700 uppercase">Live Overview</p>
                                            <h2 className="mt-1 text-xl font-bold text-slate-950">Property Command Center</h2>
                                        </div>
                                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">Online</span>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-3">
                                        {['Inventory', 'Transfers', 'Approvals'].map((item, index) => (
                                            <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                                <div className="mb-4 h-2 rounded-full bg-slate-200">
                                                    <div className="h-2 rounded-full bg-blue-600" style={{ width: `${86 - index * 18}%` }} />
                                                </div>
                                                <p className="text-sm font-semibold text-slate-900">{item}</p>
                                                <p className="mt-1 text-xs text-slate-500">Updated today</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
                                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                            <div className="mb-4 flex items-center justify-between">
                                                <p className="font-semibold text-slate-900">Recent Workflows</p>
                                                <FileText className="h-5 w-5 text-blue-700" />
                                            </div>
                                            {['Verification form reviewed', 'Transfer request routed', 'Inventory schedule prepared'].map((item) => (
                                                <div
                                                    key={item}
                                                    className="flex items-center gap-3 border-t border-slate-100 py-3 first:border-t-0 first:pt-0"
                                                >
                                                    <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600" />
                                                    <span className="text-sm font-medium text-slate-600">{item}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 p-4 text-white shadow-lg shadow-blue-900/15">
                                            <ShieldCheck className="h-8 w-8 text-blue-100" />
                                            <p className="mt-5 text-3xl font-bold">98%</p>
                                            <p className="mt-1 text-sm font-medium text-blue-50">records ready for review</p>
                                            <div className="mt-5 h-2 rounded-full bg-white/15">
                                                <div className="h-2 w-[82%] rounded-full bg-cyan-200" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <section className="relative overflow-hidden py-20 text-slate-950 sm:py-24">
                    <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
                        <div className="rounded-[28px] border border-white/80 bg-white/70 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                            <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-5">
                                <p className="text-xs font-bold tracking-[0.2em] text-blue-700 uppercase">Capstone Project Solution</p>
                                <div className="mt-5 grid grid-cols-2 gap-4">
                                    {capstoneLogos.map((logo) => (
                                        <div
                                            key={logo.src}
                                            className="group relative flex aspect-square items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_20px_60px_rgba(37,99,235,0.16)]"
                                        >
                                            <div className="absolute inset-3 rounded-[22px] bg-blue-400/0 blur-xl transition duration-300 group-hover:bg-blue-400/20" />
                                            <img
                                                src={logo.src}
                                                alt={logo.alt}
                                                className={`${logo.className} relative transition duration-300 group-hover:scale-105`}
                                            />
                                        </div>
                                    ))}
                                </div>
                                {/* <div className="mt-5 grid gap-3 rounded-2xl bg-blue-600 p-4 text-left text-white shadow-lg shadow-blue-900/10">
                                    <p className="text-sm font-semibold text-blue-50">Capstone project for campus property accountability</p>
                                    <p className="text-xs leading-5 text-blue-100">
                                        Developed for a clearer PMS workflow across inventory, verification, scheduling, transfers, approvals, and
                                        reports.
                                    </p>
                                </div> */}
                            </div>
                        </div>

                        <div className="lg:pl-4">
                            <div className="inline-flex rounded-full border border-blue-200 bg-white/75 px-5 py-2 text-sm font-semibold text-blue-700 shadow-sm backdrop-blur">
                                TAP &amp; TRACK
                            </div>
                            <h2 className="mt-6 max-w-4xl text-4xl leading-tight font-bold tracking-normal text-slate-950 sm:text-5xl">
                                Built to keep university assets visible, verified, and easier to manage.
                            </h2>
                            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                                Tap &amp; Track gives the Property Management Office a practical workspace for monitoring property records, reviewing
                                asset verification, routing transfer requests, preparing inventory schedules, and generating reports with confidence.
                            </p>
                            <div className="mt-8 grid gap-3 sm:grid-cols-3">
                                {['Inventory visibility', 'Approval tracking', 'Report readiness'].map((item) => (
                                    <div
                                        key={item}
                                        className="rounded-2xl border border-white/80 bg-white/70 p-4 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur"
                                    >
                                        <CheckCircle2 className="mb-3 h-5 w-5 text-blue-600" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section id="features" className="relative py-20">
                    <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
                        <div className="max-w-2xl">
                            <p className="text-sm font-bold tracking-[0.2em] text-blue-700 uppercase">Features</p>
                            <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
                                Everything your property team needs to stay aligned.
                            </h2>
                        </div>

                        <div className="mt-10 grid gap-5 md:grid-cols-3">
                            {features.map((feature) => (
                                <article
                                    key={feature.title}
                                    className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.1)]"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                                        <feature.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="mt-6 text-xl font-bold text-slate-950">{feature.title}</h3>
                                    <p className="mt-3 leading-7 text-slate-600">{feature.description}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="services" className="relative py-20">
                    <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:px-10">
                        <div>
                            <p className="text-sm font-bold tracking-[0.2em] text-blue-700 uppercase">Services</p>
                            <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">Designed for daily property operations.</h2>
                            <p className="mt-5 leading-8 text-slate-600">
                                The landing experience now presents the system as a focused, professional operations platform with clear paths to sign
                                in, register, and understand what the product supports.
                            </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {services.map((service) => (
                                <div key={service} className="flex items-center gap-3 rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
                                    <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600" />
                                    <span className="font-semibold text-slate-800">{service}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="security" className="relative py-20">
                    <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
                        <div className="overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 p-8 text-white shadow-[0_30px_100px_rgba(15,23,42,0.22)] sm:p-10 lg:p-12">
                            <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
                                <div>
                                    <LockKeyhole className="h-10 w-10 text-blue-100" />
                                    <h2 className="mt-6 text-3xl font-bold sm:text-4xl">Ready to streamline property management?</h2>
                                    <p className="mt-4 max-w-2xl leading-8 text-blue-50">
                                        Move from scattered records to a cleaner, more accountable workflow for assets, forms, approvals, and reports.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                                    <Link
                                        href={primaryHref}
                                        className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-50"
                                    >
                                        {primaryLabel}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    {!isAuthenticated && (
                                        <Link
                                            href={registerHref}
                                            className="inline-flex items-center justify-center rounded-full border border-white/25 px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
                                        >
                                            Create Account
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="relative py-8">
                    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
                        <p className="font-semibold text-blue-800">Tap & Track University Property Management System</p>
                        <p>Built for organized records, clear approvals, and confident reporting.</p>
                    </div>
                </footer>
            </main>
        </>
    );
}
