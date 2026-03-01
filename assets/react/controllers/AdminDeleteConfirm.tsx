import { useCallback } from 'react';

interface AdminDeleteConfirmProps {
    action: string;
    csrfToken: string;
}

export default function AdminDeleteConfirm({
    action,
    csrfToken,
}: AdminDeleteConfirmProps): JSX.Element {
    const handleSubmit = useCallback(
        (e: React.FormEvent<HTMLFormElement>): void => {
            if (
                !confirm(
                    'Sidd Dir sécher dass Dir dëse Witz läsche wëllt?'
                )
            ) {
                e.preventDefault();
            }
        },
        []
    );

    return (
        <form
            method="post"
            action={action}
            className="admin-inline-form"
            onSubmit={handleSubmit}
        >
            <input type="hidden" name="_token" value={csrfToken} />
            <button
                type="submit"
                className="admin-btn admin-btn--small admin-btn--danger"
            >
                {'\uD83D\uDDD1\uFE0F'}
            </button>
        </form>
    );
}
