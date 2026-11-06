'use client'

import {useEffect} from "react";
import {loadSettings, SETTINGS_KEY} from "@/game/settings";
import {applyReducedMotion} from "@/game/ui/motion";

// Applies the "reduced animations" setting on every page, and follows a change made in another tab.
export function MotionPreference() {
    useEffect(() => {
        applyReducedMotion(loadSettings().reducedMotion);
        const onStorage = (event: StorageEvent) => {
            if (event.key === SETTINGS_KEY || event.key === null)
                applyReducedMotion(loadSettings().reducedMotion);
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);
    return null;
}
