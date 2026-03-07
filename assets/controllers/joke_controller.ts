import { Controller } from '@hotwired/stimulus';
import type { Joke } from '../types/joke';

export default class extends Controller {
    static targets = ['card', 'emoji', 'hint', 'text', 'counter', 'toast', 'toastMessage'];

    declare readonly cardTarget: HTMLElement;
    declare readonly emojiTarget: HTMLElement;
    declare readonly hintTarget: HTMLElement;
    declare readonly textTarget: HTMLElement;
    declare readonly counterTarget: HTMLElement;
    declare readonly toastTarget: HTMLElement;
    declare readonly toastMessageTarget: HTMLElement;

    private jokes: Joke[] = [];
    private current: number = 0;
    private revealed: boolean = false;
    private flipping: boolean = false;

    connect(): void {
        this.jokes = [];
        this.current = 0;
        this.revealed = false;
        this.flipping = false;
        this._loadJokes();
    }

    reveal(): void {
        if (this.revealed || this.jokes.length === 0) return;
        this.revealed = true;
        this.hintTarget.style.display = 'none';
        this.textTarget.style.display = '';
        this.textTarget.textContent = this.jokes[this.current].content;
        this.cardTarget.classList.remove('clickable');
    }

    next(): void {
        if (this.jokes.length === 0) return;
        this._navigate((this.current + 1) % this.jokes.length);
    }

    prev(): void {
        if (this.jokes.length === 0) return;
        this._navigate((this.current - 1 + this.jokes.length) % this.jokes.length);
    }

    async share(): Promise<void> {
        if (this.jokes.length === 0) return;
        
        const joke: Joke = this.jokes[this.current];
        const shareUrl = `${window.location.origin}/joke/${joke.id}`;

        // Try native Web Share API first
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'FoolDog - Lëtzebuergesche Witz',
                    text: joke.content,
                    url: shareUrl,
                });
                this._showToast('Witz geteilt! 🎉');
                return;
            } catch (err) {
                // User cancelled sharing, fallback to clipboard
            }
        }

        // Fallback: Copy to clipboard
        try {
            await navigator.clipboard.writeText(`${shareUrl}\n\n${joke.content}`);
            this._showToast('Link kopéiert! 📋');
        } catch {
            this._showToast('Konnt net kopéieren', true);
        }
    }

    private async _loadJokes(): Promise<void> {
        try {
            const response: Response = await fetch('/api/jokes');
            const data: Joke[] = await response.json();

            if (data.length > 0) {
                this.jokes = data;
                this._updateCard();
            }
        } catch {
            this.hintTarget.textContent = 'Konnt Witzen net lueden...';
        }
    }

    private _navigate(index: number): void {
        if (this.flipping) return;
        this.flipping = true;
        this.revealed = false;

        this.cardTarget.classList.add('flipping');

        setTimeout((): void => {
            this.current = index;
            this._updateCard();
            this.cardTarget.classList.remove('flipping');
            this.flipping = false;
        }, 400);
    }

    private _updateCard(): void {
        if (this.jokes.length === 0) return;
        const joke: Joke = this.jokes[this.current];
        this.emojiTarget.textContent = joke.emoji || '\u{1F43E}';
        this.hintTarget.style.display = '';
        this.textTarget.style.display = 'none';
        this.textTarget.textContent = '';
        this.counterTarget.textContent = `${this.current + 1} / ${this.jokes.length}`;
        this.cardTarget.classList.add('clickable');
    }

    private _showToast(message: string, isError: boolean = false): void {
        this.toastMessageTarget.textContent = message;
        this.toastTarget.classList.remove('toast--error');
        if (isError) {
            this.toastTarget.classList.add('toast--error');
        }
        this.toastTarget.hidden = false;
        
        setTimeout(() => {
            this.toastTarget.hidden = true;
        }, 2500);
    }
}
