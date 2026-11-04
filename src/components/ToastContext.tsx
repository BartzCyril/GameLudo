'use client'

import {
    ComponentProps,
    createContext,
    PropsWithChildren,
    useCallback,
    useContext,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import { Toast } from "./Toast";
import { AnimatePresence, motion } from "framer-motion";

type Params = ComponentProps<typeof Toast> & { duration?: number };
type ToastItem = ComponentProps<typeof Toast> & {
    id: number;
    timer: ReturnType<typeof setTimeout>;
};

const defaultPush = (toast: Params) => {};

const defaultValue = {
    pushToastRef: { current: defaultPush },
};

const ToastContext = createContext(defaultValue);

export function ToastContextProvider({ children }: PropsWithChildren) {
    const pushToastRef = useRef(defaultPush);
    return (
        <ToastContext.Provider value={{ pushToastRef }}>
            <Toasts />
            {children}
        </ToastContext.Provider>
    );
}

export function useToasts() {
    const { pushToastRef } = useContext(ToastContext);
    return {
        pushToast: useCallback(
            (toast: Params) => {
                pushToastRef.current(toast);
            },
            [pushToastRef]
        ),
    };
}

export function Toasts() {
    const [toasts, setToasts] = useState([] as ToastItem[]);
    const { pushToastRef } = useContext(ToastContext);
    const nextId = useRef(0);
    // Layout effect: must be set before the useEffect of any component that pushes a toast on mount.
    useLayoutEffect(() => {
        pushToastRef.current = ({ duration, ...props }: Params) => {
            const id = nextId.current++;
            const timer = setTimeout(() => {
                setToasts((v) => v.filter((t) => t.id !== id));
            }, (duration ?? 5) * 1000);
            const toast = { ...props, id, timer };
            setToasts((v) => [...v, toast as ToastItem]);
        };
    }, [pushToastRef]);

    const onRemove = (toast: ToastItem) => {
        clearTimeout(toast.timer);
        setToasts((v) => v.filter((t) => t !== toast));
    };
    return (
        <div className="toast-container">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        onClick={() => onRemove(toast)}
                        key={toast.id}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                    >
                        <Toast {...toast} />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
