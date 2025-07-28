import { createContext, useContext, useState, useCallback } from "react";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((t) => {
    const id = crypto.randomUUID();
    setToasts((arr) => [...arr, { id, ...t }]);
    
    setTimeout(() => {
      setToasts((arr) => arr.filter((x) => x.id !== id));
    }, t.duration ?? 3500);
  }, []);

  const value = {
    success: (msg) => push({ type: "success", msg }),
    error:   (msg) => push({ type: "error",   msg, duration: 5000 }),
    info:    (msg, opts) => push({ type: "info", msg, ...opts }),
  };

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

function ToastContainer({ toasts }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} />
      ))}
    </div>
  );
}

function Toast({ type, msg, actionLabel, onAction, id }) {
  const base =
    "min-w-64 max-w-sm rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur";
  const styles = {
    success: "bg-green-500/10 border-green-500/30 text-green-200",
    error:   "bg-red-500/10 border-red-500/30 text-red-200",
    info:    "bg-zinc-700/40 border-zinc-600 text-zinc-100",
  }[type] || styles?.info;

  return (
    <div className={`${base} ${styles} flex items-center gap-4`}>
      <span className="flex-1">{msg}</span>
      {actionLabel && onAction && (
        <button
          className="text-xs underline hover:no-underline"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
