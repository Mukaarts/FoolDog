import './styles/app.css';
import './stimulus_bootstrap.js';

// Register Service Worker for PWA support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .catch(() => {
                // Service worker registration failed — app still works normally
            });
    });
}
