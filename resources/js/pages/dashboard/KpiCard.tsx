'use client';

import React from 'react';

type Props = {
    title: string;
    value: number;
    color?: string;
    icon?: React.ReactNode;
    footer?: string | React.ReactNode;
};

export default function KpiCard({ title, value, color, icon, footer }: Props) {
    return (
        <div className="flex transform flex-col justify-between rounded-2xl border bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm transition hover:scale-105 hover:border-gray-200 hover:shadow-lg">
            {/* Header with value + icon */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className={`text-3xl font-extrabold tracking-tight ${color ?? 'text-neutral-900 dark:text-neutral-100'}`}>
                        {value.toLocaleString()}
                    </p>
                </div>

                {/* ✅ Icon without circle background */}
                {icon && <div className={`text-2xl ${color ?? 'text-neutral-500'}`}>{icon}</div>}
            </div>

            {/* ✅ Footer connected with border-top */}
            {footer && <div className="mt-4 border-t pt-2 text-xs text-muted-foreground">{footer}</div>}
        </div>
    );
}
