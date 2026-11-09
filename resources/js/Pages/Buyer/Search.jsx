import { Head, Link, router, usePage } from '@inertiajs/react';
import { Bike, Clock3, MapPin, SlidersHorizontal, Star, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { MenuGrid } from '../../Components/buyer/MenuCard';
import SearchBar from '../../Components/layout/SearchBar';
import { FilterChip } from '../../Components/ui/Misc';
import { Kosong } from '../../Components/ui/Feedback';
import Badge from '../../Components/ui/Badge';
import Card from '../../Components/ui/Card';
import AppLayout from '../../Layouts/AppLayout';
import { rupiah } from '../../lib/format';
import { useDemo } from '../../stores/DemoContext';

const URUTAN = [
    { key: 'rekomendasi', label: 'Rekomendasi' },
    { key: 'rating', label: 'Rating tertinggi' },
    { key: 'terlaris', label: 'Paling laris' },
    { key: 'terdekat', label: 'Terdekat' },
    { key: 'harga_asc', label: 'Harga termurah' },
    { key: 'harga_desc', label: 'Harga termahal' },
];

const FILTER = [
    { key: 'semua', label: 'Semua' },
    { key: 'gratis_ongkir', label: 'Gratis ongkir' },
    { key: 'buka', label: 'Sedang buka' },
    { key: 'preorder', label: 'Khas pre-order' },
    { key: 'rating_45', label: 'Rating 4.5+' },
];

export default function Search() {
    const { filterAwal } = usePage().props;
    const { seed } = useDemo();

    const [q, setQ] = useState(filterAwal?.q ?? '');
    const [kategori, setKategori] = useState(filterAwal?.kategori ?? '');
    const [urutkan, setUrutkan] = useState(filterAwal?.urutkan || 'rekomendasi');
    const [filter, setFilter] = useState('semua');
    const [kentang, setKentang] = useState(false);

    const semuaRestoran = seed.restoran ?? [];
    const semuaKategori = seed.kategori ?? [];

    // Sinkronkan ke URL supaya hasil bisa dibagikan/di-bookmark.
    useEffect(() => {
        const p = new URLSearchParams();

        if (q) p.set('q', q);
        if (kategori) p.set('kategori', kategori);
        if (urutkan !== 'rekomendasi') p.set('urutkan', urutkan);

        const qs = p.toString();

        router.replace(qs ? `/cari?${qs}` : '/cari');
    }, [q, kategori, urutkan]);

    const hasil = useMemo(() => {
        const needle = q.trim().toLowerCase();

        let resto = semuaRestoran.filter((r) => {
            if (kategori && r.kategori_slug !== kategori) return false;

            if (filter === 'gratis_ongkir' && !r.gratis_ongkir) return false;
            if (filter === 'buka' && !r.buka) return false;
            if (filter === 'rating_45' && r.rating < 4.5) return false;
            if (filter === 'preorder' && !r.menu.some((m) => m.hanya_preorder)) return false;

            if (!needle) return true;

            const cocokTeks =
                r.nama.toLowerCase().includes(needle) ||
                (r.deskripsi ?? '').toLowerCase().includes(needle) ||
                r.kategori?.toLowerCase().includes(needle) ||
                r.menu.some((m) => m.nama.toLowerCase().includes(needle));

            return cocokTeks;
        });

        const pengurut = {
            rating: (a, b) => b.rating - a.rating,
            terlaris: (a, b) => b.terjual - a.terjual,
            terdekat: (a, b) => (a.jarak_km ?? 99) - (b.jarak_km ?? 99),
            harga_asc: (a, b) => (a.menu[0]?.harga ?? 0) - (b.menu[0]?.harga ?? 0),
            harga_desc: (a, b) => (b.menu[0]?.harga ?? 0) - (a.menu[0]?.harga ?? 0),
        };

        if (pengurut[urutkan]) resto = [...resto].sort(pengurut[urutkan]);

        return resto;
    }, [semuaRestoran, q, kategori, urutkan, filter]);

    const totalMenu = hasil.reduce((t, r) => t + r.menu.length, 0);
    const adaFilter = q || kategori || filter !== 'semua' || urutkan !== 'rekomendasi';

    return (
        <AppLayout>
            <Head title="Cari Makanan" />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
                <div className="mb-5">
                    <h1 className="text-xl font-extrabold text-navy-900 sm:text-2xl">
                        {q ? `Hasil untuk "${q}"` : 'Jelajahi restoran & menu'}
                    </h1>
                    <p className="mt-1 text-[13px] text-navy-400">
                        {hasil.length} restoran · {totalMenu} menu tersedia untuk dipesan
                    </p>
                </div>

                <div className="mb-5 space-y-3">
                    <SearchBar
                        ringkas
                        onSubmit={(v) => {
                            setQ(v);
                            setKentang(true);
                        }}
                        placeholder="Cari nama restoran atau menu..."
                    />

                    {/* Kategori */}
                    <ul className="flex gap-2 overflow-x-auto pb-1">
                        <li className="shrink-0">
                            <FilterChip
                                aktif={!kategori}
                                onClick={() => {
                                    setKategori('');
                                    setKentang(true);
                                }}
                            >
                                Semua kategori
                            </FilterChip>
                        </li>
                        {semuaKategori.map((k) => (
                            <li key={k.id} className="shrink-0">
                                <FilterChip
                                    aktif={kategori === k.slug}
                                    onClick={() => {
                                        setKategori(kategori === k.slug ? '' : k.slug);
                                        setKentang(true);
                                    }}
                                >
                                    {k.nama}
                                </FilterChip>
                            </li>
                        ))}
                    </ul>

                    {/* Filter lanjutan */}
                    <ul className="flex flex-wrap items-center gap-2">
                        {FILTER.map((f) => (
                            <li key={f.key}>
                                <FilterChip
                                    aktif={filter === f.key}
                                    onClick={() => {
                                        setFilter(f.key);
                                        setKentang(true);
                                    }}
                                >
                                    {f.label}
                                </FilterChip>
                            </li>
                        ))}

                        <li className="ml-auto">
                            <label className="flex items-center gap-2 text-[12px] font-semibold text-navy-500">
                                <SlidersHorizontal className="size-3.5" />
                                <select
                                    value={urutkan}
                                    onChange={(e) => {
                                        setUrutkan(e.target.value);
                                        setKentang(true);
                                    }}
                                    className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-navy-700 outline-none focus:border-powder-400"
                                >
                                    {URUTAN.map((u) => (
                                        <option key={u.key} value={u.key}>
                                            {u.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </li>
                    </ul>

                    {adaFilter ? (
                        <button
                            type="button"
                            onClick={() => {
                                setQ('');
                                setKategori('');
                                setFilter('semua');
                                setUrutkan('rekomendasi');
                            }}
                            className="inline-flex items-center gap-1 text-[12px] font-bold text-powder-600 hover:underline"
                        >
                            <X className="size-3.5" />
                            Reset semua filter
                        </button>
                    ) : null}
                </div>

                {!hasil.length ? (
                    <Kosong
                        ikon={MapPin}
                        judul="Restoran tidak ditemukan"
                        deskripsi="Coba kata kunci lain atau hapus filter yang aktif."
                        aksi={
                            <button
                                type="button"
                                onClick={() => {
                                    setQ('');
                                    setKategori('');
                                    setFilter('semua');
                                }}
                                className="rounded-2xl bg-powder-500 px-4 py-2.5 text-[13px] font-bold text-white"
                            >
                                Hapus filter
                            </button>
                        }
                        className="rounded-3xl border border-white/70 bg-white/70"
                    />
                ) : (
                    <div className={kentang ? 'space-y-8 animate-fade-in' : 'space-y-8'}>
                        {hasil.map((r) => (
                            <section key={r.id} id={`resto-${r.id}`}>
                                <Card className="overflow-hidden">
                                    {/* Header restoran */}
                                    <div className="relative">
                                        <img
                                            src={r.banner}
                                            alt={r.nama}
                                            loading="lazy"
                                            onError={(e) => {
                                                e.currentTarget.style.visibility = 'hidden';
                                            }}
                                            className="h-32 w-full object-cover sm:h-40"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/85 via-navy-900/40 to-transparent" />

                                        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                {r.buka ? (
                                                    <Badge tone="sukses" ukuran="sm" titik>
                                                        Buka
                                                    </Badge>
                                                ) : (
                                                    <Badge tone="bahaya" ukuran="sm">
                                                        Tutup
                                                    </Badge>
                                                )}
                                                {r.gratis_ongkir ? (
                                                    <Badge tone="butter" ukuran="sm" ikon={Bike}>
                                                        Gratis ongkir
                                                    </Badge>
                                                ) : null}
                                                <Badge tone="netral" ukuran="sm" ikon={Clock3}>
                                                    {r.persiapan_label}
                                                </Badge>
                                            </div>

                                            <h2 className="mt-2 text-lg font-extrabold text-white sm:text-xl">
                                                {r.nama}
                                            </h2>
                                            <p className="mt-0.5 line-clamp-1 text-[12px] text-white/75">
                                                {r.deskripsi}
                                            </p>

                                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold text-white/85">
                                                <span className="inline-flex items-center gap-1">
                                                    <Star className="size-3 fill-butter-400 text-butter-400" />
                                                    {r.rating.toFixed(1)} ({r.jumlah_rating})
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin className="size-3" />
                                                    {r.jarak_km} km
                                                </span>
                                                <span>Min. order {rupiah(r.min_order)}</span>
                                                <span>{r.slot_tersedia} slot tersedia</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu */}
                                    <div className="p-4 sm:p-5">
                                        <div className="mb-3 flex items-center justify-between">
                                            <h3 className="text-[14px] font-extrabold text-navy-900">
                                                Menu ({r.jumlah_menu})
                                            </h3>
                                            <Link
                                                href={`/cari/restoran/${r.slug}`}
                                                className="text-[12px] font-bold text-powder-600 hover:underline"
                                            >
                                                Detail restoran
                                            </Link>
                                        </div>

                                        <MenuGrid menu={r.menu} restoran={r} />
                                    </div>
                                </Card>
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
