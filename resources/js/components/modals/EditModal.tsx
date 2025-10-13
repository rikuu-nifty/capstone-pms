import React from 'react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface EditModalProps {
    show: boolean;
    onClose: () => void;
    title: string;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    processing?: boolean;
    children: React.ReactNode;
    contentClassName?: string; // optional
}

const EditModal: React.FC<EditModalProps> = ({
    show,
    onClose,
    title,
    onSubmit,
    processing,
    children,
    contentClassName,
}) => {
    // return (
    //     <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
    //         <DialogContent
    //             aria-describedby={undefined}
    //             // className={`w-full max-w-[700px] sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-6 ${contentClassName ?? ''}`}
    //             className={`w-full max-w-[700px] sm:max-w-[800px] max-h-[90vh] flex flex-col p-6 ${contentClassName ?? ''}`}
    //         >
    //             <DialogHeader>
    //                 <DialogTitle>{title}</DialogTitle>
    //             </DialogHeader>

    //             {/* Scrollable form area */}
    //             <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4 py-4 text-sm">
    //                 {children}

    //                 <DialogFooter className="col-span-2 sticky bottom-0 bg-white dark:bg-neutral-900 pt-4 border-t">
    //                     <DialogClose asChild>
    //                         <Button
    //                             variant="destructive"
    //                             type="button"
    //                             onClick={onClose}
    //                             className="cursor-pointer"
    //                         >
    //                             Cancel
    //                         </Button>
    //                     </DialogClose>
    //                     <Button type="submit" disabled={processing} className="cursor-pointer">
    //                         Save Changes
    //                     </Button>
    //                 </DialogFooter>
    //             </form>
    //         </DialogContent>
    //     </Dialog>
    // );

    return (
        <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                aria-describedby={undefined}
                // ✅ use flex-col so header, body, and footer stack vertically
                className={`w-full max-w-[700px] sm:max-w-[800px] max-h-[90vh] flex flex-col p-6 ${contentClassName ?? ''}`}
            >
                {/* Header (fixed height, top) */}
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                {/* ✅ Scrollable form container — this section can scroll */}
                <div className="flex-1 overflow-y-auto py-4">
                    <form
                        onSubmit={onSubmit}
                        id="edit-form"
                        className="grid grid-cols-2 gap-4 text-sm"
                    >
                        {children}
                    </form>
                </div>

                {/* ✅ Footer always stays at bottom (not sticky, naturally sits below scrollable content) */}
                {/* ⬇️ Using shrink-0 ensures it never collapses or scrolls out of view */}
                <DialogFooter className="shrink-0 mt-4 border-t pt-4 bg-white dark:bg-neutral-900">
                    <DialogClose asChild>
                        <Button
                            variant="destructive"
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer"
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                    {/* ✅ The form="edit-form" ensures the submit button triggers the above form */}
                    <Button
                        type="submit"
                        form="edit-form"
                        disabled={processing}
                        className="cursor-pointer"
                    >
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditModal;
