import { Button } from '@/components/ui/button'; // ✅ import button
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

type ReportCardProps = {
    title: string;
    description: string;
    href: string;
    icon: ReactNode;
    chart?: ReactNode; // chart preview (optional)
    footer?: ReactNode; // ✅ flexible footer content
};

export function ReportCard({ title, description, href, icon, chart, footer }: ReportCardProps) {
    return (
        <Card className="flex flex-col rounded-2xl shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-gray-100 p-2 text-gray-700">{icon}</span>
                    <CardTitle className="text-base font-semibold">{title}</CardTitle>
                </div>

                <Button size="sm" variant="outline" asChild>
                    <Link href={href}>View</Link>
                </Button>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col justify-between">
                <div className="w-full">
                    {chart ?? <div className="rounded-lg bg-gray-50 p-6 text-center text-sm text-gray-400">Data Visualization Charts</div>}
                </div>

                {description && <p className="mt-4 text-center text-sm text-muted-foreground">{description}</p>}
            </CardContent>

            {footer && <CardFooter className="flex h-8 items-end justify-center border-t px-4">{footer}</CardFooter>}
        </Card>
    );
}
