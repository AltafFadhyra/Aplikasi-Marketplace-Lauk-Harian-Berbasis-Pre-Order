import { Head, Link, usePage } from '@inertiajs/react';
import {
    Bike,
    CalendarClock,
    Clock3,
    MapPin,
    MessageCircle,
    Phone,
    Share2,
    ShieldCheck,
    Star,
} from 'lucide-react';
import { useState } from 'react';
import { MenuGrid } from '../../Components/buyer/MenuCard';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Kosong } from '../../Components/ui/Feedback';
import { Rating } from '../../Components/ui/Avatar';
import { FilterChip } from '../../Components/ui/Misc';
import AppLayout from '../../Layouts/AppLayout';
import { rupiah, waktuRelatif } from '../../lib/format';
import { useDemo } from '../../stores/DemoContext';

export default function RestaurantDetail() {
    const { slug, restoranId, ulasan: ulasanServer } = usePage().props;
    const { seed, ulasan, tambahToast } = useDemo();

    const [kategoriAktif, setKategoriAktif] = useState('');
    const [tabInfo, setTabInfo] = useState('menu');

    const resto = (seed.restoran ?? []).find((r) => r.slug === slug || String(r.id) === String(restoranId));

    if (!resto) {
        return (
            <AppLayout>
                <Head title="Restoran" />
                <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
                    <Kosong
                        ikon={MapPin}
                        judul="Restoran tidak ditemukan"
                        deskripsi="Restoran ini mungkin sudah tidak aktif atau tautannya salah."
                        aksi={
                            <Button as={Link} href="/cari">Kembali ke pencarian</Button>
                        }
                        className="rounded-3xl border border-white/70 bg-white/70 py-6"
                    />
                </div>
            </AppLayout>
        );
    }

    // Ulasan dari context (termasuk yang dibuat selama demo). Prop server hanya fallback.
    const dariContext = ulasan.filter((u) => String(u.restoran_id) === String(resto.id));
    const semuaUlasan =
        dariContext.length > 0
            ? dariContext
            : (ulasanServer ?? []).map((u) => ({
                  ...u,
                  isi: u.komentar,
              }));

    const kategoriAda = [...new Set(resto.menu.map((m) => m.kategori).filter(Boolean))];
    const menuTampil = kategoriAktif ? resto.menu.filter((m) => m.kategori === kategoriAktif) : resto.menu;
    const slotTersedia = (seed.slot ?? []).filter(
        (s) => String(s.restoran_id) === String(resto.id) && s.sisa > 0,
    );

    const sorotan = resto.sorotan ?? [];

    return (
        <AppLayout>
            <Head title={resto.nama} />

            {/* Banner */}
            <div className="relative">
                <div className="relative h-48 sm:h-64">
                    <img
                        src={resto.banner}
                        alt={resto.nama}
                        onError={(e) => {
                            e.currentTarget.style.visibility = 'hidden';
                        }}
                        className="size-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/45 to-transparent" />
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="relative -mt-20 sm:-mt-24">
                        <Card elevate className="p-5 sm:p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                <img
                                    src={resto.logo ?? resto.banner}
                                    alt={resto.nama}
                                    onError={(e) => {
                                        e.currentTarget.style.visibility = 'hidden';
                                    }}
                                    className="size-20 shrink-0 rounded-3xl object-cover ring-4 ring-white"
                                />

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge tone={resto.buka ? 'sukses' : 'bahaya'} titik>
                                            {resto.buka ? 'Sedang buka' : 'Tutup'}
                                        </Badge>
                                        {resto.gratis_ongkir ? (
                                            <Badge tone="butter" ikon={Bike}>
                                                Gratis ongkir
                                            </Badge>
                                        ) : null}
                                        <Badge tone="powder" ikon={ShieldCheck}>
                                            Terverifikasi
                                        </Badge>
                                    </div>

                                    <h1 className="mt-2 text-xl font-extrabold text-navy-900 sm:text-2xl">
                                        {resto.nama}
                                    </h1>
                                    <p className="mt-1 text-[13px] leading-relaxed text-navy-500">
                                        {resto.deskripsi}
                                    </p>

                                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] font-semibold text-navy-500">
                                        <span className="inline-flex items-center gap-1">
                                            <Star className="size-3.5 fill-butter-400 text-butter-400" />
                                            <span className="font-extrabold text-navy-800">
                                                {resto.rating.toFixed(1)}
                                            </span>
                                            ({resto.jumlah_rating} ulasan)
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <MapPin className="size-3.5" />
                                            {resto.alamat}
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <Bike className="size-3.5" />
                                            {resto.jarak_km} km dari kamu
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <Clock3 className="size-3.5" />
                                            {resto.persiapan_label}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex shrink-0 gap-2">
                                    <Button
                                        ukuran="sm"
                                        varian="garis"
                                        onClick={() =>
                                            window.open(
                                                `https://wa.me/?text=${encodeURIComponent(
                                                    `Halo ${resto.nama}, saya ingin bertanya soal menu.`,
                                                )}`,
                                                '_blank',
                                                'noopener',
                                            )
                                        }
                                    >
                                        <Phone className="size-3.5" />
                                        Chat
                                    </Button>
                                    <Button
                                        ukuran="sm"
                                        varian="garis"
                                        onClick={() =>
                                            navigator.clipboard
                                                ?.writeText(window.location.href)
                                                .then(() =>
                                                    tambahToast('Tautan restoran disalin ke papan klip.', 'sukses'),
                                                )
                                                .catch(() =>
                                                    tambahToast('Gagal menyalin tautan.', 'bahaya'),
                                                )
                                        }
                                    >
                                        <Share2 className="size-3.5" />
                                        Bagikan
                                    </Button>
                                </div>
                            </div>

                            <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-4">
                                {[
                                    { l: 'Min. order', v: rupiah(resto.min_order) },
                                    { l: 'Total terjual', v: `${resto.terjual} porsi` },
                                    { l: 'Jumlah menu', v: `${resto.jumlah_menu} menu` },
                                    { l: 'Slot tersedia', v: `${resto.slot_tersedia} slot` },
                                ].map((s) => (
                                    <div key={s.l} className="rounded-2xl bg-slate-50 px-3.5 py-3">
                                        <dt className="text-[10px] font-bold tracking-wide text-navy-400 uppercase">
                                            {s.l}
                                        </dt>
                                        <dd className="mt-0.5 text-[14px] font-extrabold text-navy-900">{s.v}</dd>
                                    </div>
                                ))}
                            </dl>
                        </Card>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
                {/* Sorotan */}
                {sorotan.length ? (
                    <ul className="mb-6 grid gap-3 sm:grid-cols-3">
                        {sorotan.map((s) => (
                            <li
                                key={s}
                                className="rounded-2xl border border-butter-200 bg-butter-50/60 px-4 py-3 text-[12px] font-bold text-butter-800"
                            >
                                {s}
                            </li>
                        ))}
                    </ul>
                ) : null}

                {/* Tab info */}
                <ul className="mb-5 flex gap-2 border-b border-slate-200">
                    {[
                        { k: 'menu', l: `Menu (${resto.jumlah_menu})` },
                        { k: 'slot', l: `Jadwal Produksi (${slotTersedia.length})` },
                        { k: 'ulasan', l: `Ulasan (${semuaUlasan.length})` },
                    ].map((t) => (
                        <li key={t.k}>
                            <button
                                type="button"
                                onClick={() => setTabInfo(t.k)}
                                className={[
                                    '-mb-px border-b-2 px-4 py-2.5 text-[13px] font-bold transition-colors',
                                    tabInfo === t.k
                                        ? 'border-powder-500 text-powder-600'
                                        : 'border-transparent text-navy-400 hover:text-navy-600',
                                ].join(' ')}
                            >
                                {t.l}
                            </button>
                        </li>
                    ))}
                </ul>

                {tabInfo === 'menu' ? (
                    <div className="space-y-4">
                        {kategoriAda.length > 1 ? (
                            <ul className="flex gap-2 overflow-x-auto pb-1">
                                <li className="shrink-0">
                                    <FilterChip
                                        aktif={!kategoriAktif}
                                        onClick={() => setKategoriAktif('')}
                                    >
                                        Semua
                                    </FilterChip>
                                </li>
                                {kategoriAda.map((k) => (
                                    <li key={k} className="shrink-0">
                                        <FilterChip
                                            aktif={kategoriAktif === k}
                                            onClick={() => setKategoriAktif(k)}
                                        >
                                            {k}
                                        </FilterChip>
                                    </li>
                                ))}
                            </ul>
                        ) : null}

                        <MenuGrid menu={menuTampil} restoran={resto} columns="sm:grid-cols-2 lg:grid-cols-3" />
                    </div>
                ) : null}

                {tabInfo === 'slot' ? (
                    <Card elevate className="p-5">
                        <h2 className="text-[15px] font-extrabold text-navy-900">Jadwal produksi</h2>
                        <p className="mt-1 text-[12px] text-navy-400">
                            Pre-order dibuka maksimal 3 hari ke depan. Kuota tersisa diperbarui otomatis.
                        </p>

                        {!slotTersedia.length ? (
                            <p className="mt-4 rounded-xl bg-warning-50 px-4 py-3 text-[12px] font-semibold text-warning-600">
                                Jadwal produksi untuk 3 hari ke depan sudah penuh.
                            </p>
                        ) : (
                            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                                {slotTersedia.map((s) => (
                                    <li
                                        key={s.id}
                                        className="rounded-2xl border border-slate-200 bg-white p-3.5"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="text-[13px] font-extrabold text-navy-900">
                                                    {s.tanggal_label}
                                                </p>
                                                <p className="mt-0.5 text-[12px] font-bold text-powder-600">
                                                    {s.jam_mulai} - {s.jam_selesai}
                                                </p>
                                            </div>
                                            <CalendarClock className="size-4 shrink-0 text-navy-300" />
                                        </div>
                                        <div className="mt-2 flex items-center justify-between">
                                            <Badge
                                                tone={s.sisa <= 3 ? 'peringatan' : 'sukses'}
                                                ukuran="xs"
                                            >
                                                Sisa {s.sisa}/{s.kapasitas}
                                            </Badge>
                                            <span className="text-[10px] text-navy-300">
                                                batas {waktuRelatif(s.batas_pesan)}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                ) : null}

                {tabInfo === 'ulasan' ? (
                    <div className="grid gap-5 lg:grid-cols-3">
                        <Card elevate className="p-5 lg:col-span-1">
                            <h2 className="text-[15px] font-extrabold text-navy-900">Ringkasan rating</h2>
                            <div className="mt-3 text-center">
                                <p className="text-4xl font-extrabold text-navy-900">
                                    {resto.rating.toFixed(1)}
                                </p>
                                <div className="mt-1.5 flex justify-center">
                                    <Rating nilai={resto.rating} tampilAngka={false} ukuran="sm" />
                                </div>
                                <p className="mt-1 text-[11px] text-navy-400">
                                    {resto.jumlah_rating} ulasan
                                </p>
                            </div>

                            <ul className="mt-4 space-y-1.5">
                                {[5, 4, 3, 2, 1].map((b) => {
                                    const jumlah = semuaUlasan.filter((u) => Math.round(u.rating) === b).length;
                                    const persen = semuaUlasan.length
                                        ? Math.round((jumlah / semuaUlasan.length) * 100)
                                        : 0;

                                    return (
                                        <li key={b} className="flex items-center gap-2 text-[11px]">
                                            <span className="w-3 font-bold text-navy-500">{b}</span>
                                            <Star className="size-3 fill-butter-400 text-butter-400" />
                                            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                                                <span
                                                    className="block h-full rounded-full bg-butter-400"
                                                    style={{ width: `${persen}%` }}
                                                />
                                            </span>
                                            <span className="w-8 text-right font-bold text-navy-400">
                                                {persen}%
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </Card>

                        <div className="space-y-3 lg:col-span-2">
                            {!semuaUlasan.length ? (
                                <Kosong
                                    ikon={MessageCircle}
                                    judul="Belum ada ulasan"
                                    deskripsi="Belum ada ulasan untuk restoran ini. Jadilah yang pertama setelah pesan."
                                />
                            ) : (
                                semuaUlasan.map((u) => (
                                    <Card key={u.id} className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[13px] font-extrabold text-navy-900">
                                                    {u.nama ?? 'Pembeli'}
                                                </p>
                                                <p className="text-[10px] text-navy-300">
                                                    {waktuRelatif(u.dibuat_pada)}
                                                </p>
                                            </div>
                                            <Rating nilai={Number(u.rating)} tampilAngka={false} ukuran="sm" />
                                        </div>

                                        {u.isi ? (
                                            <p className="mt-2.5 text-[13px] leading-relaxed text-navy-600">
                                                {u.isi}
                                            </p>
                                        ) : null}

                                        {u.balasan ? (
                                            <div className="mt-3 rounded-2xl bg-powder-50/70 px-4 py-3">
                                                <p className="text-[11px] font-bold text-powder-700">
                                                    Balasan {resto.nama}
                                                </p>
                                                <p className="mt-0.5 text-[12px] text-navy-600">{u.balasan}</p>
                                            </div>
                                        ) : null}
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                ) : null}
            </div>
        </AppLayout>
    );
}
