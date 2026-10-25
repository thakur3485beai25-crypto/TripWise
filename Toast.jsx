import { useApp } from "../context/AppContext";

export default function Toast() {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  const getDefaultIcon = (type) => {
    switch (type) {
      case "warning":
        return "⚠️";
      case "error":
        return "✕";
      case "info":
        return "ℹ️";
      case "success":
      default:
        return "✨";
    }
  };

  return (
    <div className="toastContainer" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toastItem toast-${toast.type || "success"}`}
        >
          <span className="toastIcon" aria-hidden="true">
            {toast.icon || getDefaultIcon(toast.type)}
          </span>
          <span className="toastMessage">{toast.message}</span>
          <button
            type="button"
            className="toastCloseBtn"
            onClick={() => removeToast(toast.id)}
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
