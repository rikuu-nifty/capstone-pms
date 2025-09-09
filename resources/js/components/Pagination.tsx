import * as React from 'react';

export type PaginationProps = {
    page: number;
    total: number;         
    pageSize: number;
    onPageChange: (p: number) => void;

    /** Optional tweaks */
    windowSize?: number;   // how many numbered buttons to show (default 5)
    showFirstLast?: boolean; // show « and » (default true)
    className?: string;
    disabled?: boolean;    // disable all controls (optional)
};

export default function Pagination({
    page,
    total,
    pageSize,
    onPageChange,
    windowSize = 5,
    showFirstLast = true,
    className,
    disabled = false,
}: PaginationProps) {

    const effectivePageSize = Math.min(pageSize, 10);
      const totalPages = Math.max(1, Math.ceil(total / effectivePageSize));
    if (totalPages <= 1) return null;

   

    const go = (p: number) => {
        if (disabled) return;
        onPageChange(Math.min(totalPages, Math.max(1, p)));
    };

    const half = Math.floor(windowSize / 2);
    let start = Math.max(1, page - half);
    const end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);

    const nums: number[] = [];
    for (let i = start; i <= end; i++) nums.push(i);

    const Btn = ({
        children,
        isActive,
        title,
        onClick,
        disabledBtn,
    }: {
        children: React.ReactNode;
        isActive?: boolean;
        title?: string;
        onClick?: () => void;
        disabledBtn?: boolean;
    }) => (
        <button
            type="button"
            title={title}
            disabled={disabled || disabledBtn}
            onClick={onClick}
            className={[
                'px-3 py-1 rounded-md text-sm border transition-colors',
                isActive
                ? 'bg-[#155dfc] text-white border-[#155dfc]' // 🔵 custom blue
                : 'bg-background hover:bg-muted border-input',
                (disabled || disabledBtn) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            ].join(' ')}
            aria-current={isActive ? 'page' : undefined}
        >
            {children}
        </button>
    );

    return (
        <nav
            className={['flex items-center gap-2', className ?? ''].join(' ')}
            role="navigation"
            aria-label="Pagination"
        >
        {showFirstLast && (
            <Btn title="First page" disabledBtn={page === 1} onClick={() => go(1)}>
            «
            </Btn>
        )}
        <Btn title="Previous page" disabledBtn={page === 1} onClick={() => go(page - 1)}>
            ‹
        </Btn>

        {start > 1 && (
            <>
            <Btn onClick={() => go(1)}>1</Btn>
            {start > 2 && <span className="px-1 select-none">…</span>}
            </>
        )}

        {nums.map((n) => (
            <Btn key={n} isActive={n === page} onClick={() => go(n)}>
            {n}
            </Btn>
        ))}

        {end < totalPages && (
            <>
            {end < totalPages - 1 && <span className="px-1 select-none">…</span>}
            <Btn onClick={() => go(totalPages)}>{totalPages}</Btn>
            </>
        )}

        <Btn title="Next page" disabledBtn={page === totalPages} onClick={() => go(page + 1)}>
            ›
        </Btn>
        {showFirstLast && (
            <Btn title="Last page" disabledBtn={page === totalPages} onClick={() => go(totalPages)}>
            »
            </Btn>
        )}
        </nav>
    );
}

/** Optional helper for the "Showing X–Y of Z" text */
export function PageInfo({
    page,
    total,
    pageSize,
    className,
    label = 'records',
}: {
    page: number;
    total: number;
    pageSize: number;
    className?: string;
    label?: string;
}) {
    const effectivePageSize = Math.min(pageSize, 10); // ✅ cap at 10
    const start = total ? (page - 1) * effectivePageSize + 1 : 0;
    const end = Math.min(page * effectivePageSize, total);
    return (
        <div className={['text-xs text-muted-foreground', className ?? ''].join(' ')}>
            Showing {start} – {end} of <strong>{total}</strong> {label}
        </div>
    );
}