'use client'

import {useLayoutEffect, useSyncExternalStore} from "react";
import {MoonIcon} from "@/components/Icons";
import {applyTheme, followDevice, setTheme} from "@/game/ui/theme";
import {useI18n} from "@/i18n/I18nProvider";

// data-theme on <html> is the single source of truth, so the header and footer switches can never disagree.
function watchTheme(onChange: () => void) {
    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, {attributes: true, attributeFilter: ["data-theme"]});
    return () => observer.disconnect();
}

const isDark = () => document.documentElement.dataset.theme === "dark";

export function ThemeSwitch() {
    const {t} = useI18n();
    const dark = useSyncExternalStore(watchTheme, isDark, () => false);
    return (
        <span className="theme-switch">
            <MoonIcon/>
            <button type="button" className="config-switch" role="switch" aria-checked={dark} aria-label={t("site.darkMode")} onClick={() => setTheme(dark ? "light" : "dark")}></button>
        </span>
    );
}

// Follows the device and other tabs. Layout effect: in dev, Strict Mode's remount wipes what the inline script set on <html>.
export function ThemePreference() {
    useLayoutEffect(() => {
        applyTheme();
        const stopFollowing = followDevice(applyTheme);
        window.addEventListener("storage", applyTheme);
        return () => {
            stopFollowing();
            window.removeEventListener("storage", applyTheme);
        };
    }, []);
    return null;
}
