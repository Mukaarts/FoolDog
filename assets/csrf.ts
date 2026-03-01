const nameCheck: RegExp = /^[-_a-zA-Z0-9]{4,22}$/;
const tokenCheck: RegExp = /^[-_/+a-zA-Z0-9]{24,}$/;

interface TurboFormSubmission {
    formElement: HTMLFormElement;
    fetchRequest: {
        headers: Record<string, string>;
    };
}

interface TurboSubmitEvent extends Event {
    detail: {
        formSubmission: TurboFormSubmission;
    };
}

function generateCsrfToken(formElement: HTMLFormElement): void {
    const csrfField: HTMLInputElement | null = formElement.querySelector('input[data-controller="csrf-protection"], input[name="_csrf_token"]');

    if (!csrfField) {
        return;
    }

    let csrfCookie: string | null = csrfField.getAttribute('data-csrf-protection-cookie-value');
    let csrfToken: string = csrfField.value;

    if (!csrfCookie && nameCheck.test(csrfToken)) {
        csrfField.setAttribute('data-csrf-protection-cookie-value', csrfCookie = csrfToken);
        csrfField.defaultValue = csrfToken = btoa(String.fromCharCode.apply(null, Array.from(window.crypto.getRandomValues(new Uint8Array(18)))));
    }
    csrfField.dispatchEvent(new Event('change', { bubbles: true }));

    if (csrfCookie && tokenCheck.test(csrfToken)) {
        const cookie: string = csrfCookie + '_' + csrfToken + '=' + csrfCookie + '; path=/; samesite=strict';
        document.cookie = window.location.protocol === 'https:' ? '__Host-' + cookie + '; secure' : cookie;
    }
}

function generateCsrfHeaders(formElement: HTMLFormElement): Record<string, string> {
    const headers: Record<string, string> = {};
    const csrfField: HTMLInputElement | null = formElement.querySelector('input[data-controller="csrf-protection"], input[name="_csrf_token"]');

    if (!csrfField) {
        return headers;
    }

    const csrfCookie: string | null = csrfField.getAttribute('data-csrf-protection-cookie-value');

    if (tokenCheck.test(csrfField.value) && csrfCookie && nameCheck.test(csrfCookie)) {
        headers[csrfCookie] = csrfField.value;
    }

    return headers;
}

function removeCsrfToken(formElement: HTMLFormElement): void {
    const csrfField: HTMLInputElement | null = formElement.querySelector('input[data-controller="csrf-protection"], input[name="_csrf_token"]');

    if (!csrfField) {
        return;
    }

    const csrfCookie: string | null = csrfField.getAttribute('data-csrf-protection-cookie-value');

    if (tokenCheck.test(csrfField.value) && csrfCookie && nameCheck.test(csrfCookie)) {
        const cookie: string = csrfCookie + '_' + csrfField.value + '=0; path=/; samesite=strict; max-age=0';

        document.cookie = window.location.protocol === 'https:' ? '__Host-' + cookie + '; secure' : cookie;
    }
}

document.addEventListener('submit', function (event: Event): void {
    generateCsrfToken(event.target as HTMLFormElement);
}, true);

document.addEventListener('turbo:submit-start', function (event: Event): void {
    const turboEvent = event as TurboSubmitEvent;
    const h: Record<string, string> = generateCsrfHeaders(turboEvent.detail.formSubmission.formElement);
    Object.keys(h).map(function (k: string): void {
        turboEvent.detail.formSubmission.fetchRequest.headers[k] = h[k];
    });
});

document.addEventListener('turbo:submit-end', function (event: Event): void {
    const turboEvent = event as TurboSubmitEvent;
    removeCsrfToken(turboEvent.detail.formSubmission.formElement);
});
