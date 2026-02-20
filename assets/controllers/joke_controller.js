import { Controller } from '@hotwired/stimulus';

const jokes = [
    {
        emoji: '🐾',
        text: 'Jeder Moien réift de Bauer: "FOOL, komm hier!" — D\'Noperen denken, hien huet e Problem mat sengem Kierper.',
    },
    {
        emoji: '🏆',
        text: 'Beim Hondesconcours gewënnt Fool den éischte Präis. Den Owend: "Mäi Fool ass de Bescht!" — D\'Jury schéngt komesch.',
    },
    {
        emoji: '🎾',
        text: '"FOOL, fetch!" — Den Tierarzt freet sech ob de Besëtzer Hëllef brauch.',
    },
    {
        emoji: '🌙',
        text: 'Mëtternuecht, Fënster op: "FOOOOOL, komm eran!" — D\'Noperen ruffen d\'Polizei.',
    },
    {
        emoji: '🛁',
        text: '"Fool brauch e Bad" — säit dem Dag kuckt de Friseur komisch wann hien d\'Woolz hëlt.',
    },
    {
        emoji: '📸',
        text: '"Kuckt mol mäi Fool!" — Gesi wou de Finger weist, ier Dir lacht.',
    },
    {
        emoji: '🐕',
        text: 'D\'Mamm rifft: "Komm iessen, de Fool waart op dech!" — De Jong gëtt rout a seet näischt.',
    },
    {
        emoji: '🏃',
        text: '"Fool ass eraus gelaaf!" — D\'Noperin hält séier hir Kanner zréck.',
    },
    {
        emoji: '🎅',
        text: 'Bréif un de Kleeschen: "Ech wëll datt de Fool gesond bleift." — D\'Enseignante schéckt en heem mat enger Notiz.',
    },
    {
        emoji: '😂',
        text: '"Fool schléift bei mir am Bett" — Dono gëtt d\'Dëschgespreech séier ganz roueg.',
    },
];

export default class extends Controller {
    static targets = ['card', 'emoji', 'hint', 'text', 'counter'];

    connect() {
        this.current = 0;
        this.revealed = false;
        this.flipping = false;
        this._updateCard();
    }

    reveal() {
        if (this.revealed) return;
        this.revealed = true;
        this.hintTarget.style.display = 'none';
        this.textTarget.style.display = '';
        this.textTarget.textContent = jokes[this.current].text;
        this.cardTarget.classList.remove('clickable');
    }

    next() {
        this._navigate((this.current + 1) % jokes.length);
    }

    prev() {
        this._navigate((this.current - 1 + jokes.length) % jokes.length);
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
        const joke = jokes[this.current];
        this.emojiTarget.textContent = joke.emoji;
        this.hintTarget.style.display = '';
        this.textTarget.style.display = 'none';
        this.textTarget.textContent = '';
        this.counterTarget.textContent = `${this.current + 1} / ${jokes.length}`;
        this.cardTarget.classList.add('clickable');
    }
}
