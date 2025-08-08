import React from 'react';
import { Button } from '@/components/ui/button';

interface EditModalProps {
    show: boolean;
    onClose: () => void;
    title: string;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    processing?: boolean;
    children: React.ReactNode;
}

const EditModal: React.FC<EditModalProps> = ({ show, onClose, title, onSubmit, processing, children }) => {
    return (
        <div className={`fixed inset-0 z-50 flex transition-all duration-300 ease-in-out ${show ? 'visible' : 'invisible'}`}>
            <div
                className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            >
            </div>

            <div
                className={`relative ml-auto w-full max-w-3xl transform bg-white shadow-xl transition-transform duration-300 ease-in-out dark:bg-zinc-900 ${
                    show ? 'translate-x-0' : 'translate-x-full'
                }`}
                style={{ display: 'flex', flexDirection: 'column' }}
            >
                <div className="mb-4 flex items-center justify-between p-6">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <button 
                        onClick={onClose} 
                        className="cursor-pointer text-2xl font-medium">
                        &times;
                    </button>
                </div>

                <div className="auto overflow-y-auto px-6" style={{ flex: 1 }}>
                    <form onSubmit={onSubmit} className="grid grid-cols-2 gap-x-6 gap-y-4 pb-6 text-sm">
                        {children}

                        <div className="col-span-2 flex justify-end gap-2 border-t border-muted pt-4">
                            <Button 
                                variant="outline" 
                                onClick={onClose} 
                                type="button"
                                className="cursor-pointer"
                            >
                                Cancel
                            </Button>
                            
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className="cursor-pointer"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditModal;
