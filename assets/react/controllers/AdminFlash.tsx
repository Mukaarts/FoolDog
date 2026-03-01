import { useState, useCallback } from 'react';

interface FlashMessage {
    type: 'success' | 'error';
    message: string;
}

interface AdminFlashProps {
    flashes: FlashMessage[];
}

export default function AdminFlash({ flashes }: AdminFlashProps): JSX.Element {
    const [visible, setVisible] = useState<Record<number, boolean>>(
        () => Object.fromEntries(flashes.map((_, i) => [i, true]))
    );

    const dismiss = useCallback((index: number): void => {
        setVisible((prev) => ({ ...prev, [index]: false }));
    }, []);

    return (
        <>
            {flashes.map((flash, i) =>
                visible[i] ? (
                    <div
                        key={i}
                        className={`admin-alert admin-alert--${flash.type}`}
                        style={{
                            transition: 'opacity 200ms ease, transform 200ms ease',
                        }}
                    >
                        {flash.message}
                        <button
                            className="admin-alert__close"
                            onClick={() => dismiss(i)}
                        >
                            &times;
                        </button>
                    </div>
                ) : null
            )}
        </>
    );
}
