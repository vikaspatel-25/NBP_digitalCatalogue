import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Clock 
} from 'lucide-react';

const ToastContext = createContext(null);

// Default timer is 3 seconds as requested across the entire project, with interactive cross dismiss
const DEFAULT_DURATION_MS = 3000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const addToast = useCallback(({ 
    type = 'info', 
    title = '', 
    message = '', 
    duration = DEFAULT_DURATION_MS 
  }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    const newToast = {
      id,
      type,
      title: title || (
        type === 'error' ? 'Validation / Submission Error' :
        type === 'success' ? 'Success' :
        type === 'warning' ? 'Attention Needed' : 'Notification'
      ),
      message,
      duration: typeof duration === 'number' ? duration : DEFAULT_DURATION_MS,
      createdAt: Date.now()
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const toast = {
    error: (msg, opts = {}) => addToast({ type: 'error', message: msg, ...opts }),
    success: (msg, opts = {}) => addToast({ type: 'success', message: msg, ...opts }),
    warning: (msg, opts = {}) => addToast({ type: 'warning', message: msg, ...opts }),
    info: (msg, opts = {}) => addToast({ type: 'info', message: msg, ...opts }),
    dismiss: removeToast,
    clearAll
  };

  return (
    <ToastContext.Provider value={{ toast, removeToast, clearAll }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}

/**
 * Toast Container rendered at the top-right viewport level with high z-index.
 */
function ToastContainer({ toasts, onRemove }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div 
      aria-live="assertive"
      className="fixed top-4 right-4 z-[999999] flex flex-col gap-3 max-w-md w-[calc(100vw-2rem)] sm:w-[430px] pointer-events-none"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={() => onRemove(t.id)} />
      ))}
    </div>
  );
}

/**
 * Individual Toast Item with real-time countdown progress bar, pause-on-hover,
 * seconds counter, and manual cross ("X") dismiss button.
 */
function ToastItem({ toast, onRemove }) {
  const { id, type, title, message, duration } = toast;
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef(null);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const interval = 100; // 100ms precision for silky smooth progress bar
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= interval) {
          clearInterval(timerRef.current);
          onRemove();
          return 0;
        }
        return prev - interval;
      });
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, onRemove, duration]);

  // Calculate percentage of timer remaining
  const progressPercent = Math.max(0, Math.min(100, (timeLeft / duration) * 100));
  const secondsRemaining = Math.max(1, Math.ceil(timeLeft / 1000));

  // Visual style variants
  const variantStyles = {
    error: {
      card: 'bg-white/95 dark:bg-slate-900 border-rose-300 dark:border-rose-800 text-slate-800 dark:text-slate-100 shadow-rose-500/15 ring-1 ring-rose-500/10',
      iconBg: 'bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400',
      progressBar: 'bg-rose-500 dark:bg-rose-400',
      timerBadge: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900',
      title: 'text-rose-900 dark:text-rose-200',
      Icon: AlertCircle
    },
    success: {
      card: 'bg-white/95 dark:bg-slate-900 border-emerald-300 dark:border-emerald-800 text-slate-800 dark:text-slate-100 shadow-emerald-500/15 ring-1 ring-emerald-500/10',
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400',
      progressBar: 'bg-emerald-500 dark:bg-emerald-400',
      timerBadge: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
      title: 'text-emerald-900 dark:text-emerald-200',
      Icon: CheckCircle2
    },
    warning: {
      card: 'bg-white/95 dark:bg-slate-900 border-amber-300 dark:border-amber-800 text-slate-800 dark:text-slate-100 shadow-amber-500/15 ring-1 ring-amber-500/10',
      iconBg: 'bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400',
      progressBar: 'bg-amber-500 dark:bg-amber-400',
      timerBadge: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900',
      title: 'text-amber-900 dark:text-amber-200',
      Icon: AlertTriangle
    },
    info: {
      card: 'bg-white/95 dark:bg-slate-900 border-blue-300 dark:border-blue-800 text-slate-800 dark:text-slate-100 shadow-blue-500/15 ring-1 ring-blue-500/10',
      iconBg: 'bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400',
      progressBar: 'bg-blue-500 dark:bg-blue-400',
      timerBadge: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900',
      title: 'text-blue-900 dark:text-blue-200',
      Icon: Info
    }
  };

  const style = variantStyles[type] || variantStyles.info;
  const IconComponent = style.Icon;

  return (
    <div
      role="alert"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-3 ${style.card}`}
    >
      <div className="p-4 sm:p-4.5 flex items-start gap-3.5">
        {/* Type Icon */}
        <div className={`p-2 rounded-xl shrink-0 ${style.iconBg}`}>
          <IconComponent className="w-5 h-5" />
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className={`text-sm font-semibold leading-tight truncate ${style.title}`}>
              {title}
            </h4>
            
            {/* Countdown Badge & Pause Indicator */}
            <span 
              title={isPaused ? "Timer paused while hovering" : `Auto-dismisses in ${secondsRemaining}s`}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border shrink-0 transition-colors ${style.timerBadge}`}
            >
              <Clock className="w-3 h-3 opacity-70" />
              {isPaused ? 'Paused' : `${secondsRemaining}s`}
            </span>
          </div>

          <p className="text-xs sm:text-[13px] leading-relaxed text-slate-600 dark:text-slate-300 font-normal break-words whitespace-pre-line">
            {message}
          </p>
        </div>

        {/* Cross / Close Button */}
        <button
          type="button"
          onClick={onRemove}
          title="Dismiss notification"
          aria-label="Close notification"
          className="shrink-0 p-1.5 -mr-1 -mt-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar Timer along bottom edge */}
      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800/80 overflow-hidden">
        <div 
          className={`h-full transition-all duration-100 ease-linear ${style.progressBar}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}

export default ToastProvider;
