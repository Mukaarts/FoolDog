import './styles/app.css';
import './stimulus_bootstrap';

// Register Service Worker for PWA support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', (): void => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .catch((): void => {
                // Service worker registration failed — app still works normally
            });
    });
}
