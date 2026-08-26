import React from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X, HelpCircle } from "lucide-react";

// ── Toast Types ──
export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "primary" | "success";
}

// ── Toast Context ──
interface ToastContextValue {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

// ── ToastProvider ──
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const [confirmState, setConfirmState] = React.useState<{
    options: ConfirmOptions;
    resolve: (val: boolean) => void;
  } | null>(null);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = React.useCallback(
    ({ type, title, message, duration = 3500 }: Omit<Toast, "id">) => {
      setToasts((prev) => {
        const isDuplicate = prev.some(
          (t) => t.type === type && t.title === title && t.message === message
        );
        if (isDuplicate) return prev;

        const id = `toast-${Date.now()}-${Math.random()}`;
        setTimeout(() => {
          setToasts((current) => current.filter((t) => t.id !== id));
        }, duration);

        return [...prev.slice(-4), { id, type, title, message, duration }];
      });
    },
    []
  );

  const success = React.useCallback(
    (title: string, message?: string) => showToast({ type: "success", title, message }),
    [showToast]
  );
  const error = React.useCallback(
    (title: string, message?: string) => showToast({ type: "error", title, message }),
    [showToast]
  );
  const warning = React.useCallback(
    (title: string, message?: string) => showToast({ type: "warning", title, message }),
    [showToast]
  );
  const info = React.useCallback(
    (title: string, message?: string) => showToast({ type: "info", title, message }),
    [showToast]
  );

  const confirm = React.useCallback((options: ConfirmOptions | string) => {
    const normalizedOptions: ConfirmOptions =
      typeof options === "string"
        ? { title: "확인", message: options }
        : options;

    return new Promise<boolean>((resolve) => {
      setConfirmState({ options: normalizedOptions, resolve });
    });
  }, []);

  const handleConfirmClose = (result: boolean) => {
    if (confirmState) {
      confirmState.resolve(result);
      setConfirmState(null);
    }
  };

  const contextValue = React.useMemo(
    () => ({ toasts, showToast, removeToast, success, error, warning, info, confirm }),
    [toasts, showToast, removeToast, success, error, warning, info, confirm]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      {confirmState && (
        <ConfirmDialog
          options={confirmState.options}
          onClose={handleConfirmClose}
        />
      )}
    </ToastContext.Provider>
  );
}

// ── useToast hook ──
export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

// ── Toast Item Component ──
interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
  key?: React.Key;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [leaving, setLeaving] = React.useState(false);

  const handleRemove = () => {
    setLeaving(true);
    setTimeout(() => onRemove(toast.id), 250);
  };

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />,
    error: <XCircle size={18} className="text-red-400 flex-shrink-0" />,
    warning: <AlertTriangle size={18} className="text-amber-400 flex-shrink-0" />,
    info: <Info size={18} className="text-sky-400 flex-shrink-0" />,
  };

  const borderColors: Record<ToastType, string> = {
    success: "border-emerald-500/40",
    error: "border-red-500/40",
    warning: "border-amber-500/40",
    info: "border-sky-500/40",
  };

  const glowColors: Record<ToastType, string> = {
    success: "shadow-emerald-900/30",
    error: "shadow-red-900/30",
    warning: "shadow-amber-900/30",
    info: "shadow-sky-900/30",
  };

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3 rounded-xl border
        bg-[#1a1d2e]/95 backdrop-blur-xl shadow-xl
        transition-all duration-250
        ${borderColors[toast.type]} ${glowColors[toast.type]}
        ${leaving ? "opacity-0 translate-x-full" : "opacity-100 translate-x-0"}
      `}
      style={{ animation: leaving ? undefined : "slideInFromRight 0.25s ease-out" }}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white leading-tight">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-white/60 mt-0.5 leading-snug">{toast.message}</p>
        )}
      </div>
      <button
        onClick={handleRemove}
        className="text-white/30 hover:text-white/70 transition-colors flex-shrink-0 cursor-pointer p-0.5"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ── Toast Container ──
function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: string) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 w-80 max-w-[calc(100vw-2rem)] pointer-events-auto"
      aria-live="polite"
      aria-label="알림"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

// ── Custom CSS Confirm Dialog (시스템 confirm 대체) ──
function ConfirmDialog({
  options,
  onClose,
}: {
  options: ConfirmOptions;
  onClose: (result: boolean) => void;
}) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(false);
      if (e.key === "Enter") onClose(true);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const isDanger = options.type === "danger";
  const isSuccess = options.type === "success";

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-[#0f172a]/95 border border-white/15 rounded-2xl p-6 shadow-2xl animate-scaleUp space-y-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              isDanger
                ? "bg-red-500/20 text-red-400 border-red-500/30"
                : isSuccess
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-amber-500/20 text-amber-400 border-amber-500/30"
            }`}
          >
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{options.title}</h3>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-white/80 leading-relaxed whitespace-pre-line">
          {options.message}
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => onClose(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
          >
            {options.cancelText || "취소"}
          </button>
          <button
            type="button"
            onClick={() => onClose(true)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
              isDanger
                ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-red-900/30"
                : isSuccess
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-900/30"
                : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-900/30"
            }`}
          >
            {options.confirmText || "확인"}
          </button>
        </div>
      </div>
    </div>
  );
}

