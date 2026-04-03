import { I } from "@/utils/consitants/consitaint";
import { useRef, useState } from "react";

type ToastType = "success" | "error" | "info" | "loading";
interface Toast { id: number; msg: string; type: ToastType; }

export const ToastContainer = ({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) => (
  <div className="fixed top-4 right-4 z-[99999] flex flex-col gap-2 pointer-events-none">
    {toasts.map(t => (
      <div key={t.id} onClick={() => onDismiss(t.id)}
        className={`flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl text-sm font-medium pointer-events-auto cursor-pointer
          transition-all duration-300 max-w-xs
          ${t.type === "success" ? "bg-emerald-600 text-white" :
            t.type === "error" ? "bg-red-600 text-white" :
            t.type === "loading" ? "bg-blue-600 text-white" :
            "bg-gray-800 text-white"}`}>
        {t.type === "loading" ? <I.Spinner/> :
         t.type === "success" ? <I.Check/> :
         t.type === "error" ? <I.Warn/> : <span>ℹ️</span>}
        {t.msg}
      </div>
    ))}
  </div>
);

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  let nextId = useRef(0);
  const add = (msg: string, type: ToastType = "info", duration = 3000) => {
    const id = ++nextId.current;
    setToasts(p => [...p, { id, msg, type }]);
    if (type !== "loading") setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), duration);
    return id;
  };
  const dismiss = (id: number) => setToasts(p => p.filter(t => t.id !== id));
  const update = (id: number, msg: string, type: ToastType) => {
    setToasts(p => p.map(t => t.id === id ? { ...t, msg, type } : t));
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  };
  return { toasts, add, dismiss, update };
};

