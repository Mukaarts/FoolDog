import { Controller } from '@hotwired/stimulus';

/**
 * PWA controller — handles install prompt and online/offline status.
 */
export default class extends Controller {
    static targets = ['installBtn', 'offlineBanner'];

    connect() {
        this._deferredPrompt = null;
        this._bindInstallPrompt();
        this._bindNetworkStatus();
    }

    disconnect() {
        window.removeEventListener('beforeinstallprompt', this._onBeforeInstallPrompt);
        window.removeEventListener('online', this._onOnline);
        window.removeEventListener('offline', this._onOffline);
    }

    // ─── Install ────────────────────────────────────────────────────────────

    _bindInstallPrompt() {
        this._onBeforeInstallPrompt = (event) => {
            event.preventDefault();
            this._deferredPrompt = event;
            if (this.hasInstallBtnTarget) {
                this.installBtnTarget.hidden = false;
            }
        };

        window.addEventListener('beforeinstallprompt', this._onBeforeInstallPrompt);

        window.addEventListener('appinstalled', () => {
            this._deferredPrompt = null;
            if (this.hasInstallBtnTarget) {
                this.installBtnTarget.hidden = true;
            }
        });
    }

    async install() {
        if (!this._deferredPrompt) return;
        this._deferredPrompt.prompt();
        await this._deferredPrompt.userChoice;
        this._deferredPrompt = null;
        if (this.hasInstallBtnTarget) {
            this.installBtnTarget.hidden = true;
        }
    }

    // ─── Online / Offline ────────────────────────────────────────────────────

    _bindNetworkStatus() {
        this._onOnline = () => this._setOffline(false);
        this._onOffline = () => this._setOffline(true);

        window.addEventListener('online', this._onOnline);
        window.addEventListener('offline', this._onOffline);

        // Set initial state
        if (!navigator.onLine) {
            this._setOffline(true);
        }
    }

    _setOffline(isOffline) {
        if (this.hasOfflineBannerTarget) {
            this.offlineBannerTarget.hidden = !isOffline;
        }
    }
}
