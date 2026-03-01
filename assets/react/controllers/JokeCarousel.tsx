import { useState, useEffect, useCallback, useRef } from 'react';
import type { Joke } from '../../types/joke';

export default function JokeCarousel(): JSX.Element {
    const [jokes, setJokes] = useState<Joke[]>([]);
    const [current, setCurrent] = useState<number>(0);
    const [revealed, setRevealed] = useState<boolean>(false);
    const [flipping, setFlipping] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const flippingRef = useRef<boolean>(false);

    useEffect(() => {
        fetch('/api/jokes')
            .then((res) => res.json())
            .then((data: Joke[]) => {
                if (data.length > 0) {
                    setJokes(data);
                }
            })
            .catch(() => {
                setError('Konnt Witzen net lueden...');
            });
    }, []);

    const reveal = useCallback((): void => {
        if (revealed || jokes.length === 0) return;
        setRevealed(true);
    }, [revealed, jokes.length]);

    const navigate = useCallback(
        (index: number): void => {
            if (flippingRef.current || jokes.length === 0) return;
            flippingRef.current = true;
            setFlipping(true);
            setRevealed(false);

            setTimeout((): void => {
                setCurrent(index);
                setFlipping(false);
                flippingRef.current = false;
            }, 400);
        },
        [jokes.length]
    );

    const next = useCallback((): void => {
        if (jokes.length === 0) return;
        navigate((current + 1) % jokes.length);
    }, [current, jokes.length, navigate]);

    const prev = useCallback((): void => {
        if (jokes.length === 0) return;
        navigate((current - 1 + jokes.length) % jokes.length);
    }, [current, jokes.length, navigate]);

    const joke = jokes[current];
    const cardClasses = [
        'joke-card',
        !revealed && jokes.length > 0 ? 'clickable' : '',
        flipping ? 'flipping' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <>
            <div className={cardClasses} onClick={reveal}>
                <div className="joke-emoji">
                    {joke?.emoji || '\u{1F43E}'}
                </div>
                {error ? (
                    <p className="joke-hint">{error}</p>
                ) : revealed && joke ? (
                    <p className="joke-text">{joke.content}</p>
                ) : (
                    <p className="joke-hint">
                        {'\u{1F446}'} Klick fir de Witz ze gesinn!
                    </p>
                )}
            </div>

            <p className="joke-counter">
                {jokes.length > 0
                    ? `${current + 1} / ${jokes.length}`
                    : '1 / 10'}
            </p>

            <div className="joke-nav">
                <button className="btn-nav" onClick={prev}>
                    &larr; Zr&eacute;ck
                </button>
                <button className="btn-nav" onClick={next}>
                    Weider &rarr;
                </button>
            </div>
        </>
    );
}
