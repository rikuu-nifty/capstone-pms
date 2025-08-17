import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

type Props = {
    label: string;
    value: React.ReactNode;
    icon: LucideIcon;
    /** Tailwind class for the top accent bar, e.g. 'bg-orange-400' */
    barColor?: string;
    className?: string;
};

export default function KPIStatCard({
    label,
    value,
    icon: Icon,
    barColor = 'bg-orange-400',
    className,
}: Props) {
    return (
        <div
        className={cn(
            // container
            'relative overflow-hidden rounded-2xl border shadow-sm',
            'bg-[#3a416f] dark:bg-[#2f365f]',
            'border-white/10',
            className
        )}
        >
        {/* Top accent bar */}
        <div className={cn('h-1.5 w-full', barColor)} />

            {/* Content */}
            <div className="flex items-center gap-3 h-full p-6">
                {/* Icon bubble */}
                <div className="rounded-full p-3 bg-white/10 flex items-center justify-center">
                    <Icon className="h-8 w-8 text-white/90" />
                </div>

                {/* Texts */}
                <div className="flex flex-col justify-center">
                    <div className="text-sm text-white/80">{label}</div>
                    <div className="mt-2 text-2xl font-semibold leading-none tracking-tight text-white">
                        {value}
                    </div>
                </div>
            </div>

        </div>
    );
}
