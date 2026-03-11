import { Head, useForm } from '@inertiajs/react';
import { Check, LoaderCircle, LockKeyhole, ShieldCheck, X } from 'lucide-react';
import { FormEventHandler, useMemo, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

type RuleProps = {
    valid: boolean;
    text: string;
};

function PasswordRule({ valid, text }: RuleProps) {
    return (
        <div
            className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-all ${
                valid
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-red-200 bg-red-50 text-red-600'
            }`}
        >
            <div
                className={`flex h-5 w-5 items-center justify-center rounded-full ${
                    valid ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'
                }`}
            >
                {valid ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
            </div>
            <span className="font-medium">{text}</span>
        </div>
    );
}

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPasswordRules, setShowPasswordRules] = useState(false);

    const passwordChecks = useMemo(
        () => ({
            minLength: data.password.length >= 8,
            lowercase: /[a-z]/.test(data.password),
            uppercase: /[A-Z]/.test(data.password),
            number: /[0-9]/.test(data.password),
            symbol: /[^A-Za-z0-9]/.test(data.password),
        }),
        [data.password],
    );

    const allPasswordChecksPassed =
        passwordChecks.minLength &&
        passwordChecks.lowercase &&
        passwordChecks.uppercase &&
        passwordChecks.number &&
        passwordChecks.symbol;

    const passwordsMatch =
        data.password_confirmation.length > 0 && data.password === data.password_confirmation;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        setShowPasswordRules(true);

        if (/\s/.test(data.name)) {
            errors.name = 'Username cannot contain spaces.';
            return;
        }

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Create an account" description="Enter your details below to create your account.">
            <Head title="Register" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Username</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value.replace(/\s/g, ''))}
                            disabled={processing}
                            placeholder="Username"
                            className="h-12 rounded-xl border-gray-200 shadow-sm transition focus-visible:ring-2 focus-visible:ring-blue-500"
                        />
                        <InputError
                            message={errors.name || (/\s/.test(data.name) ? 'Username cannot contain spaces.' : '')}
                            className="mt-1"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="email@example.com"
                            className="h-12 rounded-xl border-gray-200 shadow-sm transition focus-visible:ring-2 focus-visible:ring-blue-500"
                        />
                        <InputError message={errors.email} className="mt-1" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Password"
                            className="h-12 rounded-xl border-gray-200 shadow-sm transition focus-visible:ring-2 focus-visible:ring-blue-500"
                        />

                        {(showPasswordRules || !!errors.password) && (
                            <div className="mt-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
                                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                                    <p className="text-sm font-semibold text-slate-700">Password requirements</p>
                                </div>

                                <div className="space-y-2 p-4">
                                    <PasswordRule valid={passwordChecks.minLength} text="At least 8 characters" />
                                    <PasswordRule valid={passwordChecks.lowercase} text="At least one lowercase letter" />
                                    <PasswordRule valid={passwordChecks.uppercase} text="At least one uppercase letter" />
                                    <PasswordRule valid={passwordChecks.number} text="At least one number" />
                                    <PasswordRule valid={passwordChecks.symbol} text="At least one symbol" />
                                </div>

                                <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                        <LockKeyhole className="h-3.5 w-3.5" />
                                        <span>
                                            Status:{' '}
                                            <span
                                                className={`font-semibold ${
                                                    allPasswordChecksPassed ? 'text-emerald-600' : 'text-red-500'
                                                }`}
                                            >
                                                {allPasswordChecksPassed ? 'Strong enough to submit' : 'Incomplete'}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Confirm password"
                            className="h-12 rounded-xl border-gray-200 shadow-sm transition focus-visible:ring-2 focus-visible:ring-blue-500"
                        />

                        {data.password_confirmation.length > 0 && (
                            <div
                                className={`mt-1 flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium ${
                                    passwordsMatch
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                        : 'border-red-200 bg-red-50 text-red-600'
                                }`}
                            >
                                {passwordsMatch ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <X className="h-4 w-4" />
                                )}
                                {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                            </div>
                        )}

                        <InputError message={errors.password_confirmation} className="mt-1" />
                    </div>

                    <Button
                        type="submit"
                        className="mt-2 h-12 w-full cursor-pointer rounded-xl bg-blue-600 text-base font-semibold shadow-md transition hover:bg-blue-700"
                        tabIndex={5}
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Create account
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <TextLink href={route('login')} tabIndex={6}>
                        Log in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}