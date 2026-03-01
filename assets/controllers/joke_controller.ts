import { Controller } from '@hotwired/stimulus';
import type { Joke } from '../types/joke';

export default class extends Controller {
    static targets = ['card', 'emoji', 'hint', 'text', 'counter'];

    declare readonly cardTarget: HTMLElement;
    declare readonly emojiTarget: HTMLElement;
    declare readonly hintTarget: HTMLElement;
    declare readonly textTarget: HTMLElement;
    declare readonly counterTarget: HTMLElement;

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
}
