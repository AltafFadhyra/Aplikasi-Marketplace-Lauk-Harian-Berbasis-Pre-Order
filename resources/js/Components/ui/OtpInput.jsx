import { useEffect, useRef } from 'react';

export function OtpInput({ panjang = 6, nilai, onUbah, galat, disabled = false, autoFokus = true }) {
    const refs = useRef([]);

    useEffect(() => {
        if (autoFokus) refs.current[0]?.focus();
    }, [autoFokus]);

    const digit = (v) => String(v).replace(/\D/g, '');

    function onKetik(i, e) {
        const nilaiTerbaru = digit(e.target.value).slice(-1);

        // Jika backspace pada field kosong, fokus ke field sebelumnya tanpa merubah nilai
        if (!nilaiTerbaru && i > 0) {
            refs.current[i - 1]?.focus();
            onUbah(nilai);
            return;
        }

        const baru = [...nilai];
        baru[i] = nilaiTerbaru || '';
        const gabungan = baru.join('').slice(0, panjang);

        onUbah(gabungan);

        if (nilaiTerbaru && i < panjang - 1) {
            refs.current[i + 1]?.focus();
        }
    }

    function onKeyDown(i, e) {
        if (e.key === 'Backspace' && !nilai[i] && i > 0) {
            refs.current[i - 1]?.focus();
        }

        if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
        if (e.key === 'ArrowRight' && i < panjang - 1) refs.current[i + 1]?.focus();
    }

    function onPaste(e) {
        e.preventDefault();
        const tempel = digit(e.clipboardData.getData('text')).slice(0, panjang);

        onUbah(tempel);
        refs.current[Math.min(tempel.length, panjang - 1)]?.focus();
    }

    return (
        <div className="w-full">
            <div className="flex justify-center gap-2 sm:gap-3">
                {Array.from({ length: panjang }).map((_, i) => {
                    const terisi = nilai[i];

                    return (
                        <input
                            key={i}
                            ref={(el) => {
                                refs.current[i] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            autoComplete={i === 0 ? 'one-time-code' : 'off'}
                            maxLength={1}
                            value={terisi ?? ''}
                            disabled={disabled}
                            onChange={(e) => onKetik(i, e)}
                            onKeyDown={(e) => onKeyDown(i, e)}
                            onPaste={onPaste}
                            aria-label={`Digit OTP ke-${i + 1}`}
                            className={[
                                'size-12 rounded-2xl border-2 bg-white text-center text-xl font-extrabold text-navy-900 sm:size-14 sm:text-2xl',
                                'transition-all duration-200 outline-none',
                                'focus:border-powder-500 focus:ring-4 focus:ring-powder-500/15 focus:scale-105',
                                terisi ? 'border-powder-400 bg-powder-50/40' : 'border-slate-200',
                                galat ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/15' : '',
                                disabled ? 'cursor-not-allowed opacity-50' : '',
                            ].join(' ')}
                        />
                    );
                })}
            </div>
            {galat ? <p className="mt-2.5 text-center text-xs font-semibold text-danger-500">{galat}</p> : null}
        </div>
    );
}

export default OtpInput;
