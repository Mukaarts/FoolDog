import { useState, useCallback } from 'react';

type Theme = 'dark' | 'light';

export default function ThemeToggle(): JSX.Element {
    const [theme, setTheme] = useState<Theme>(
        () => (document.documentElement.getAttribute('data-theme') as Theme) || 'dark'
    );

    const toggle = useCallback((): void => {
        const newTheme: Theme = theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('fooldog-theme', newTheme);
        setTheme(newTheme);
    }, [theme]);

    return (
        <button
            className="theme-toggle"
            onClick={toggle}
            title="Thema wiesselen"
            aria-label="Thema wiesselen"
        >
            {theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19'}
        </button>
    );
}
