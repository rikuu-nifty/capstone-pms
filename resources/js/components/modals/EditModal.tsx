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
    contentClassName?: string;
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
    return (
        <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
            <DialogContent 
                // className="w-full max-w-[700px] p-6 sm:max-w-[800px] max-h-[90vh] overflow-y-auto"
                aria-describedby={undefined}
                className={`w-full max-w-[700px] sm:max-w-[800px] p-6 ${contentClassName ?? ''}`}
            >
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4 py-4 text-sm">
                    {children}

                    <DialogFooter className="col-span-2">
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
                        <Button type="submit" disabled={processing} className="cursor-pointer">
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditModal;