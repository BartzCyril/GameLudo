export type Theme = "light" | "dark";

export const THEME_KEY = "ludo:theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

// Runs at the top of <body>, before the first paint, so it cannot import anything: applyTheme() below is its twin, theme.test.ts keeps them equal.
export const THEME_SCRIPT = `(function(){var t;try{t=localStorage.getItem("${THEME_KEY}")}catch(e){}if(t!=="dark"&&t!=="light")t=matchMedia("${DARK_QUERY}").matches?"dark":"light";document.documentElement.dataset.theme=t})()`;

function savedTheme() {
    try {
        return localStorage.getItem(THEME_KEY);
    } catch {
        return null;
    }
}

// The visitor's choice, otherwise the device's. Client only.
export function applyTheme() {
    const saved = savedTheme();
    document.documentElement.dataset.theme = saved === "dark" || saved === "light" ? saved : matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

export function followDevice(onChange: () => void) {
    const media = matchMedia(DARK_QUERY);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
}

export function setTheme(theme: Theme) {
    document.documentElement.dataset.theme = theme;
    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch {
        // Private browsing or full storage: the theme simply lasts for this visit.
    }
}
