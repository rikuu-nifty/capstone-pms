import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Mail, RefreshCcw, ShieldCheck, Loader2 } from 'lucide-react';

type Props = { email: string; resendCooldownSec: number };

export default function VerifyEmailOtp({ email, resendCooldownSec }: Props) {
  const { data, setData, post, processing, errors, reset } = useForm<{ code: string }>({ code: '' });
  const [cooldown, setCooldown] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const maskedEmail = useMemo(() => {
    const [user, domain] = email.split('@');
    if (!domain) return email;
    const shown = user.length <= 3 ? user[0] ?? '' : user.slice(0, 3);
    return `${shown}${user.length > 3 ? '***' : ''}@${domain}`;
  }, [email]);

  useEffect(() => {
    containerRef.current?.querySelector<HTMLInputElement>('input')?.focus();
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (processing || data.code.trim().length !== 6) return;
    post(route('otp.verify'), {
      preserveScroll: true,
      onSuccess: () => reset('code'),
    });
  };

  const resend = () => {
    if (cooldown > 0 || processing) return;
    router.post(route('otp.resend'), {}, {
      preserveScroll: true,
      onSuccess: () => setCooldown(resendCooldownSec),
    });
  };

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const canSubmit = data.code.length === 6 && !processing;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center p-6">
      <Head title="Verify Email" />
      <Card ref={containerRef} className="w-full max-w-md shadow-md">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs uppercase tracking-wide">Security Check</span>
          </div>
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <CardDescription className="text-sm">
            We sent a 6-digit code to{' '}
            <span className="font-medium inline-flex items-center gap-1">
              <Mail className="h-4 w-4" /> {maskedEmail}
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={submit} className="space-y-6" aria-label="Enter verification code">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-center">Verification Code</label>

              {/* Center the OTP group */}
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={data.code}
                  onChange={(v: string) => setData('code', v.replace(/\D/g, '').slice(0, 6))}
                >
                  <InputOTPGroup className="gap-2">
                    {/* bigger, nicer slots */}
                    <InputOTPSlot index={0} className="h-12 w-12 rounded-xl text-xl" />
                    <InputOTPSlot index={1} className="h-12 w-12 rounded-xl text-xl" />
                    <InputOTPSlot index={2} className="h-12 w-12 rounded-xl text-xl" />
                    <InputOTPSlot index={3} className="h-12 w-12 rounded-xl text-xl" />
                    <InputOTPSlot index={4} className="h-12 w-12 rounded-xl text-xl" />
                    <InputOTPSlot index={5} className="h-12 w-12 rounded-xl text-xl" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {errors.code && (
                <p className="mt-1 text-xs text-red-500 text-center" role="alert" aria-live="polite">
                  {errors.code}
                </p>
              )}

              <p className="text-[12px] text-muted-foreground text-center">
                Tip: you can paste the entire 6-digit code.
              </p>
            </div>

            <Button type="submit" disabled={!canSubmit} className="w-full">
              {processing ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
                </span>
              ) : (
                'Verify'
              )}
            </Button>
          </form>

          <Separator />

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {cooldown > 0 ? `You can resend in ${cooldown}s` : 'Didn’t get the code?'}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resend}
              disabled={cooldown > 0 || processing}
              className="inline-flex items-center gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Resend
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
