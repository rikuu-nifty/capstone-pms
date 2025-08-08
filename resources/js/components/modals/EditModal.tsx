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
}

const EditModal: React.FC<EditModalProps> = ({
    show,
    onClose,
    title,
    onSubmit,
    processing,
    children,
}) => {
    return (
        <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
            <form onSubmit={onSubmit}>
                <DialogContent className="w-full max-w-[700px] p-6 sm:max-w-[800px]">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 py-4 text-sm">
                        {children}
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button 
                                variant="destructive" 
                                type="button" 
                                onClick={onClose}
                                className='cursor-pointer'
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button 
                            type="submit"
                            disabled={processing}
                            className='cursor-pointer'
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
};

export default EditModal;