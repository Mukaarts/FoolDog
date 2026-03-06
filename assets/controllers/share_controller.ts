import { Controller } from '@hotwired/stimulus';
import * as htmlToImage from 'html-to-image';

export default class extends Controller {
    static targets = ['card', 'previewModal', 'previewImage', 'shareCanvas'];
    static values = {
        jokeText: String,
        jokeEmoji: String
    };

    declare readonly cardTarget: HTMLElement;
    declare readonly previewModalTarget: HTMLElement;
    declare readonly previewImageTarget: HTMLImageElement;
    declare readonly shareCanvasTarget: HTMLElement;
    declare jokeTextValue: string;
    declare jokeEmojiValue: string;

    private isGenerating: boolean = false;

    connect(): void {
        this.isGenerating = false;
    }

    /**
     * Generéiert e Bild aus der Joke-Card mat html-to-image
     */
    async share(event: Event): Promise<void> {
        event.preventDefault();

        if (this.isGenerating) return;

        // Aktuell Witz-Daten aus dem DOM huelen
        const jokeText = this._getCurrentJokeText();
        const jokeEmoji = this._getCurrentJokeEmoji();

        // Iwwerpréiwen ob e Witz ugewise ass
        if (!jokeText || jokeText.trim() === '') {
            this._showToast(`Weis fir d'éischt de Witz un!`, 'error');
            return;
        }

        this.isGenerating = true;
        this._showLoadingState();

        try {
            const dataUrl = await this._generateImage(jokeText, jokeEmoji);
            this._showPreview(dataUrl);
        } catch (error) {
            console.error('Bildgeneratiounsfehl:', error);
            this._showToast('Konnt Bild net generéieren. Probéier erëm!', 'error');
        } finally {
            this.isGenerating = false;
            this._hideLoadingState();
        }
    }

