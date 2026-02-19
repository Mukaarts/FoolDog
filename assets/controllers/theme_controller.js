import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static targets = ['button'];

    connect() {
        this._updateIcon();
    }

    toggle() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('fooldog-theme', newTheme);
        this._updateIcon();
    }

    _updateIcon() {
        const theme = document.documentElement.getAttribute('data-theme') || 'dark';
        if (this.hasButtonTarget) {
            this.buttonTarget.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }
}
