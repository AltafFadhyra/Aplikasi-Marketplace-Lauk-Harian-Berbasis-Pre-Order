import { Link, router } from '@inertiajs/react';
import { Clock, MapPin, Search, UtensilsCrossed, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDebounce } from '../../hooks';
import { useDemo } from '../../stores/DemoContext';

const SaranCepat = ['Nasi goreng', 'Soto ayam', 'Ayam geprek', 'Katering kantor', 'Rendang', 'Es kopi susu'];

export default function SearchBar({
    ringkas = false,
    onSubmit,
    placeholder = 'Cari restoran, menu, atau masak apa hari ini?',
}) {
    const { seed: demo } = useDemo();
    const [q, setQ] = useState('');
    const [terbuka, setTerbuka] = useState(false);
    const qTerlambat = useDebounce(q, 250);
    const bungkusRef = useRef(null);

    const [hasil, setHasil] = useState([]);

    useEffect(() => {
        const needle = qTerlambat.trim().toLowerCase();

        if (needle.length < 2) {
            setHasil([]);

            return;
        }

        const resto = (demo?.restoran ?? [])
            .filter(
                (r) =>
                    r.nama.toLowerCase().includes(needle) ||
                    (r.deskripsi ?? '').toLowerCase().includes(needle),
            )
            .slice(0, 4)
            .map((r) => ({
                tipe: 'restoran',
                label: r.nama,
                sub: `${r.kategori ?? 'Restoran'} · ${r.jarak_km ?? 0} km`,
                href: `/cari/restoran/${r.slug}`,
            }));

        const menu = (demo?.restoran ?? [])
            .flatMap((r) => r.menu.map((m) => ({ m, r })))
            .filter(({ m }) => m.nama.toLowerCase().includes(needle))
            .slice(0, 5)
            .map(({ m, r }) => ({
                tipe: 'menu',
                label: m.nama,
                sub: r.nama,
                href: `/cari/menu/${m.id}`,
            }));

        setHasil([...resto, ...menu]);
    }, [qTerlambat, demo]);

    useEffect(() => {
        function klikLuar(e) {
            if (bungkusRef.current && !bungkusRef.current.contains(e.target)) setTerbuka(false);
        }

        document.addEventListener('mousedown', klikLuar);

        return () => document.removeEventListener('mousedown', klikLuar);
    }, []);

    function kirim(e) {
        e?.preventDefault();

        if (!q.trim()) return;

        setTerbuka(false);

        if (onSubmit) onSubmit(q);
        else router.replace(`/cari?q=${encodeURIComponent(q)}`);
    }

    function pilihSaran(teks) {
        setQ(teks);
        setTerbuka(false);
        router.replace(`/cari?q=${encodeURIComponent(teks)}`);
    }

    return (
        <div ref={bungkusRef} className={['relative', ringkas ? 'w-full' : 'w-full max-w-xl'].join(' ')}>
            <form onSubmit={kirim} role="search">
                <div
                    className={[
                        'group relative flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white',
                        'shadow-[0_1px_2px_rgba(15,42,71,0.04),0_6px_18px_-8px_rgba(15,42,71,0.14)]',
                        'transition-all duration-300',
                        'focus-within:border-powder-400 focus-within:ring-4 focus-within:ring-powder-500/12',
                        terbuka ? 'ring-4 ring-powder-500/10' : '',
                    ].join(' ')}
                >
                    <Search className="pointer-events-none ml-3.5 size-[18px] shrink-0 text-navy-300" strokeWidth={2.2} />
                    <input
                        value={q}
                        onChange={(e) => {
                            setQ(e.target.value);
                            setTerbuka(true);
                        }}
                        onFocus={() => setTerbuka(true)}
                        placeholder={placeholder}
                        aria-label="Cari"
                        className={[
                            'h-12 w-full bg-transparent text-sm text-navy-900 placeholder:text-navy-300 outline-none',
                            ringkas ? 'pr-3' : 'pr-24',
                        ].join(' ')}
                    />
                    {q ? (
                        <button
                            type="button"
                            onClick={() => setQ('')}
                            aria-label="Bersihkan pencarian"
                            className="grid size-7 shrink-0 place-items-center rounded-lg text-navy-300 hover:bg-slate-100"
                        >
                            <X className="size-4" />
                        </button>
                    ) : null}
                    {!ringkas ? (
                        <button
                            type="submit"
                            className="mr-1.5 hidden shrink-0 rounded-xl bg-gradient-to-br from-powder-500 to-powder-600 px-4 py-2.5 text-xs font-bold text-white shadow-[0_6px_16px_-6px_rgba(109,156,210,0.9)] transition-transform active:scale-95 sm:block"
                        >
                            Cari
                        </button>
                    ) : null}
                </div>
            </form>

            {terbuka ? (
                <div className="glass-strong absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-2xl p-2 animate-scale-in">
                    {!q ? (
                        <>
                            <p className="px-2.5 pt-1.5 pb-2 text-[10px] font-bold tracking-wider text-navy-400 uppercase">
                                Pencarian populer
                            </p>
                            <div className="flex flex-wrap gap-1.5 px-1 pb-1.5">
                                {SaranCepat.map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => pilihSaran(s)}
                                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-600 transition-colors hover:border-powder-300 hover:bg-powder-50"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-1 flex items-start gap-2.5 rounded-xl bg-powder-50/70 px-3 py-2.5">
                                <Clock className="mt-0.5 size-3.5 shrink-0 text-powder-600" />
                                <p className="text-[11px] leading-relaxed text-navy-500">
                                    Pre-order bisa dilakukan maksimal 3 hari ke depan. Pesan hari ini untuk diantar besok
                                    subuh.
                                </p>
                            </div>
                        </>
                    ) : hasil.length ? (
                        <ul className="max-h-96 overflow-y-auto">
                            {hasil.map((h, i) => (
                                <li key={i}>
                                    <Link
                                        href={h.href}
                                        onClick={() => setTerbuka(false)}
                                        className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-powder-50/80"
                                    >
                                        <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-powder-50 text-powder-600">
                                            {h.tipe === 'restoran' ? (
                                                <MapPin className="size-4" />
                                            ) : (
                                                <UtensilsCrossed className="size-4" />
                                            )}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-[13px] font-bold text-navy-900">
                                                {h.label}
                                            </span>
                                            <span className="block truncate text-[11px] text-navy-400">{h.sub}</span>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="px-3 py-6 text-center text-sm text-navy-400">
                            Tidak ada hasil untuk <span className="font-bold text-navy-600">“{q}”</span>.
                        </p>
                    )}
                </div>
            ) : null}
        </div>
    );
}
