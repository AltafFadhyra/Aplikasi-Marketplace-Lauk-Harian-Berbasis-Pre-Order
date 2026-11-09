import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Bike, Clock3, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import SearchBar from '../../Components/layout/SearchBar';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Rating } from '../../Components/ui/Avatar';
import AppLayout from '../../Layouts/AppLayout';
import { angka, rupiah } from '../../lib/format';
import { useDemo } from '../../stores/DemoContext';

function RestoranCard({ r }) {
    return (
        <Card hover className="group overflow-hidden">
            <Link href={`/cari/restoran/${r.slug}`} className="block">
                <div className="relative h-40 overflow-hidden">
                    <img
                        src={r.banner}
                        alt={r.nama}
                        loading="lazy"
                        onError={(e) => {
                            e.currentTarget.style.visibility = 'hidden';
                        }}
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900/70 via-navy-900/10 to-transparent" />

                    <div className="absolute top-3 left-3 flex gap-1.5">
                        {r.buka ? (
                            <Badge tone="sukses" ukuran="sm" ikon={Clock3} titik>
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
                    </div>

                    <div className="absolute right-3 bottom-3 left-3">
                        <p className="truncate text-[15px] font-extrabold text-white drop-shadow">{r.nama}</p>
                        <p className="truncate text-[11px] text-white/75">{r.kategori}</p>
                    </div>
                </div>

                <div className="space-y-3 p-4">
                    <div className="flex items-center justify-between text-[12px]">
                        <Rating nilai={r.rating} jumlah={r.jumlah_rating} ukuran="sm" />
                        <span className="font-bold text-navy-500">{r.jarak_km} km</span>
                    </div>

                    <p className="line-clamp-2 text-[12px] leading-relaxed text-navy-400">{r.deskripsi}</p>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                        <span className="text-[11px] font-semibold text-navy-400">
                            {r.jumlah_menu} menu · {r.slot_tersedia} slot
                        </span>
                        <span className="inline-flex items-center gap-1 text-[12px] font-bold text-powder-600">
                            Lihat
                            <ArrowRight className="size-3.5" />
                        </span>
                    </div>
                </div>
            </Link>
        </Card>
    );
}

export default function Home() {
    const { seed } = useDemo();
    const restoran = seed.restoran ?? [];
    const kategori = seed.kategori ?? [];
    const statistik = seed.statistik ?? {};

    const kelebihan = [
        { ikon: Clock3, judul: 'Pre-order H+3', teks: 'Pesan sekarang, diantar paling lambat 3 hari ke depan.' },
        { ikon: Bike, judul: 'Kurir terverifikasi', teks: 'Ongkir transparan, kurir beridentitas resmi.' },
        { ikon: ShieldCheck, judul: 'Dapur terverifikasi', teks: 'Setiap penjual melewati proses verifikasi berlapis.' },
    ];

    return (
        <AppLayout>
            <Head title="Beranda" />

            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute -top-32 -left-24 size-[28rem] rounded-full bg-powder-200/50 blur-3xl" />
                    <div className="absolute -right-20 -bottom-24 size-[24rem] rounded-full bg-butter-200/40 blur-3xl" />
                </div>

                <div className="mx-auto max-w-7xl px-4 pt-10 pb-8 sm:px-6 sm:pt-16 sm:pb-12">
                    <div className="grid items-center gap-10 lg:grid-cols-2">
                        <div>
                            <Badge tone="powder" ikon={Sparkles}>
                                {statistik.total_restoran ?? restoran.length} restoran mitra · Bandung
                            </Badge>

                            <h1 className="mt-4 text-3xl leading-[1.12] font-extrabold tracking-tight text-navy-900 sm:text-4xl lg:text-5xl">
                                Pesan makanan
                                <br />
                                <span className="bg-gradient-to-r from-powder-600 to-navy-700 bg-clip-text text-transparent">
                                    untuk besok
                                </span>
                                , hari ini.
                            </h1>

                            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-navy-500">
                                Preorderly menghubungkan kamu dengan dapur rumahan dan restoran lokal. Pilih slot
                                pengiriman, bayar sesuai aturan, dan pantau statusnya secara langsung.
                            </p>

                            <div className="mt-7 flex flex-wrap items-center gap-3">
                                <Button as={Link} href="/cari" ukuran="lg">
                                        Mulai pesan
                                        <ArrowRight className="size-4" />
                                    </Button>
                                <Button as={Link} href="/auth/daftar-penjual" ukuran="lg" varian="garis">
                                        Daftarkan toko
                                    </Button>
                            </div>

                            <dl className="mt-9 grid max-w-md grid-cols-3 gap-3">
                                {[
                                    { n: statistik.total_restoran ?? 0, l: 'Restoran mitra' },
                                    { n: statistik.total_pesanan ?? 0, l: 'Pesanan diproses' },
                                    { n: statistik.rata2_rating ?? 0, l: 'Rating rata-rata', desimal: true },
                                ].map((s) => (
                                    <div
                                        key={s.l}
                                        className="rounded-2xl border border-white/70 bg-white/70 p-3 backdrop-blur"
                                    >
                                        <dt className="text-xl font-extrabold text-navy-900">
                                            {s.desimal ? s.n : angka(s.n)}
                                        </dt>
                                        <dd className="text-[11px] font-semibold text-navy-400">{s.l}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>

                        <div className="relative">
                            <div className="grid grid-cols-2 gap-3">
                                {restoran.slice(0, 4).map((r, i) => (
                                    <div
                                        key={r.id}
                                        className={[
                                            'overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-lift backdrop-blur',
                                            i % 2 === 1 ? 'translate-y-6' : '',
                                        ].join(' ')}
                                    >
                                        <img
                                            src={r.banner}
                                            alt={r.nama}
                                            loading="lazy"
                                            onError={(e) => {
                                                e.currentTarget.style.visibility = 'hidden';
                                            }}
                                            className="h-28 w-full object-cover"
                                        />
                                        <div className="p-3">
                                            <p className="truncate text-[12px] font-extrabold text-navy-900">{r.nama}</p>
                                            <p className="truncate text-[10px] text-navy-400">
                                                {r.jumlah_menu} menu · {r.persiapan_label}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 sm:mt-16">
                        <SearchBar placeholder="Mau makan apa besok? Cari restoran atau menu..." />
                    </div>
                </div>
            </section>

            {/* Keunggulan */}
            <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
                <ul className="grid gap-3 sm:grid-cols-3">
                    {kelebihan.map((u) => {
                        const Ikon = u.ikon;

                        return (
                            <li key={u.judul}>
                                <Card className="flex h-full items-start gap-3">
                                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-powder-50 text-powder-600">
                                        <Ikon className="size-5" strokeWidth={2.2} />
                                    </span>
                                    <div>
                                        <p className="text-[13px] font-extrabold text-navy-900">{u.judul}</p>
                                        <p className="mt-0.5 text-[12px] leading-relaxed text-navy-400">{u.teks}</p>
                                    </div>
                                </Card>
                            </li>
                        );
                    })}
                </ul>
            </section>

            {/* Kategori */}
            {kategori.length ? (
                <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-extrabold text-navy-900">Jelajahi kategori</h2>
                        <Link
                            href="/cari"
                            className="inline-flex items-center gap-1 text-[13px] font-bold text-powder-600"
                        >
                            Lihat semua
                            <ArrowRight className="size-3.5" />
                        </Link>
                    </div>

                    <ul className="flex gap-3 overflow-x-auto pb-2">
                        {kategori.map((k) => (
                            <li key={k.id} className="shrink-0">
                                <Link
                                    href={`/cari?kategori=${k.slug}`}
                                    className="flex w-28 flex-col items-center gap-2 rounded-2xl border border-white/70 bg-white/80 p-3.5 text-center shadow-float backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-powder-300"
                                >
                                    <span
                                        className="grid size-11 place-items-center rounded-2xl text-white"
                                        style={{ backgroundColor: k.warna }}
                                    >
                                        <TrendingUp className="size-5" />
                                    </span>
                                    <span className="line-clamp-2 text-[11px] font-bold text-navy-700">{k.nama}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            ) : null}

            {/* Restoran */}
            <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-extrabold text-navy-900">Restoran populer</h2>
                        <p className="text-[12px] text-navy-400">Diurutkan dari rating tertinggi</p>
                    </div>
                    <Link
                        href="/cari"
                        className="inline-flex items-center gap-1 text-[13px] font-bold text-powder-600"
                    >
                        Semua restoran
                        <ArrowRight className="size-3.5" />
                    </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {restoran.slice(0, 8).map((r) => (
                        <RestoranCard key={r.id} r={r} />
                    ))}
                </div>
            </section>
        </AppLayout>
    );
}
