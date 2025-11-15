import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = '__THEME_CONFIG__';

export const useTheme = () => {
    const [theme, setTheme] = useState<Theme>('light');

    // Initialize theme from localStorage or system preference
    useEffect(() => {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
            setTheme(savedTheme as Theme);
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark ? 'dark' : 'light');
        }
    }, []);

    // Apply theme to HTML element
    useEffect(() => {
        const htmlElement = document.documentElement;
        htmlElement.setAttribute('data-bs-theme', theme);

        // Set default attributes for proper theme styling
        htmlElement.setAttribute('data-topbar', 'white');
        htmlElement.setAttribute('data-sidebar', 'light');
        htmlElement.setAttribute('data-layout', 'fluid');

        // Save to localStorage
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const setLightTheme = () => setTheme('light');
    const setDarkTheme = () => setTheme('dark');

    return {
        theme,
        toggleTheme,
        setLightTheme,
        setDarkTheme,
        isLight: theme === 'light',
        isDark: theme === 'dark',
    };
};
