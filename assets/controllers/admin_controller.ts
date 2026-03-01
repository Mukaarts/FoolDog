import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static targets = ['flash'];

    declare readonly flashTargets: HTMLElement[];

    dismissFlash(event: Event): void {
        const target = event.target as HTMLElement;
        const alert: HTMLElement | null = target.closest('.admin-alert');
        if (alert) {
            alert.style.opacity = '0';
            alert.style.transform = 'translateY(-8px)';
            alert.style.transition = 'opacity 200ms ease, transform 200ms ease';
            setTimeout((): void => alert.remove(), 200);
        }
    }

    confirmDelete(event: Event): void {
        if (!confirm('Sidd Dir sécher dass Dir dëse Witz läsche wëllt?')) {
            event.preventDefault();
        }
    }
}
