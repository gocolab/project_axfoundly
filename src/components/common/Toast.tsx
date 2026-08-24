import React from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

// ── Toast Types ──
export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
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
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

// ── ToastProvider ──
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = React.useCallback(
    ({ type, title, message, duration = 3500 }: Omit<Toast, "id">) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev.slice(-4), { id, type, title, message, duration }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
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

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
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
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
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
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 w-80 max-w-[calc(100vw-2rem)]"
      aria-live="polite"
      aria-label="알림"
    >
      {toasts.map((t) => {
        const item = <ToastItem toast={t} onRemove={onRemove} />;
        return <React.Fragment key={t.id}>{item}</React.Fragment>;
      })}
    </div>
  );
}
