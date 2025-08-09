import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type Size = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

const SIZE_MAP: Record<Size, string> = {
    sm:  'w-[min(520px,95vw)] sm:max-w-[520px]',
    md:  'w-[min(720px,95vw)] sm:max-w-[720px]',
    lg:  'w-[min(900px,95vw)] sm:max-w-[900px]',
    xl:  'w-[min(1100px,95vw)] sm:max-w-[1100px]',
    '2xl':'w-[min(1280px,95vw)] sm:max-w-[1280px]',
    full:'w-[95vw] max-w-none',
};

export type ViewModalProps = {
    open: boolean;
    onClose: () => void;
    size?: Size;
    contentClassName?: string;
    children: React.ReactNode;
};

export default function ViewModal({ 
    open, 
    onClose, 
    size = 'xl', 
    contentClassName, 
    children 
}: ViewModalProps) {
    return (
        <Dialog 
            open={open} 
            onOpenChange={
                (o) => !o && onClose()
            }
        >
            <DialogContent
                className={cn(
                    'max-w-none overflow-hidden p-0 print:!w-full print:!max-w-none print:!overflow-visible print:!rounded-none print:!border-0 print:!p-0 print:!shadow-none',
                    SIZE_MAP[size],
                )}
            >
                <div className={cn('print-force-light bg-white p-8 text-gray-900 dark:bg-neutral-950 dark:text-gray-100', contentClassName)}>
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    );
}