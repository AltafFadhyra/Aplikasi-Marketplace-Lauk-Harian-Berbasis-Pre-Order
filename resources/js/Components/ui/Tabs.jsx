export function Tabs({ tabs = [], aktif, onGanti, className = '', variant = 'pill' }) {
    if (variant === 'underline') {
        return (
            <div className={['no-scrollbar flex gap-1 overflow-x-auto border-b border-slate-200', className].join(' ')} role="tablist">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        type="button"
                        role="tab"
                        aria-selected={aktif === t.key}
                        onClick={() => onGanti(t.key)}
                        className={[
                            'relative shrink-0 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors',
                            aktif === t.key ? 'text-powder-600' : 'text-navy-400 hover:text-navy-700',
                        ].join(' ')}
                    >
                        <span className="inline-flex items-center gap-2">
                            {t.ikon ? <t.ikon className="size-4" strokeWidth={2.2} /> : null}
                            {t.label}
                            {t.jumlah !== undefined ? (
                                <span
                                    className={[
                                        'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                                        aktif === t.key ? 'bg-powder-100 text-powder-700' : 'bg-slate-100 text-navy-400',
                                    ].join(' ')}
                                >
                                    {t.jumlah}
                                </span>
                            ) : null}
                        </span>
                        {aktif === t.key ? (
                            <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-powder-400 to-butter-400" />
                        ) : null}
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div className={['inline-flex gap-1 rounded-2xl bg-slate-100/80 p-1', className].join(' ')} role="tablist">
            {tabs.map((t) => (
                <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={aktif === t.key}
                    onClick={() => onGanti(t.key)}
                    className={[
                        'inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-semibold whitespace-nowrap transition-all duration-300',
                        aktif === t.key
                            ? 'bg-white text-navy-900 shadow-[0_2px_8px_-2px_rgba(15,42,71,0.16)]'
                            : 'text-navy-400 hover:text-navy-700',
                    ].join(' ')}
                >
                    {t.ikon ? <t.ikon className="size-4" strokeWidth={2.2} /> : null}
                    {t.label}
                    {t.jumlah !== undefined ? (
                        <span
                            className={[
                                'rounded-full px-1.5 text-[10px] font-bold',
                                aktif === t.key ? 'bg-powder-100 text-powder-700' : 'bg-slate-200 text-navy-500',
                            ].join(' ')}
                        >
                            {t.jumlah}
                        </span>
                    ) : null}
                </button>
            ))}
        </div>
    );
}

export default Tabs;
