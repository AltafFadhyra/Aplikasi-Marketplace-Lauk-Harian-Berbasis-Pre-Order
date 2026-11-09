export default function Card({ children, className = '', hover = false, elevate = false, as: Tag = 'div', ...props }) {
    return (
        <Tag
            className={[
                'rounded-3xl border border-slate-200/80 bg-white',
                'shadow-[0_1px_2px_rgba(15,42,71,0.04),0_8px_24px_-6px_rgba(15,42,71,0.1)]',
                hover
                    ? 'transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(15,42,71,0.06),0_20px_44px_-14px_rgba(15,42,71,0.2)]'
                    : '',
                elevate ? 'shadow-[0_2px_4px_rgba(15,42,71,0.06),0_24px_56px_-18px_rgba(15,42,71,0.28)]' : '',
                className,
            ].join(' ')}
            {...props}
        >
            {children}
        </Tag>
    );
}

export function CardHeader({ judul, deskripsi, aksi, ikon: Ikon, className = '' }) {
    return (
        <div className={['flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6', className].join(' ')}>
            <div className="flex items-start gap-3">
                {Ikon ? (
                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-powder-50 text-powder-600">
                        <Ikon className="size-5" strokeWidth={2.2} />
                    </span>
                ) : null}
                <div>
                    <h3 className="text-base font-bold text-navy-900 sm:text-lg">{judul}</h3>
                    {deskripsi ? <p className="mt-0.5 text-sm text-navy-400">{deskripsi}</p> : null}
                </div>
            </div>
            {aksi ? <div className="shrink-0">{aksi}</div> : null}
        </div>
    );
}

export function CardBody({ children, className = '' }) {
    return <div className={['px-5 py-5 sm:px-6', className].join(' ')}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
    return (
        <div
            className={[
                'flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:px-6',
                className,
            ].join(' ')}
        >
            {children}
        </div>
    );
}

export function CardGambar({ src, alt, className = '', children, tinggi = 'h-44' }) {
    return (
        <div className={['relative overflow-hidden bg-powder-50', tinggi, className].join(' ')}>
            <img
                src={src}
                alt={alt}
                loading="lazy"
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                }}
                className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            {children}
        </div>
    );
}
