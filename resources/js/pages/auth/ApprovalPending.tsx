import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

export default function ApprovalPending({ message }: { message?: string }) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Approval Pending', href: '/approval-pending' }]}>
            <Head title="Approval Pending" />

            <div className="flex min-h-[70vh] items-center justify-center p-4">
                <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
                    {/* Icon */}
                    <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                        <Clock className="h-6 w-6" />
                    </div>

                    <h1 className="text-2xl font-semibold tracking-tight">Approval Pending</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {message ?? 'Your account is awaiting admin approval.'}
                    </p>

                    <div className="mt-6 flex items-center justify-center gap-2">
                        <Button asChild>
                            <Link href="/">Go to Home</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={route('logout')} method="post" as="button">
                                Log out
                            </Link>
                        </Button>
                    </div>

                    <p className="mt-4 text-xs text-muted-foreground">
                        We’ll notify you once an administrator approves your account.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
