import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static targets = ['card', 'emoji', 'hint', 'text', 'counter'];

    connect() {
        this.jokes = [];
        this.current = 0;
        this.revealed = false;
        this.flipping = false;
        this._loadJokes();
    }

    reveal() {
        if (this.revealed || this.jokes.length === 0) return;
        this.revealed = true;
        this.hintTarget.style.display = 'none';
        this.textTarget.style.display = '';
        this.textTarget.textContent = this.jokes[this.current].content;
        this.cardTarget.classList.remove('clickable');
    }

    next() {
        if (this.jokes.length === 0) return;
        this._navigate((this.current + 1) % this.jokes.length);
    }

    prev() {
        if (this.jokes.length === 0) return;
        this._navigate((this.current - 1 + this.jokes.length) % this.jokes.length);
    }

    async _loadJokes() {
        try {
            const response = await fetch('/api/jokes');
            const data = await response.json();

            if (data.length > 0) {
                this.jokes = data;
                this._updateCard();
            }
        } catch {
            this.hintTarget.textContent = 'Konnt Witzen net lueden...';
        }
    }

    _navigate(index) {
        if (this.flipping) return;
        this.flipping = true;
        this.revealed = false;

        this.cardTarget.classList.add('flipping');

        setTimeout(() => {
            this.current = index;
            this._updateCard();
            this.cardTarget.classList.remove('flipping');
            this.flipping = false;
        }, 400);
    }

    _updateCard() {
        if (this.jokes.length === 0) return;
        const joke = this.jokes[this.current];
        this.emojiTarget.textContent = joke.emoji || '\u{1F43E}';
        this.hintTarget.style.display = '';
        this.textTarget.style.display = 'none';
        this.textTarget.textContent = '';
        this.counterTarget.textContent = `${this.current + 1} / ${this.jokes.length}`;
        this.cardTarget.classList.add('clickable');
    }
}
