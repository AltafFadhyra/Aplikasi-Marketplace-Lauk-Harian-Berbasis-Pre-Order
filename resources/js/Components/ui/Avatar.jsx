import { Star } from 'lucide-react';
import { inisial } from '../../lib/format';

export function Avatar({ nama = '', gambar, ukuran = 'md', className = '', badge, onClick }) {
    const kelas = {
        xs: 'size-7 text-[10px]',
        sm: 'size-9 text-xs',
        md: 'size-11 text-sm',
        lg: 'size-14 text-base',
        xl: 'size-20 text-2xl',
    }[ukuran] ?? 'size-11 text-sm';

    return (
        <span className={['relative inline-block shrink-0', className].join(' ')}>
            <span
                onClick={onClick}
                className={[
                    kelas,
                    'grid place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-powder-400 to-powder-600',
                    'font-bold text-white shadow-[0_4px_12px_-4px_rgba(109,156,210,0.7)]',
                    onClick ? 'cursor-pointer transition-transform hover:scale-105' : '',
                ].join(' ')}
            >
                {gambar ? (
                    <img
                        src={gambar}
                        alt={nama}
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                        className="size-full object-cover"
                    />
                ) : (
                    inisial(nama)
                )}
            </span>
            {badge ? <span className="absolute -right-0.5 -bottom-0.5">{badge}</span> : null}
        </span>
    );
}

export function Rating({ nilai = 0, jumlah = null, ukuran = 'sm', tampilAngka = true, className = '' }) {
    const kelas = { xs: 'size-3', sm: 'size-3.5', md: 'size-4', lg: 'size-5' }[ukuran] ?? 'size-3.5';

    return (
        <span className={['inline-flex items-center gap-1.5', className].join(' ')}>
            <span className="inline-flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => {
                    const penuh = i + 1 <= Math.round(nilai);

                    return (
                        <Star
                            key={i}
                            className={[kelas, penuh ? 'fill-butter-400 text-butter-400' : 'fill-slate-200 text-slate-200'].join(' ')}
                            strokeWidth={1.5}
                        />
                    );
                })}
            </span>
            {tampilAngka ? <span className="text-xs font-bold text-navy-700">{Number(nilai).toFixed(1)}</span> : null}
            {jumlah !== null ? <span className="text-xs text-navy-400">({jumlah})</span> : null}
        </span>
    );
}

export function AvatarGroup({ nama = [], ukuran = 'sm', maksimal = 3 }) {
    const tampil = nama.slice(0, maksimal);
    const sisa = nama.length - tampil.length;

    return (
        <div className="flex items-center -space-x-2">
            {tampil.map((n, i) => (
                <Avatar key={i} nama={n} ukuran={ukuran} className="ring-2 ring-white" />
            ))}
            {sisa > 0 ? (
                <span className="grid size-9 place-items-center rounded-2xl bg-navy-900 text-[10px] font-bold text-white ring-2 ring-white">
                    +{sisa}
                </span>
            ) : null}
        </div>
    );
}
