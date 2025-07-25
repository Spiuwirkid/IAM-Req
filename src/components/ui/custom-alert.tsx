import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, CheckCircle, Info, XCircle, Trash2 } from 'lucide-react';

interface CustomAlertProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'delete';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

export const CustomAlert = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false
}: CustomAlertProps) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-amber-500" />;
      case 'delete':
        return <Trash2 className="w-6 h-6 text-red-500" />;
      default:
        return <Info className="w-6 h-6 text-blue-500" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          button: 'bg-green-600 hover:bg-green-700 text-white'
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          button: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 border-amber-200',
          button: 'bg-amber-600 hover:bg-amber-700 text-white'
        };
      case 'delete':
        return {
          bg: 'bg-red-50 border-red-200',
          button: 'bg-red-600 hover:bg-red-700 text-white'
        };
      default:
        return {
          bg: 'bg-blue-50 border-blue-200',
          button: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
    }
  };

  const colors = getColors();

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className={`max-w-md ${colors.bg} border-2`}>
        <AlertDialogHeader>
          <div className="flex items-center space-x-3">
            {getIcon()}
            <AlertDialogTitle className="text-lg font-semibold text-gray-900">
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-gray-700 text-sm leading-relaxed mt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex space-x-2 mt-6">
          {showCancel && (
            <AlertDialogCancel 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md transition-colors"
            >
              {cancelText}
            </AlertDialogCancel>
          )}
          <AlertDialogAction 
            onClick={() => {
              onConfirm && onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-md transition-colors ${colors.button}`}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Hook untuk easy usage
export const useCustomAlert = () => {
  const [alert, setAlert] = useState<Omit<CustomAlertProps, 'isOpen' | 'onClose'> | null>(null);

  const showAlert = (alertConfig: Omit<CustomAlertProps, 'isOpen' | 'onClose'>) => {
    setAlert(alertConfig);
  };

  const closeAlert = () => {
    setAlert(null);
  };

  const AlertComponent = alert ? (
    <CustomAlert
      {...alert}
      isOpen={!!alert}
      onClose={closeAlert}
    />
  ) : null;

  return {
    showAlert,
    closeAlert,
    AlertComponent
  };
};

// Utility functions for common alerts
export const showSuccessAlert = (title: string, description: string, onConfirm?: () => void) => ({
  title,
  description,
  type: 'success' as const,
  confirmText: 'Great!',
  onConfirm
});

export const showErrorAlert = (title: string, description: string, onConfirm?: () => void) => ({
  title,
  description,
  type: 'error' as const,
  confirmText: 'Try Again',
  onConfirm
});

export const showDeleteConfirm = (title: string, description: string, onConfirm: () => void) => ({
  title,
  description,
  type: 'delete' as const,
  confirmText: 'Delete',
  cancelText: 'Cancel',
  showCancel: true,
  onConfirm
});

export const showWarningAlert = (title: string, description: string, onConfirm?: () => void) => ({
  title,
  description,
  type: 'warning' as const,
  confirmText: 'Understood',
  onConfirm
}); 