import { Controller } from '@hotwired/stimulus';

type Theme = 'dark' | 'light';

export default class extends Controller {
    static targets = ['button'];

    declare readonly buttonTarget: HTMLElement;
    declare readonly hasButtonTarget: boolean;

    connect(): void {
        this._updateIcon();
    }

    toggle(): void {
        const currentTheme: Theme =
            (document.documentElement.getAttribute('data-theme') as Theme) || 'dark';
        const newTheme: Theme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('fooldog-theme', newTheme);
        this._updateIcon();
    }

    private _updateIcon(): void {
        const theme: Theme =
            (document.documentElement.getAttribute('data-theme') as Theme) || 'dark';
        if (this.hasButtonTarget) {
            this.buttonTarget.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }
}
