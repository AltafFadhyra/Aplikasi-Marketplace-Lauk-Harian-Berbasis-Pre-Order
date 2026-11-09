const TONE = {
    powder: 'bg-powder-50 text-powder-700 border-powder-200',
    navy: 'bg-navy-50 text-navy-700 border-navy-200',
    butter: 'bg-butter-50 text-butter-700 border-butter-200',
    sukses: 'bg-success-50 text-success-600 border-success-500/20',
    info: 'bg-info-50 text-info-600 border-info-500/20',
    peringatan: 'bg-warning-50 text-warning-600 border-warning-500/20',
    bahaya: 'bg-danger-50 text-danger-600 border-danger-500/20',
    netral: 'bg-slate-100 text-slate-600 border-slate-200',
    gelap: 'bg-navy-900 text-white border-navy-900',
};

const UKURAN = {
    xs: 'px-2 py-0.5 text-[10px] gap-1',
    sm: 'px-2.5 py-1 text-[11px] gap-1',
    md: 'px-3 py-1.5 text-xs gap-1.5',
};

export default function Badge({ children, tone = 'netral', ukuran = 'md', ikon: Ikon, className = '', titik = false }) {
    return (
        <span
            className={[
                'inline-flex items-center rounded-full border font-semibold tracking-wide whitespace-nowrap',
                TONE[tone] ?? TONE.netral,
                UKURAN[ukuran] ?? UKURAN.md,
                className,
            ].join(' ')}
        >
            {titik ? <span className="size-1.5 rounded-full bg-current animate-pulse" /> : null}
            {Ikon ? <Ikon className="size-3" strokeWidth={2.5} /> : null}
            {children}
        </span>
    );
}

export function BadgeDot({ tone = 'sukses', label, className = '' }) {
    const warna = {
        sukses: 'bg-success-500',
        info: 'bg-info-500',
        peringatan: 'bg-warning-500',
        bahaya: 'bg-danger-500',
        netral: 'bg-slate-400',
        powder: 'bg-powder-500',
    }[tone];

    return (
        <span className={['inline-flex items-center gap-1.5 text-xs font-medium text-navy-600', className].join(' ')}>
            <span className={['size-2 rounded-full', warna, tone === 'sukses' ? 'animate-pulse' : ''].join(' ')} />
            {label}
        </span>
    );
}
