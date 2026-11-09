import { TrendingDown, TrendingUp } from 'lucide-react';

const TONE = {
    powder: 'from-powder-400/15 to-powder-500/5 text-powder-600 bg-powder-500/10',
    butter: 'from-butter-300/25 to-butter-500/5 text-butter-700 bg-butter-400/15',
    sukses: 'from-success-500/15 to-success-500/5 text-success-600 bg-success-500/10',
    bahaya: 'from-danger-500/15 to-danger-500/5 text-danger-600 bg-danger-500/10',
    navy: 'from-navy-600/15 to-navy-800/5 text-navy-700 bg-navy-900/10',
};

export function StatCard({ label, nilai, keterangan, ikon: Ikon, tone = 'powder', tren, trenNaik = true, className = '' }) {
    return (
        <div
            className={[
                'group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5',
                'shadow-[0_1px_2px_rgba(15,42,71,0.04),0_8px_24px_-6px_rgba(15,42,71,0.1)]',
                'transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(15,42,71,0.06),0_20px_44px_-14px_rgba(15,42,71,0.2)]',
                className,
            ].join(' ')}
        >
            <span
                className={[
                    'pointer-events-none absolute -top-8 -right-8 size-24 rounded-full bg-gradient-to-br opacity-70 blur-2xl transition-transform duration-500 group-hover:scale-125',
                    TONE[tone] ?? TONE.powder,
                ].join(' ')}
            />

            <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[11px] font-bold tracking-wider text-navy-400 uppercase">{label}</p>
                    <p className="mt-1.5 truncate text-2xl font-extrabold tracking-tight text-navy-900 sm:text-[28px]">{nilai}</p>
                </div>
                {Ikon ? (
                    <span className={['grid size-11 shrink-0 place-items-center rounded-2xl', TONE[tone] ?? TONE.powder].join(' ')}>
                        <Ikon className="size-5" strokeWidth={2.2} />
                    </span>
                ) : null}
            </div>

            {keterangan || tren ? (
                <div className="relative mt-3 flex items-center gap-2">
                    {tren ? (
                        <span
                            className={[
                                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold',
                                trenNaik ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600',
                            ].join(' ')}
                        >
                            {trenNaik ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                            {tren}
                        </span>
                    ) : null}
                    {keterangan ? <p className="truncate text-[11px] text-navy-400">{keterangan}</p> : null}
                </div>
            ) : null}
        </div>
    );
}

export function ProgressBar({ nilai, maks = 100, tone = 'powder', label, className = '' }) {
    const persen = Math.min(100, Math.max(0, (nilai / (maks || 1)) * 100));
    const warna = {
        powder: 'from-powder-400 to-powder-600',
        butter: 'from-butter-300 to-butter-500',
        sukses: 'from-success-400 to-success-600',
        bahaya: 'from-danger-400 to-danger-600',
    }[tone];

    return (
        <div className={['space-y-1.5', className].join(' ')}>
            {label ? (
                <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-navy-500">{label}</span>
                    <span className="text-navy-800">{Math.round(persen)}%</span>
                </div>
            ) : null}
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                    className={['h-full rounded-full bg-gradient-to-r transition-all duration-700', warna].join(' ')}
                    style={{ width: `${persen}%` }}
                />
            </div>
        </div>
    );
}

export function GrafikBatang({ data = [], className = '', tinggi = 'h-32' }) {
    const maks = Math.max(...data.map((d) => d.nilai), 1);

    return (
        <div className={['flex items-end gap-1.5 sm:gap-2', tinggi, className].join(' ')}>
            {data.map((d, i) => (
                <div key={i} className="group flex flex-1 flex-col items-center gap-1.5">
                    <span className="pointer-events-none rounded-lg bg-navy-900 px-2 py-1 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                        {d.nilai}
                    </span>
                    <div
                        className={[
                            'w-full rounded-t-xl bg-gradient-to-t from-powder-500 to-powder-300 transition-all duration-500',
                            'group-hover:from-butter-400 group-hover:to-butter-300',
                        ].join(' ')}
                        style={{ height: `${Math.max(6, (d.nilai / maks) * 100)}%` }}
                    />
                    <span className="text-[10px] font-semibold text-navy-400">{d.label}</span>
                </div>
            ))}
        </div>
    );
}

export function GrafikGaris({ data = [], tinggi = 'h-40' }) {
    if (!data.length) return null;

    const maks = Math.max(...data.map((d) => d.nilai), 1);
    const titik = data.map((d, i) => {
        const x = (i / Math.max(1, data.length - 1)) * 100;
        const y = 100 - (d.nilai / maks) * 100;

        return `${x},${y}`;
    });
    const garis = titik.join(' ');

    return (
        <div className={['relative w-full', tinggi, className].join(' ')}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="size-full overflow-visible">
                <defs>
                    <linearGradient id="grad-garis" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6D9CD2" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#6D9CD2" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {[25, 50, 75].map((y) => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#E2E8F0" strokeWidth="0.4" strokeDasharray="2 2" />
                ))}
                <polygon points={`0,100 ${garis} 100,100`} fill="url(#grad-garis)" />
                <polyline
                    points={garis}
                    fill="none"
                    stroke="#6D9CD2"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                />
                {titik.map((t, i) => {
                    const [x, y] = t.split(',');

                    return (
                        <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="1.6"
                            fill="#fff"
                            stroke="#6D9CD2"
                            strokeWidth="1.2"
                            vectorEffect="non-scaling-stroke"
                        />
                    );
                })}
            </svg>
        </div>
    );
}

export default StatCard;
