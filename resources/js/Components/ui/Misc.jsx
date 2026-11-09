import { ChevronRight } from 'lucide-react';
import { Link } from '@inertiajs/react';

export function PageHeader({ judul, deskripsi, breadcrumbs = [], aksi, ikon: Ikon, children }) {
    return (
        <div className="mb-6">
            {breadcrumbs.length ? <Breadcrumb items={breadcrumbs} /> : null}
            <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                    <h1 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-navy-900 sm:text-2xl">
                        {Ikon ? <Ikon className="size-6 text-powder-500" strokeWidth={2.2} /> : null}
                        {judul}
                    </h1>
                    {deskripsi ? <p className="mt-1 max-w-2xl text-sm text-navy-400">{deskripsi}</p> : null}
                </div>
                {aksi ? <div className="flex shrink-0 flex-wrap items-center gap-2">{aksi}</div> : null}
            </div>
            {children ? <div className="mt-5">{children}</div> : null}
        </div>
    );
}

export function Breadcrumb({ items = [], className = '' }) {
    return (
        <nav aria-label="Remah roti" className={['flex flex-wrap items-center gap-1 text-xs text-navy-400', className].join(' ')}>
            {items.map((item, i) => (
                <span key={i} className="inline-flex items-center gap-1">
                    {i > 0 ? <ChevronRight className="size-3.5 text-navy-300" /> : null}
                    {item.href ? (
                        <Link href={item.href} className="font-medium transition-colors hover:text-powder-600">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="font-semibold text-navy-600">{item.label}</span>
                    )}
                </span>
            ))}
        </nav>
    );
}

export function SectionHeading({ judul, deskripsi, aksi, ikon: Ikon, className = '', ukuran = 'md' }) {
    const gaya = ukuran === 'lg' ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg';

    return (
        <div className={['mb-4 flex items-end justify-between gap-4', className].join(' ')}>
            <div className="min-w-0">
                <h2 className={['flex items-center gap-2 font-extrabold tracking-tight text-navy-900', gaya].join(' ')}>
                    {Ikon ? <Ikon className="size-5 text-powder-500" strokeWidth={2.2} /> : null}
                    {judul}
                </h2>
                {deskripsi ? <p className="mt-0.5 text-sm text-navy-400">{deskripsi}</p> : null}
            </div>
            {aksi ? <div className="shrink-0">{aksi}</div> : null}
        </div>
    );
}

export function FilterChip({ aktif, children, onClick, ikon: Ikon, jumlah = null }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-semibold',
                'transition-all duration-250 active:scale-95',
                aktif
                    ? 'border-powder-500 bg-powder-500 text-white shadow-[0_6px_16px_-6px_rgba(109,156,210,0.9)]'
                    : 'border-slate-200 bg-white text-navy-600 hover:border-powder-300 hover:bg-powder-50/60',
            ].join(' ')}
        >
            {Ikon ? <Ikon className="size-3.5" strokeWidth={2.4} /> : null}
            {children}
            {jumlah !== null ? (
                <span className={['rounded-full px-1.5 text-[10px] font-bold', aktif ? 'bg-white/25' : 'bg-slate-100 text-navy-500'].join(' ')}>
                    {jumlah}
                </span>
            ) : null}
        </button>
    );
}

export function PriceTag({ harga, ukuran = 'md', coret = false, className = '' }) {
    const gaya = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-xl',
        xl: 'text-2xl',
    }[ukuran];

    return (
        <span className={['inline-flex items-baseline gap-0.5 font-extrabold', className].join(' ')}>
            <span className={['tracking-tight', coret ? 'text-navy-300 line-through' : 'text-navy-900', gaya].join(' ')}>
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(harga)}
            </span>
        </span>
    );
}

export function InfoRow({ label, nilai, ikon: Ikon, className = '' }) {
    return (
        <div className={['flex items-start justify-between gap-4 py-2.5', className].join(' ')}>
            <span className="inline-flex shrink-0 items-center gap-2 text-[13px] text-navy-400">
                {Ikon ? <Ikon className="size-4" strokeWidth={2.2} /> : null}
                {label}
            </span>
            <span className="text-right text-[13px] font-semibold text-navy-800">{nilai}</span>
        </div>
    );
}

export function AvatarRingkas({ items = [], label, className = '' }) {
    return (
        <span className={['inline-flex items-center gap-2', className].join(' ')}>
            <span className="flex -space-x-2">
                {items.slice(0, 3).map((src, i) => (
                    <img
                        key={i}
                        src={src}
                        alt=""
                        className="size-7 rounded-full border-2 border-white object-cover shadow-sm"
                    />
                ))}
            </span>
            <span className="text-[11px] font-medium text-navy-400">{label}</span>
        </span>
    );
}
