import { ALUR_STATUS_PESANAN, indeksStatus, STATUS_PESANAN } from '../../lib/constants';
import { jam, waktuLengkap } from '../../lib/format';

export function StepperStatus({ status, timeline = [], ringkas = false, scrollable = false }) {
    const sekarang = indeksStatus(status);
    const dibatalkan = ['dibatalkan', 'kedaluwarsa'].includes(status);
    const cariWaktu = (key) => timeline.find((t) => t.status === key)?.pada;
    const ketemuTimeline = timeline.length > 0;

    const daftarStatus = (
        <ol
            className={[
                'relative flex',
                ringkas ? 'gap-1' : 'flex-col gap-0 sm:flex-row sm:gap-2',
                scrollable && ringkas ? 'w-max sm:w-full' : '',
            ].join(' ')}
        >
                {ALUR_STATUS_PESANAN.map((s, i) => {
                    const selesai = !dibatalkan && sekarang >= i && sekarang >= 0;
                    const aktif = !dibatalkan && sekarang === i;
                    const waktu = cariWaktu(s.key);

                    return (
                        <li
                            key={s.key}
                            className={[
                                'relative flex',
                                ringkas
                                    ? scrollable
                                        ? 'w-[5.5rem] shrink-0 flex-col items-center text-center sm:w-auto sm:flex-1'
                                        : 'flex-1 flex-col items-center text-center'
                                    : 'flex-1 gap-3 pb-6 last:pb-0 sm:flex-col sm:pb-0',
                            ].join(' ')}
                        >
                            {!ringkas ? (
                                <div className="flex flex-col items-center">
                                    <span
                                        className={[
                                            'grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-bold transition-all duration-500',
                                            selesai
                                                ? 'bg-powder-500 text-white shadow-[0_0_0_4px_rgba(109,156,210,0.18)]'
                                                : aktif
                                                  ? 'bg-white text-powder-600 ring-4 ring-powder-500/25'
                                                  : 'bg-slate-100 text-navy-300',
                                        ].join(' ')}
                                    >
                                        {selesai ? (
                                            <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.6">
                                                <path d="M4 10.5l4 4 8-8.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        ) : (
                                            i + 1
                                        )}
                                    </span>
                                    {i < ALUR_STATUS_PESANAN.length - 1 ? (
                                        <span className="mt-1 hidden h-8 w-0.5 flex-1 rounded-full bg-slate-200 sm:block">
                                            <span
                                                className={['block w-full rounded-full bg-powder-400 transition-all duration-700', selesai ? 'h-full' : 'h-0'].join(' ')}
                                            />
                                        </span>
                                    ) : null}
                                </div>
                            ) : null}

                            <div
                                className={[
                                    'min-w-0',
                                    !ringkas ? 'flex-1 pt-0.5 sm:pt-2' : '',
                                    ringkas && scrollable ? 'relative z-10 pt-4 sm:pt-3' : '',
                                ].join(' ')}
                            >
                                <p
                                    className={[
                                        'text-[13px] font-bold leading-tight',
                                        selesai ? 'text-navy-900' : aktif ? 'text-powder-600' : 'text-navy-300',
                                    ].join(' ')}
                                >
                                    {ringkas ? s.short : s.label}
                                </p>
                                {!ringkas && ketemuTimeline && waktu ? (
                                    <p className="mt-0.5 text-[11px] font-medium text-navy-400">{waktuLengkap(waktu)}</p>
                                ) : null}
                            </div>

                            {ringkas && i < ALUR_STATUS_PESANAN.length - 1 ? (
                                <span
                                    className={[
                                        'absolute h-0.5 rounded-full transition-all duration-500',
                                        scrollable ? 'top-2' : 'top-3.5',
                                        selesai ? 'bg-powder-400' : 'bg-slate-200',
                                    ].join(' ')}
                                    style={
                                        scrollable
                                            ? { left: '50%', width: 'calc(100% + 0.25rem)' }
                                            : { left: `${((i + 1) / ALUR_STATUS_PESANAN.length) * 100}%`, width: `${100 / ALUR_STATUS_PESANAN.length - 4}%` }
                                    }
                                />
                            ) : null}
                        </li>
                    );
                })}
        </ol>
    );

    return (
        <div className="w-full">
            {scrollable ? (
                <div className="-mx-1 overflow-x-auto px-1 pb-1">{daftarStatus}</div>
            ) : (
                daftarStatus
            )}

            {dibatalkan ? (
                <div className="mt-4 flex items-center gap-2 rounded-2xl border border-danger-500/20 bg-danger-50 px-4 py-3">
                    <span className="size-2 rounded-full bg-danger-500" />
                    <p className="text-[13px] font-semibold text-danger-600">
                        Pesanan ini {STATUS_PESANAN[status]?.label.toLowerCase()}.
                    </p>
                </div>
            ) : null}
        </div>
    );
}

export function Timeline({ items = [], className = '' }) {
    if (!items.length) {
        return <p className="text-sm text-navy-400">Belum ada riwayat aktivitas.</p>;
    }

    return (
        <ol className={['relative space-y-5 pl-7', className].join(' ')}>
            <span className="absolute top-2 bottom-2 left-[9px] w-0.5 rounded-full bg-slate-200" />
            {items.map((t, i) => (
                <li key={i} className="relative">
                    <span className="absolute top-1 -left-7 grid size-[19px] place-items-center rounded-full border-2 border-white bg-powder-500 shadow-[0_0_0_3px_rgba(109,156,210,0.18)]">
                        <span className="size-1.5 rounded-full bg-white" />
                    </span>
                    <p className="text-[13px] font-bold text-navy-900">{t.label}</p>
                    <p className="mt-0.5 text-[11px] text-navy-400">
                        {waktuLengkap(t.pada)} · {t.oleh}
                    </p>
                </li>
            ))}
        </ol>
    );
}

export function KotakEta({ eta, label = 'Estimasi tiba' }) {
    if (!eta) return null;

    return (
        <div className="flex items-center gap-3 rounded-2xl border border-powder-200 bg-powder-50/60 px-4 py-3">
            <div className="text-center">
                <p className="text-[10px] font-bold tracking-wide text-powder-600 uppercase">Jam</p>
                <p className="text-lg font-extrabold text-navy-900">{jam(eta)}</p>
            </div>
            <div className="h-8 w-px bg-powder-200" />
            <div>
                <p className="text-[10px] font-bold tracking-wide text-powder-600 uppercase">{label}</p>
                <p className="text-sm font-semibold text-navy-800">{waktuLengkap(eta)}</p>
            </div>
        </div>
    );
}
