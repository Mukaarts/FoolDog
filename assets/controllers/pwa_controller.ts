import { Controller } from '@hotwired/stimulus';

/**
 * PWA controller — handles install prompt and online/offline status.
 */
export default class extends Controller {
    static targets = ['installBtn', 'offlineBanner'];

    declare readonly installBtnTarget: HTMLElement;
    declare readonly hasInstallBtnTarget: boolean;
    declare readonly offlineBannerTarget: HTMLElement;
    declare readonly hasOfflineBannerTarget: boolean;

    private _deferredPrompt: BeforeInstallPromptEvent | null = null;
    private _onBeforeInstallPrompt!: (event: BeforeInstallPromptEvent) => void;
    private _onOnline!: () => void;
    private _onOffline!: () => void;

    connect(): void {
        this._deferredPrompt = null;
        this._bindInstallPrompt();
        this._bindNetworkStatus();
    }

    disconnect(): void {
        window.removeEventListener('beforeinstallprompt', this._onBeforeInstallPrompt);
        window.removeEventListener('online', this._onOnline);
        window.removeEventListener('offline', this._onOffline);
    }

    // ─── Install ────────────────────────────────────────────────────────────

    private _bindInstallPrompt(): void {
        this._onBeforeInstallPrompt = (event: BeforeInstallPromptEvent): void => {
            event.preventDefault();
            this._deferredPrompt = event;
            if (this.hasInstallBtnTarget) {
                this.installBtnTarget.hidden = false;
            }
        };

        window.addEventListener('beforeinstallprompt', this._onBeforeInstallPrompt);

        window.addEventListener('appinstalled', (): void => {
            this._deferredPrompt = null;
            if (this.hasInstallBtnTarget) {
                this.installBtnTarget.hidden = true;
            }
        });
    }

    async install(): Promise<void> {
        if (!this._deferredPrompt) return;
        this._deferredPrompt.prompt();
        await this._deferredPrompt.userChoice;
        this._deferredPrompt = null;
        if (this.hasInstallBtnTarget) {
            this.installBtnTarget.hidden = true;
        }
    }

    // ─── Online / Offline ────────────────────────────────────────────────────

    private _bindNetworkStatus(): void {
        this._onOnline = (): void => this._setOffline(false);
        this._onOffline = (): void => this._setOffline(true);

        window.addEventListener('online', this._onOnline);
        window.addEventListener('offline', this._onOffline);

        // Set initial state
        if (!navigator.onLine) {
            this._setOffline(true);
        }
    }

    private _setOffline(isOffline: boolean): void {
        if (this.hasOfflineBannerTarget) {
            this.offlineBannerTarget.hidden = !isOffline;
        }
    }
}
