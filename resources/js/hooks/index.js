import { useCallback, useEffect, useRef, useState } from 'react';

export function useLocalStorage(kunci, nilaiAwal) {
    const [nilai, setNilai] = useState(() => {
        try {
            const mentah = window.localStorage.getItem(kunci);

            return mentah === null ? nilaiAwal : JSON.parse(mentah);
        } catch {
            return nilaiAwal;
        }
    });

    const tulis = useCallback((baru) => {
        setNilai((lama) => {
            const hasil = typeof baru === 'function' ? baru(lama) : baru;

            try {
                window.localStorage.setItem(kunci, JSON.stringify(hasil));
            } catch {
                /* storage penuh atau diblokir, diabaikan */
            }

            return hasil;
        });
    }, [kunci]);

    return [nilai, tulis];
}

export function useCountdown(detikAwal, aktif = true) {
    const [sisa, setSisa] = useState(detikAwal);

    useEffect(() => {
        if (!aktif) return undefined;

        setSisa(detikAwal);

        const id = setInterval(() => {
            setSisa((n) => {
                if (n <= 1) {
                    clearInterval(id);

                    return 0;
                }

                return n - 1;
            });
        }, 1000);

        return () => clearInterval(id);
    }, [detikAwal, aktif]);

    const menit = String(Math.floor(sisa / 60)).padStart(2, '0');
    const detik = String(sisa % 60).padStart(2, '0');

    return { sisa, ulang: () => setSisa(detikAwal), teks: `${menit}:${detik}` };
}

export function useDebounce(nilai, jeda = 350) {
    const [terlambat, setTerlambat] = useState(nilai);

    useEffect(() => {
        const id = setTimeout(() => setTerlambat(nilai), jeda);

        return () => clearTimeout(id);
    }, [nilai, jeda]);

    return terlambat;
}

export function useTerdebounce(callback, jeda = 400) {
    const timer = useRef(null);

    return useCallback(
        (...args) => {
            clearTimeout(timer.current);
            timer.current = setTimeout(() => callback(...args), jeda);
        },
        [callback, jeda],
    );
}

export function useInterval(callback, tunda) {
    const simpan = useRef(callback);

    useEffect(() => {
        simpan.current = callback;
    }, [callback]);

    useEffect(() => {
        if (tunda === null) return undefined;

        const id = setInterval(() => simpan.current(), tunda);

        return () => clearInterval(id);
    }, [tunda]);
}

export function useSembunyi(delay = 300) {
    const [tampil, setTampil] = useState(false);

    useEffect(() => {
        const id = setTimeout(() => setTampil(true), delay);

        return () => clearTimeout(id);
    }, [delay]);

    return tampil;
}

export function useMediaQuery(query) {
    const [cocok, setCocok] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false));

    useEffect(() => {
        const mql = window.matchMedia(query);
        const handler = (e) => setCocok(e.matches);

        setCocok(mql.matches);
        mql.addEventListener('change', handler);

        return () => mql.removeEventListener('change', handler);
    }, [query]);

    return cocok;
}

export function useScrollLock(aktif) {
    const counter = useRef(0);

    useEffect(() => {
        if (!aktif) return undefined;

        if (aktif) counter.current++;
        else {
            counter.current = Math.max(0, counter.current - 1);
        }

        const shouldLock = counter.current > 0;
        document.body.style.overflow = shouldLock ? 'hidden' : '';

        return () => {
            if (!aktif) return;
            counter.current = Math.max(0, counter.current - 1);
            document.body.style.overflow = '';
        };
    }, [aktif]);
}
