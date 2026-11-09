import { FileText, Trash2, UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';
import { MAKS_UKURAN_BERKAS, validasiBerkas } from '../../lib/validation';

function ukuranReadable(byte) {
    if (!byte) return '0 KB';

    return `${(byte / 1024).toFixed(0)} KB`;
}

export function ImageUploader({ label, keterangan, berkas, onUbah, galat, wajib = false, banyak = false }) {
    const inputRef = useRef(null);
    const [masalah, setMasalah] = useState(null);

    function tangani(list) {
        const pilihan = Array.from(list ?? []);

        if (!pilihan.length) return;

        const validasi = pilihan.map((b) => validasiBerkas(b)).filter(Boolean);

        if (validasi.length) {
            setMasalah(`${validasi[0]}${pilihan.length > 1 ? ` (${validasi.length} berkas bermasalah)` : ''}`);

            return;
        }

        setMasalah(null);
        onUbah(banyak ? pilihan : pilihan[0]);
    }

    const daftar = banyak ? (Array.isArray(berkas) ? berkas : []) : berkas ? [berkas] : [];

    return (
        <div className="space-y-1.5">
            {label ? (
                <div className="flex items-center gap-1">
                    <span className="text-[13px] font-semibold text-navy-700">{label}</span>
                    {wajib ? <span className="text-danger-500">*</span> : null}
                </div>
            ) : null}

            <div
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    tangani(e.dataTransfer.files);
                }}
                className={[
                    'group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-7 text-center',
                    'transition-all duration-200 hover:border-powder-400 hover:bg-powder-50/50',
                    galat || masalah ? 'border-danger-500/60 bg-danger-50/40' : 'border-slate-200 bg-slate-50/60',
                ].join(' ')}
            >
                <span className="grid size-12 place-items-center rounded-2xl bg-white text-powder-500 shadow-[0_4px_14px_-6px_rgba(109,156,210,0.8)] transition-transform group-hover:scale-110">
                    <UploadCloud className="size-6" strokeWidth={2} />
                </span>
                <p className="text-[13px] font-semibold text-navy-700">
                    Ketuk untuk pilih berkas atau seret ke sini
                </p>
                <p className="text-[11px] text-navy-400">
                    {keterangan ?? 'JPG, PNG, WEBP atau PDF · maksimal 2 MB'}
                </p>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                multiple={banyak}
                className="hidden"
                onChange={(e) => tangani(e.target.files)}
            />

            {daftar.length ? (
                <ul className="space-y-2">
                    {daftar.map((b, i) => (
                        <li
                            key={b.name + i}
                            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5"
                        >
                            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-powder-50 text-powder-600">
                                <FileText className="size-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] font-semibold text-navy-800">{b.name}</p>
                                <p className="text-[11px] text-navy-400">{ukuranReadable(b.size)}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => onUbah(banyak ? daftar.filter((_, k) => k !== i) : null)}
                                className="grid size-8 shrink-0 place-items-center rounded-lg text-navy-300 transition-colors hover:bg-danger-50 hover:text-danger-500"
                                aria-label="Hapus berkas"
                            >
                                <Trash2 className="size-4" />
                            </button>
                        </li>
                    ))}
                </ul>
            ) : null}

            {masalah || galat ? <p className="text-xs font-medium text-danger-500">{masalah ?? galat}</p> : null}
        </div>
    );
}

export function InformasiBerkas({ judul, children, ikon: Ikon = FileText, tone = 'powder' }) {
    const nada = {
        powder: 'border-powder-200 bg-powder-50/60 text-navy-700',
        peringatan: 'border-warning-500/25 bg-warning-50 text-navy-700',
        bahaya: 'border-danger-500/25 bg-danger-50 text-navy-700',
        sukses: 'border-success-500/25 bg-success-50 text-navy-700',
    }[tone];

    return (
        <div className={['flex gap-3 rounded-2xl border p-4', nada].join(' ')}>
            <Ikon className="mt-0.5 size-4.5 shrink-0 text-navy-500" strokeWidth={2.2} />
            <div className="min-w-0 flex-1 text-[13px] leading-relaxed">
                {judul ? <p className="mb-0.5 font-bold text-navy-900">{judul}</p> : null}
                {children}
            </div>
        </div>
    );
}

export { MAKS_UKURAN_BERKAS };
export default ImageUploader;
