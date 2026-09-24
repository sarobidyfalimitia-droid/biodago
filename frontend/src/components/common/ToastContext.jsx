import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(null);

/**
 * Item : notifications visuelles après une action réussie ou en erreur — jusqu'ici
 * seuls certains formulaires donnaient un retour, la plupart des actions (création,
 * suppression, publication) restaient silencieuses.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback((message, type = 'success', duration = 4000) => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => remove(id), duration);
  }, [remove]);

  const value = {
    success: (msg, options) => push(msg, 'success', options?.duration ?? 4000),
    error: (msg, options) => push(msg, 'error', options?.duration ?? 4000),
    info: (msg, options) => push(msg, 'info', options?.duration ?? 4000),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium shadow-lg ${
              t.type === 'success' ? 'bg-forest-800 text-parchment-50'
              : t.type === 'error' ? 'bg-red-600 text-white'
              : 'bg-earth-800 text-parchment-50'
            }`}
          >
            <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}</span>
            {t.message}
            <button onClick={() => remove(t.id)} className="ml-2 opacity-70 hover:opacity-100">×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast doit être utilisé dans <ToastProvider>');
  return ctx;
}
