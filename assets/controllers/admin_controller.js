import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static targets = ['flash'];

    dismissFlash(event) {
        const alert = event.target.closest('.admin-alert');
        if (alert) {
            alert.style.opacity = '0';
            alert.style.transform = 'translateY(-8px)';
            alert.style.transition = 'opacity 200ms ease, transform 200ms ease';
            setTimeout(() => alert.remove(), 200);
        }
    }

    confirmDelete(event) {
        if (!confirm('Sidd Dir sécher dass Dir dëse Witz läsche wëllt?')) {
            event.preventDefault();
        }
    }
}
