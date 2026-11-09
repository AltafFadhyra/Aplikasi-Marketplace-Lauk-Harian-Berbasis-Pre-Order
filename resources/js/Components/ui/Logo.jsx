export default function Logo({ ukuran = 'md', denganTeks = true, className = '' }) {
    const skala = {
        sm: { kotak: 'size-9', ikon: 'size-5', teks: 'text-base' },
        md: { kotak: 'size-11', ikon: 'size-6', teks: 'text-xl' },
        lg: { kotak: 'size-14', ikon: 'size-8', teks: 'text-2xl' },
        xl: { kotak: 'size-16', ikon: 'size-9', teks: 'text-3xl' },
    }[ukuran] ?? { kotak: 'size-11', ikon: 'size-6', teks: 'text-xl' };

    return (
        <span className={['inline-flex items-center gap-2.5', className].join(' ')}>
            <span
                className={[
                    skala.kotak,
                    'relative grid shrink-0 place-items-center rounded-2xl',
                    'bg-gradient-to-br from-powder-400 via-powder-500 to-navy-700',
                    'shadow-[0_6px_16px_-6px_rgba(109,156,210,0.85)]',
                ].join(' ')}
            >
                <svg viewBox="0 0 24 24" fill="none" className={skala.ikon} aria-hidden="true">
                    <path
                        d="M5 8.5h14M8.5 8.5V6.8A1.8 1.8 0 0110.3 5h3.4a1.8 1.8 0 011.8 1.8v1.7"
                        stroke="white"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                    />
                    <path
                        d="M4 10.2h16l-1.1 7.4A2 2 0 0116.9 19H7.1a2 2 0 01-2-1.4L4 10.2z"
                        stroke="white"
                        strokeWidth="1.7"
                        strokeLinejoin="round"
                    />
                    <path d="M10 13.2v2.4M14 13.2v2.4" stroke="#F5C45E" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-white bg-butter-400" />
            </span>

            {denganTeks ? (
                <span className={['font-extrabold tracking-tight text-navy-900', skala.teks].join(' ')}>
                    Preorder
                    <span className="text-gradient-brand">ly</span>
                </span>
            ) : null}
        </span>
    );
}
