import { useEffect, useLayoutEffect, useState } from "react";

type Theme = "light" | "dark";
const themeKey = "biblioteca-theme";
const darkQuery = "(prefers-color-scheme: dark)";

function storedTheme(): Theme | null {
    try {
        const stored = window.localStorage.getItem(themeKey);
        return stored === "light" || stored === "dark" ? stored : null;
    } catch {
        return null;
    }
}

export function useThemeViewModel() {
    const [preference, setPreference] = useState(storedTheme);
    const [systemDark, setSystemDark] = useState(() => window.matchMedia(darkQuery).matches);
    const theme = preference ?? (systemDark ? "dark" : "light");

    useEffect(() => {
        const media = window.matchMedia(darkQuery);
        const sync = () => setSystemDark(media.matches);
        sync();
        media.addEventListener("change", sync);
        return () => media.removeEventListener("change", sync);
    }, []);

    useLayoutEffect(() => {
        document.documentElement.dataset.theme = theme;
        const chromeColor = getComputedStyle(document.documentElement).getPropertyValue("--nav").trim();
        document.querySelector('meta[name="theme-color"]')?.setAttribute("content", chromeColor);
    }, [theme]);

    return {
        icon: theme === "dark" ? "sun" as const : "moon" as const,
        label: theme === "dark" ? "Activar modo claro" : "Activar modo oscuro",
        toggle: () => {
            const next = theme === "dark" ? "light" : "dark";
            setPreference(next);
            try { window.localStorage.setItem(themeKey, next); } catch { /* Preference remains active for this page. */ }
        }
    };
}

export type ThemeView = ReturnType<typeof useThemeViewModel>;
