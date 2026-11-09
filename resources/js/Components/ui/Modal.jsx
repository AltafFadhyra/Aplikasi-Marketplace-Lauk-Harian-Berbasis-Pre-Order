import { X } from 'lucide-react';
import { useEffect } from 'react';
import { useScrollLock } from '../../hooks';

export function Modal({ buka, tutup, judul, deskripsi, lebar = 'md', children, footer, ikon: Ikon }) {
    useScrollLock(buka);

    useEffect(() => {
        if (!buka) return undefined;

        // Focus trap: move focus to first focusable element
        const dialog = document.querySelector('dialog');
        if (dialog) {
            const firstFocusable = dialog.querySelector('button, [href], input, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }

        const onKey = (e) => {
            if (e.key === 'Escape') tutup?.();
        };

        window.addEventListener('keydown', onKey);

        return () => {
            window.removeEventListener('keydown', onKey);
            // Restore focus to the element that triggered the modal (stored in ref)
            // For now, just ensure body scroll is unlocked via useScrollLock
        };
    }, [buka, tutup]);

    if (!buka) return null;

    const lebarKelas = {
        xs: 'max-w-sm',
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    }[lebar] ?? 'max-w-lg';

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={judul}>
            <button
                type="button"
                aria-label="Tutup"
                onClick={tutup}
                className="absolute inset-0 animate-fade-in bg-navy-900/45 backdrop-blur-sm"
            />
            <div
                className={[
                    'relative z-10 w-full animate-slide-up overflow-hidden rounded-t-3xl bg-white shadow-lift sm:animate-scale-in sm:rounded-3xl',
                    lebarKelas,
                    'max-h-[92vh] sm:max-h-[88vh]',
                ].join(' ')}
            >
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6 sm:py-5">
                    <div className="flex items-start gap-3">
                        {Ikon ? (
                            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-powder-50 text-powder-600">
                                <Ikon className="size-5" strokeWidth={2.2} />
                            </span>
                        ) : null}
                        <div>
                            <h2 className="text-base font-bold text-navy-900 sm:text-lg">{judul}</h2>
                            {deskripsi ? <p className="mt-0.5 text-sm text-navy-400">{deskripsi}</p> : null}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={tutup}
                        aria-label="Tutup"
                        className="grid size-9 shrink-0 place-items-center rounded-xl text-navy-400 transition-colors hover:bg-slate-100 hover:text-navy-700"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

                {footer ? (
                    <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
                        {footer}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export function Drawer({ buka, tutup, judul, children, footer, sisi = 'kanan', lebar = 'max-w-md' }) {
    useScrollLock(buka);

    if (!buka) return null;

    return (
        <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label={judul}>
            <button type="button" aria-label="Tutup" onClick={tutup} className="absolute inset-0 animate-fade-in bg-navy-900/45 backdrop-blur-sm" />
            <div
                className={[
                    'absolute top-0 bottom-0 flex w-full flex-col bg-white shadow-lift',
                    sisi === 'kanan' ? 'right-0 animate-slide-in' : 'left-0',
                    lebar,
                ].join(' ')}
            >
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <h2 className="text-base font-bold text-navy-900">{judul}</h2>
                    <button
                        type="button"
                        onClick={tutup}
                        aria-label="Tutup"
                        className="grid size-9 place-items-center rounded-xl text-navy-400 transition-colors hover:bg-slate-100"
                    >
                        <X className="size-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">{children}</div>
                {footer ? <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4">{footer}</div> : null}
            </div>
        </div>
    );
}

export default Modal;
