import './styles/app.css';

// Start Stimulus app (required: UX React uses a Stimulus controller internally)
import './stimulus_bootstrap';

// Register React components with Symfony UX React
import { registerReactControllerComponents } from '@symfony/ux-react';

registerReactControllerComponents(
    require.context('./react/controllers', true, /\.(j|t)sx?$/)
);

// CSRF protection for Turbo form submissions
import './csrf';

// Register Service Worker for PWA support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', (): void => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .catch((): void => {
                // Service worker registration failed — app still works normally
            });
    });
}
