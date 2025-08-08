import React from 'react';

interface DeleteConfirmationModalProps {
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  show,
  onConfirm,
  onCancel,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to delete this transfer?',
}) => {
  if (!show) return null;

  return (
        <div 
            className="fixed inset-0 flex items-center justify-center"
            style={{ 
                backdropFilter: 'blur(1px)',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
            }}
        >
            <div 
                className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full text-center">
                <h2 className="text-lg font-bold mb-4">{title}</h2>
                <p className="mb-6 text-sm text-gray-600">{message}</p>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={onConfirm}
                        className="cursor-pointer bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm font-medium"
                    >
                        Yes, Delete
                    </button>
                    <button
                        onClick={onCancel}
                        className="cursor-pointer bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 text-sm font-medium"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;