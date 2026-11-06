import {useCallback, useEffect, useRef} from "react";

function token(name: string) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value.endsWith("ms") ? parseFloat(value) : parseFloat(value) * 1000;
}

// Durations come from tokens.css, the single source of truth. Client only.
export function motion() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduced";
    const duration = (name: string) => reduced ? 0 : token(name);
    return {
        pop: duration("--duration-pop"),
        toss: duration("--duration-toss"),
        step: duration("--duration-step"),
        fly: duration("--duration-fly"),
        land: duration("--duration-land"),
        // The second ring of the shockwave starts late and lasts longer.
        fx: duration("--duration-fx") + 2 * duration("--duration-step"),
        bump: duration("--duration-bump"),
        intro: duration("--duration-intro"),
    };
}

// The "reduced animations" setting, on <html>: the CSS and motion() read it.
export function applyReducedMotion(reduced: boolean) {
    if (reduced)
        document.documentElement.dataset.motion = "reduced";
    else
        delete document.documentElement.dataset.motion;
}

// After unmount a wait never resolves, so an awaiting sequence simply stops there.
// A flag rather than clearTimeout: StrictMode's fake unmount must not kill a wait started just after mounting.
export function useWait() {
    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    return useCallback((duration: number) => new Promise<void>(resolve => {
        setTimeout(() => {
            if (mounted.current)
                resolve();
        }, duration);
    }), []);
}
