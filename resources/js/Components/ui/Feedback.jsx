export function Spinner({ className = 'size-5' }) {
    return (
        <span
            role="status"
            aria-label="Memuat"
            className={['inline-block shrink-0 rounded-full border-2 border-current/25 border-t-current animate-spin', className].join(' ')}
        />
    );
}

export function Skeleton({ className = '' }) {
    return <div className={['skeleton rounded-xl', className].join(' ')} aria-hidden="true" />;
}

export function SkeletonTeks({ baris = 3, className = '' }) {
    return (
        <div className={['space-y-2', className].join(' ')} aria-hidden="true">
            {Array.from({ length: baris }).map((_, i) => (
                <Skeleton key={i} className={`h-3.5 ${i === baris - 1 ? 'w-2/3' : 'w-full'}`} />
            ))}
        </div>
    );
}

export function SkeletonKartu({ className = '' }) {
    return (
        <div className={['overflow-hidden rounded-3xl border border-slate-200/80 bg-white', className].join(' ')} aria-hidden="true">
            <Skeleton className="h-40 rounded-none" />
            <div className="space-y-2.5 p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-5 w-20" />
            </div>
        </div>
    );
}

export function Kosong({ judul = 'Belum ada data', deskripsi, ikon: Ikon, aksi, className = '' }) {
    return (
        <div className={['flex flex-col items-center justify-center px-6 py-14 text-center', className].join(' ')}>
            {Ikon ? (
                <span className="mb-4 grid size-16 place-items-center rounded-3xl bg-powder-50 text-powder-400">
                    <Ikon className="size-8" strokeWidth={1.5} />
                </span>
            ) : null}
            <h3 className="text-base font-bold text-navy-800">{judul}</h3>
            {deskripsi ? <p className="mt-1.5 max-w-sm text-sm text-navy-400">{deskripsi}</p> : null}
            {aksi ? <div className="mt-5">{aksi}</div> : null}
        </div>
    );
}

export default Spinner;