    /**
     * Deealt den Witz via WhatsApp (Web Share API oder Fallback)
     */
    async shareToWhatsApp(): Promise<void> {
        try {
            const jokeText = this._getCurrentJokeText();
            const jokeEmoji = this._getCurrentJokeEmoji();
            
            const dataUrl = await this._generateImage(jokeText, jokeEmoji);
            const blob = await this._dataUrlToBlob(dataUrl);
            const file = new File([blob], 'fooldog-witz.png', { type: 'image/png' });

            // Web Share API (funktionéiert op mobilen Apparaten)
            if (navigator.share && navigator.canShare?.({ files: [file] })) {
                await navigator.share({
                    title: 'FoolDog - Lëtzebuergesche Witz',
                    text: this._getShareText(jokeText, jokeEmoji),
                    files: [file]
                });
                this._closePreview();
                return;
            }

            // Fallback: WhatsApp Web mat Text + Bild Download
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            if (isMobile) {
                // iOS/Android: Web Share API sollt funktionéieren
                this._downloadImage(dataUrl, 'fooldog-whatsapp.png');
                this._showToast('Bild erofgelueden. Deel et op WhatsApp!', 'success');
            } else {
                // Desktop: WhatsApp Web Link
                const shareUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(this._getShareText(jokeText, jokeEmoji) + '\n\nhttps://fooldog.lu')}`;
                this._downloadImage(dataUrl, 'fooldog-whatsapp.png');
                window.open(shareUrl, '_blank', 'noopener,noreferrer');
            }

            this._closePreview();
        } catch (error) {
            console.error('WhatsApp Share Fehl:', error);
            this._showToast('Konnt net deelen. Probéier erëm!', 'error');
        }
    }

    /**
     * Lued d'Bild fir Instagram Story erof (9:16 Format)
     */
    async downloadForInstagram(): Promise<void> {
        try {
            const jokeText = this._getCurrentJokeText();
            const jokeEmoji = this._getCurrentJokeEmoji();
            
            const dataUrl = await this._generateImage(jokeText, jokeEmoji, 9 / 16);
            const timestamp = new Date().getTime();
            this._downloadImage(dataUrl, `fooldog-story-${timestamp}.png`);
            this._showToast('Bild fir Instagram Story bereet! 📸', 'success');
            this._closePreview();
        } catch (error) {
            console.error('Instagram Download Fehl:', error);
            this._showToast('Konnt Bild net eroflueden. Probéier erëm!', 'error');
        }
    }

    /**
     * Huet de aktuell Witz-Text aus dem DOM
     */
    private _getCurrentJokeText(): string {
        // Sich no dem visible joke text an der card
        const textElement = this.cardTarget.querySelector('.joke-text') as HTMLElement;
        if (textElement && textElement.style.display !== 'none' && textElement.textContent) {
            return textElement.textContent.trim();
        }
        
        // Fallback: Stimulus Value
        return this.jokeTextValue || '';
    }

    /**
     * Huet de aktuell Witz-Emoji aus dem DOM
     */
    private _getCurrentJokeEmoji(): string {
        // Sich no dem joke-emoji an der card
        const emojiElement = this.cardTarget.querySelector('.joke-emoji') as HTMLElement;
        if (emojiElement && emojiElement.textContent) {
            return emojiElement.textContent.trim();
        }
        
        // Fallback: Stimulus Value
        return this.jokeEmojiValue || '🐾';
    }

    /**
     * Generéiert d'Bild aus der Joke-Card
     */
    private async _generateImage(jokeText: string, jokeEmoji: string, aspectRatio?: number): Promise<string> {
        const isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';

        // Temporäre Container fir d'Bildgeneratioun
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'fixed';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '-9999px';
        tempContainer.style.width = aspectRatio ? '1080px' : '800px';
        tempContainer.style.zIndex = '-1';

        // Theme-aware Background
        const bgGradient = isLightTheme
            ? 'linear-gradient(180deg, #e8e0f0 0%, #d4ccdf 100%)'
            : 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)';

        // Hannergrond mat Cards
        const padding = aspectRatio ? '80px' : '60px';
        const cardMaxWidth = aspectRatio ? '800px' : '640px';
        const emojiSize = aspectRatio ? '72px' : '56px';
        const textSize = aspectRatio ? '32px' : '26px';
        const lineHeight = aspectRatio ? '1.8' : '1.7';

        tempContainer.innerHTML = `
            <div style="
                width: ${aspectRatio ? '1080px' : '800px'};
                height: ${aspectRatio ? '1920px' : 'auto'};
                min-height: ${aspectRatio ? '1920px' : '600px'};
                background: ${bgGradient};
                padding: ${padding};
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
                font-family: Georgia, serif;
            ">
                <!-- Logo / Header -->
                <div style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-bottom: 40px;
                ">
                    <div style="font-size: 80px; margin-bottom: 10px;">🐶</div>
                    <div style="
                        font-size: 36px;
                        font-weight: bold;
                        font-style: italic;
                        color: ${isLightTheme ? '#b8860b' : '#f5c842'};
                        letter-spacing: 0.1em;
                    ">FoolDog</div>
                </div>

                <!-- Joke Card -->
                <div style="
                    background: ${isLightTheme ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.05)'};
                    border: 3px solid ${isLightTheme ? 'rgba(184,134,11,0.4)' : 'rgba(245,200,66,0.3)'};
                    border-radius: 32px;
                    padding: ${padding} 40px;
                    max-width: ${cardMaxWidth};
                    width: 100%;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                ">
                    <div style="font-size: ${emojiSize}; margin-bottom: 20px; line-height: 1;">${jokeEmoji || '🐾'}</div>
                    <div style="
                        font-size: ${textSize};
                        line-height: ${lineHeight};
                        color: ${isLightTheme ? '#1a1a2e' : '#ffffff'};
                        max-width: 100%;
                    ">${this._escapeHtml(jokeText)}</div>
                </div>

                <!-- Footer -->
                <div style="
                    margin-top: 50px;
                    font-size: 20px;
                    color: ${isLightTheme ? '#4a5568' : '#a0b4d6'};
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                ">
                    fooldog.lu
                </div>
            </div>
        `;

        document.body.appendChild(tempContainer);

        try {
            const targetElement = tempContainer.firstElementChild as HTMLElement;

            const dataUrl = await htmlToImage.toPng(targetElement, {
                pixelRatio: 3, // Hoich Qualitéit fir Retina/Instagram
                quality: 1,
                backgroundColor: isLightTheme ? '#e8e0f0' : '#1a1a2e'
            });

            return dataUrl;
        } finally {
            document.body.removeChild(tempContainer);
        }
    }

    /**
     * Weist d'Bild-Virschau am Modal un
     */
    private _showPreview(dataUrl: string): void {
        this.previewImageTarget.src = dataUrl;
        this.previewModalTarget.classList.add('share-modal--visible');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Schléisst d'Preview Modal
     */
    closePreview(): void {
        this._closePreview();
    }

    private _closePreview(): void {
        this.previewModalTarget.classList.remove('share-modal--visible');
        document.body.style.overflow = '';
        this.previewImageTarget.src = '';
    }

    /**
     * Lued d'Bild erof
     */
    private _downloadImage(dataUrl: string, filename: string): void {
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
    }

    /**
     * Konvertéiert Data URL zu Blob
     */
    private _dataUrlToBlob(dataUrl: string): Blob {
        const byteString = atob(dataUrl.split(',')[1]);
        const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);

        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ab], { type: mimeString });
    }

    /**
     * Eloagert HTML anerkannt Zeechen
     */
    private _escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Gëtt de Share Text zeréck
     */
    private _getShareText(jokeText: string, jokeEmoji: string): string {
        const emoji = jokeEmoji || '🐶';
        return `${emoji} ${jokeText}\n\n🐾 Deel mat FoolDog!`;
    }

    /**
     * Loading State weisen
     */
    private _showLoadingState(): void {
        const event = new CustomEvent('share:loading', { detail: { loading: true } });
        this.element.dispatchEvent(event);
    }

    private _hideLoadingState(): void {
        const event = new CustomEvent('share:loading', { detail: { loading: false } });
        this.element.dispatchEvent(event);
    }

    /**
     * Toast Notification weisen
     */
    private _showToast(message: string, type: 'success' | 'error' = 'success'): void {
        // Benotzt den existéierenden Toast System wann et ewell gëtt
        // Fallback: Einfachen Toast erstellen
        const toast = document.createElement('div');
        toast.className = `share-toast share-toast--${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? 'rgba(74, 222, 128, 0.95)' : 'rgba(248, 113, 113, 0.95)'};
            color: #1a1a2e;
            padding: 16px 28px;
            border-radius: 50px;
            font-size: 15px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            animation: slideUp 0.3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}
