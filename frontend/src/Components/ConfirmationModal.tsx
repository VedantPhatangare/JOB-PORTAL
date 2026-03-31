import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning",
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const variantStyles = {
    danger: {
      icon: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
      button: "bg-red-600 hover:bg-red-700 text-white disabled:bg-red-400",
    },
    warning: {
      icon: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
      button: "bg-amber-600 hover:bg-amber-700 text-white disabled:bg-amber-400",
    },
    info: {
      icon: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      button: "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400",
    },
  };

  const styles = variantStyles[variant];
  const buttonClass = isDangerous ? variantStyles.danger.button : styles.button;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
          >
            <div className={`${styles.bg} border ${styles.border} rounded-2xl shadow-xl overflow-hidden`}>
              {/* Header */}
              <div className="flex items-start justify-between p-6 border-b border-inherit">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${styles.bg} flex-shrink-0`}>
                    <AlertCircle className={`${styles.icon} w-6 h-6`} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                  </div>
                </div>
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 bg-gray-50/50 border-t border-inherit">
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:cursor-not-allowed ${buttonClass}`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>{confirmText}</span>
                    </div>
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
