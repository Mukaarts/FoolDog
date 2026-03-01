import { useState, useEffect, useCallback, useRef } from 'react';

export default function PWAManager(): JSX.Element {
    const [showInstall, setShowInstall] = useState<boolean>(false);
    const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
    const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        const onBeforeInstall = (e: BeforeInstallPromptEvent): void => {
            e.preventDefault();
            deferredPromptRef.current = e;
            setShowInstall(true);
        };

        const onAppInstalled = (): void => {
            deferredPromptRef.current = null;
            setShowInstall(false);
        };

        const onOnline = (): void => setIsOffline(false);
        const onOffline = (): void => setIsOffline(true);

        window.addEventListener('beforeinstallprompt', onBeforeInstall);
        window.addEventListener('appinstalled', onAppInstalled);
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);

        return () => {
            window.removeEventListener('beforeinstallprompt', onBeforeInstall);
            window.removeEventListener('appinstalled', onAppInstalled);
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
        };
    }, []);

    const install = useCallback(async (): Promise<void> => {
        if (!deferredPromptRef.current) return;
        deferredPromptRef.current.prompt();
        await deferredPromptRef.current.userChoice;
        deferredPromptRef.current = null;
        setShowInstall(false);
    }, []);

    return (
        <>
            {isOffline && (
                <div className="offline-banner">
                    {'\uD83D\uDC3E'} Dir sidd offline — Witzen aus dem Cache
                </div>
            )}
            {showInstall && (
                <button
                    className="pwa-install-btn"
                    onClick={install}
                    title="FoolDog installéieren"
                    aria-label="FoolDog als App installéieren"
                >
                    {'\uD83D\uDCF2'} App installéieren
                </button>
            )}
        </>
    );
}
