import React from 'react';

interface AlertDialogProps {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isOpen,
  setIsOpen,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            onClick={() => {
              setIsOpen(false);
              onCancel?.();
            }}
          >
            {cancelText}
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
            onClick={() => {
              setIsOpen(false);
              onConfirm?.();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertDialog;
