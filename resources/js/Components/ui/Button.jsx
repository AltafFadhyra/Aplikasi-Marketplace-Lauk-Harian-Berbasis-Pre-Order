import { forwardRef } from 'react';

const VARIAN = {
    utama:
        'bg-gradient-to-br from-powder-500 to-powder-600 text-white shadow-[0_8px_20px_-6px_rgba(109,156,210,0.65)] hover:shadow-[0_14px_30px_-8px_rgba(109,156,210,0.75)]',
    navy: 'bg-navy-900 text-white shadow-[0_8px_20px_-6px_rgba(15,42,71,0.6)] hover:bg-navy-800 hover:shadow-[0_14px_30px_-8px_rgba(15,42,71,0.7)]',
    butter:
        'bg-gradient-to-br from-butter-300 to-butter-500 text-navy-900 shadow-[0_8px_20px_-6px_rgba(245,196,94,0.7)] hover:shadow-[0_14px_30px_-8px_rgba(245,196,94,0.85)]',
    garis:
        'bg-white text-navy-800 border border-slate-200 shadow-[0_1px_2px_rgba(15,42,71,0.04)] hover:border-powder-300 hover:bg-powder-50/60',
    lembut: 'bg-powder-50 text-powder-700 hover:bg-powder-100',
    bahaya: 'bg-danger-500 text-white shadow-[0_8px_20px_-8px_rgba(239,68,68,0.6)] hover:bg-danger-600',
    sukses: 'bg-success-500 text-white shadow-[0_8px_20px_-8px_rgba(16,185,129,0.6)] hover:bg-success-600',
    ghost: 'bg-transparent text-navy-600 hover:bg-powder-50',
    dark: 'bg-navy-800/80 text-white hover:bg-navy-800 backdrop-blur',
};

const UKURAN = {
    xs: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
    sm: 'h-10 px-4 text-sm gap-2 rounded-xl',
    md: 'h-12 px-6 text-sm gap-2 rounded-2xl',
    lg: 'h-14 px-8 text-base gap-2.5 rounded-2xl',
};

const UKURAN_IKON = {
    xs: 'size-3.5',
    sm: 'size-4',
    md: 'size-4',
    lg: 'size-5',
};

const Button = forwardRef(function Button(
    {
        children,
        varian = 'utama',
        ukuran = 'md',
        className = '',
        memuat = false,
        lebarPenuh = false,
        disabled = false,
        type = 'button',
        ikon: Ikon,
        as,
        ...props
    },
    ref,
) {
    const Elemen = as ?? 'button';
    const nonaktif = disabled || memuat;

    return (
        <Elemen
            ref={ref}
            {...(Elemen === 'button'
                ? { type, disabled: nonaktif }
                : nonaktif
                  ? { 'aria-disabled': true }
                  : {})}
            className={[
                'group relative inline-flex items-center justify-center font-semibold',
                'transition-all duration-300 ease-out select-none',
                'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-powder-500/25',
                'active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none',
                'hover:-translate-y-0.5',
                VARIAN[varian] ?? VARIAN.utama,
                UKURAN[ukuran] ?? UKURAN.md,
                lebarPenuh ? 'w-full' : '',
                Elemen !== 'button' && nonaktif ? 'opacity-50 pointer-events-none' : '',
                className,
            ].join(' ')}
            {...props}
        >
            {memuat ? (
                <span className="size-4 shrink-0 rounded-full border-2 border-current/30 border-t-current animate-spin" />
            ) : null}
            {memuat ? <span className="sr-only">Memproses</span> : null}
            <span className={`inline-flex items-center gap-2 ${memuat ? 'opacity-70' : ''}`}>
                {Ikon ? <Ikon className={UKURAN_IKON[ukuran] ?? UKURAN_IKON.md} strokeWidth={2.4} /> : null}
                {children}
            </span>
        </Elemen>
    );
});

export default Button;
export { VARIAN as VARIAN_TOMBOL };
