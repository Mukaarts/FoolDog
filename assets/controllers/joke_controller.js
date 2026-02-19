import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static targets = ['jokeText', 'jokeSource', 'jokeInput', 'authorInput', 'feedback', 'jokesList'];

    async loadRandom() {
        await this._fetchJoke('/api/joke/random');
    }

    async loadAi() {
        await this._fetchJoke('/api/joke/ai');
    }

    async submit() {
        const content = this.jokeInputTarget.value.trim();
        const author = this.authorInputTarget.value.trim() || 'Anonym';

        if (!content) {
            this._showFeedback('Bitte gib einen Witz ein!', 'error');
            return;
        }

        try {
            const response = await fetch('/api/joke/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, author }),
            });

            const data = await response.json();

            if (response.ok) {
                this._showFeedback(data.message, 'success');
                this.jokeInputTarget.value = '';
                this.authorInputTarget.value = '';
            } else {
                this._showFeedback(data.error || 'Fehler beim Einreichen', 'error');
            }
        } catch {
            this._showFeedback('Netzwerkfehler. Bitte versuche es erneut.', 'error');
        }
    }

    async loadList() {
        try {
            const response = await fetch('/api/jokes');
            const jokes = await response.json();

            if (jokes.length === 0) {
                this.jokesListTarget.innerHTML = '<p style="color: var(--color-text-muted); padding: 16px;">Noch keine Witze eingereicht. Sei der Erste!</p>';
                return;
            }

            this.jokesListTarget.innerHTML = jokes.map(joke => `
                <div class="joke-item">
                    <div class="joke-item-content">${this._escapeHtml(joke.content)}</div>
                    <div class="joke-item-meta">von ${this._escapeHtml(joke.author || 'Anonym')} &middot; ${joke.createdAt}</div>
                </div>
            `).join('');
        } catch {
            this.jokesListTarget.innerHTML = '<p style="color: var(--color-error); padding: 16px;">Fehler beim Laden der Witze.</p>';
        }
    }

    async _fetchJoke(url) {
        this.jokeTextTarget.classList.add('loading');

        try {
            const response = await fetch(url);
            const data = await response.json();

            this.jokeTextTarget.textContent = data.joke;

            const sourceLabels = {
                database: 'Aus der Datenbank',
                ai: 'AI-generiert',
                fallback: 'FoolDog Klassiker',
            };
            this.jokeSourceTarget.textContent = sourceLabels[data.source] || '';
        } catch {
            this.jokeTextTarget.textContent = 'Wuff! Da ist etwas schiefgelaufen...';
            this.jokeSourceTarget.textContent = '';
        } finally {
            this.jokeTextTarget.classList.remove('loading');
        }
    }

    _showFeedback(message, type) {
        this.feedbackTarget.textContent = message;
        this.feedbackTarget.className = `submit-feedback ${type}`;

        setTimeout(() => {
            this.feedbackTarget.textContent = '';
            this.feedbackTarget.className = 'submit-feedback';
        }, 4000);
    }

    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
