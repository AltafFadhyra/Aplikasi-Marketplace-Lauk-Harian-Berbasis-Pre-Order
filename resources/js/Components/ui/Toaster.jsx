import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useDemo } from '../../stores/DemoContext';

const GAYA = {
    sukses: { ikon: CheckCircle2, kelas: 'border-success-500/25 bg-white', warna: 'text-success-500', nada: 'bg-success-50' },
    info: { ikon: Info, kelas: 'border-powder-300 bg-white', warna: 'text-powder-600', nada: 'bg-powder-50' },
    galat: { ikon: XCircle, kelas: 'border-danger-500/25 bg-white', warna: 'text-danger-500', nada: 'bg-danger-50' },
    peringataan: { ikon: AlertTriangle, kelas: 'border-warning-500/25 bg-white', warna: 'text-warning-600', nada: 'bg-warning-50' },
    error: { ikon: XCircle, kelas: 'border-danger-500/25 bg-white', warna: 'text-danger-500', nada: 'bg-danger-50' },
};

export function Toaster() {
    const { toast, hapusToast } = useDemo();

    if (!toast.length) return null;

    // Batas maksimal toast yang tampil sekaligus (hindari stack menutupi viewport)
    const toastTampil = toast.slice(-3);

    return (
        <div className="pointer-events-none fixed inset-x-0 top-3 z-[200] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-5 sm:top-5 sm:items-end sm:px-0">
            {toastTampil.map((t) => {
                const g = GAYA[t.jenis] ?? GAYA.info;
                const Ikon = g.ikon;

                return (
                    <div
                        key={t.id}
                        role="status"
                        className={[
                            'pointer-events-auto flex w-full max-w-sm animate-slide-up items-start gap-3 rounded-2xl border p-3.5',
                            'shadow-[0_2px_4px_rgba(15,42,71,0.06),0_18px_40px_-14px_rgba(15,42,71,0.28)]',
                            g.kelas,
                        ].join(' ')}
                    >
                        <span className={['grid size-9 shrink-0 place-items-center rounded-xl', g.nada, g.warna].join(' ')}>
                            <Ikon className="size-[18px]" strokeWidth={2.4} />
                        </span>
                        <div className="min-w-0 flex-1 pt-0.5">
                            {t.judul ? <p className="text-[13px] font-bold text-navy-900">{t.judul}</p> : null}
                            <p className="text-[13px] leading-snug text-navy-600">{t.pesan}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => hapusToast(t.id)}
                            aria-label="Tutup notifikasi"
                            className="grid size-7 shrink-0 place-items-center rounded-lg text-navy-300 transition-colors hover:bg-slate-100 hover:text-navy-600"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

export default Toaster;
