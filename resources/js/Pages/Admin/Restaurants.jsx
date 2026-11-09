import { Head } from '@inertiajs/react';
import { Ban, CheckCircle2, Clock, MapPin, Search, Star, Store, UtensilsCrossed } from 'lucide-react';
import { useMemo, useState } from 'react';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Kosong } from '../../Components/ui/Feedback';
import { Input } from '../../Components/ui/Form';
import { FilterChip, PageHeader } from '../../Components/ui/Misc';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { ROLES } from '../../lib/constants';
import { rupiah, waktuRelatif } from '../../lib/format';
import { useDemo } from '../../stores/DemoContext';

const TAB = [
    { k: 'semua', l: 'Semua' },
    { k: 'buka', l: 'Sedang buka' },
    { k: 'tutup', l: 'Tutup' },
    { k: 'rating_tinggi', l: 'Rating tinggi' },
];

export default function Restaurants() {
    const { seed, busy, tambahToast, simpanRestoran } = useDemo();

    const [tab, setTab] = useState('semua');
    const [cari, setCari] = useState('');

    const semua = seed.restoran ?? [];

    const daftar = useMemo(() => {
        const q = cari.trim().toLowerCase();

        return semua
            .filter((r) => {
                if (tab === 'buka') return r.buka;
                if (tab === 'tutup') return !r.buka;
                if (tab === 'rating_tinggi') return Number(r.rating ?? 0) >= 4.7;
                return true;
            })
            .filter(
                (r) =>
                    !q ||
                    r.nama?.toLowerCase().includes(q) ||
                    r.kategori?.toLowerCase().includes(q) ||
                    r.alamat?.toLowerCase().includes(q),
            );
    }, [semua, tab, cari]);

    const jumlah = (k) => {
        if (k === 'semua') return semua.length;
        if (k === 'buka') return semua.filter((r) => r.buka).length;
        if (k === 'tutup') return semua.filter((r) => !r.buka).length;
        return semua.filter((r) => Number(r.rating ?? 0) >= 4.7).length;
    };

    const totalMenu = semua.reduce((t, r) => t + (r.jumlah_menu ?? r.menu?.length ?? 0), 0);

    return (
        <DashboardLayout judul="Restoran" peran={ROLES.ADMIN}>
            <Head title="Manajemen Restoran" />

            <div className="mb-5">
                <PageHeader
                    judul="Manajemen restoran"
                    deskripsi="Pantau partner/vendor yang sudah terdaftar dan status operasionalnya."
                    ikon={Store}
                />
            </div>

            <ul className="mb-4 grid gap-3 sm:grid-cols-3">
                <li>
                    <Card elevate className="flex items-center gap-3 p-4">
                        <span className="grid size-11 place-items-center rounded-2xl bg-powder-50 text-powder-600">
                            <Store className="size-5" />
                        </span>
                        <div>
                            <p className="text-[11px] text-navy-400">Restoran terdaftar</p>
                            <p className="text-lg font-extrabold text-navy-900">{semua.length}</p>
                        </div>
                    </Card>
                </li>
                <li>
                    <Card elevate className="flex items-center gap-3 p-4">
                        <span className="grid size-11 place-items-center rounded-2xl bg-success-50 text-success-600">
                            <CheckCircle2 className="size-5" />
                        </span>
                        <div>
                            <p className="text-[11px] text-navy-400">Sedang buka</p>
                            <p className="text-lg font-extrabold text-navy-900">
                                {semua.filter((r) => r.buka).length}
                            </p>
                        </div>
                    </Card>
                </li>
                <li>
                    <Card elevate className="flex items-center gap-3 p-4">
                        <span className="grid size-11 place-items-center rounded-2xl bg-butter-50 text-butter-600">
                            <UtensilsCrossed className="size-5" />
                        </span>
                        <div>
                            <p className="text-[11px] text-navy-400">Total menu</p>
                            <p className="text-lg font-extrabold text-navy-900">{totalMenu}</p>
                        </div>
                    </Card>
                </li>
            </ul>

            <Card elevate className="mb-4 flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                <ul className="flex flex-wrap gap-1.5">
                    {TAB.map((t) => (
                        <li key={t.k}>
                            <FilterChip
                                aktif={tab === t.k}
                                onClick={() => setTab(t.k)}
                                jumlah={jumlah(t.k)}
                            >
                                {t.l}
                            </FilterChip>
                        </li>
                    ))}
                </ul>

                <div className="lg:w-72">
                    <Input
                        placeholder="Cari restoran atau wilayah..."
                        ikon={Search}
                        value={cari}
                        onChange={(e) => setCari(e.target.value)}
                        containerClassName="mb-0"
                    />
                </div>
            </Card>

            {!daftar.length ? (
                <Kosong
                    ikon={Store}
                    judul="Restoran tidak ditemukan"
                    deskripsi="Tidak ada restoran pada filter ini."
                    className="rounded-3xl border border-slate-200 bg-white py-10"
                />
            ) : (
                <ul className="grid gap-3.5 md:grid-cols-2">
                    {daftar.map((r) => (
                        <li key={r.id}>
                            <Card hover elevate className="h-full p-4">
                                <div className="flex gap-3.5">
                                    <img
                                        src={r.logo ?? r.banner}
                                        alt={r.nama}
                                        className="size-16 shrink-0 rounded-2xl object-cover"
                                        loading="lazy"
                                    />

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[13px] font-extrabold text-navy-900">
                                            {r.nama}
                                        </p>
                                        <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-navy-400">
                                            <MapPin className="size-3" />
                                            {r.alamat ?? '-'}
                                        </p>

                                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                                            <Badge tone="netral">{r.kategori ?? '-'}</Badge>
                                            <Badge tone={r.buka ? 'sukses' : 'peringatan'}>
                                                <Clock className="size-3" />
                                                {r.buka ? 'Buka' : 'Tutup'}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="shrink-0 text-right">
                                        <span className="inline-flex items-center gap-1 text-[12px] font-extrabold text-navy-900">
                                            <Star className="size-3 fill-butter-500 text-butter-500" />
                                            {Number(r.rating ?? 0).toFixed(1)}
                                        </span>
                                        <p className="text-[10px] text-navy-400">
                                            {r.jumlah_rating ?? 0} ulasan
                                        </p>
                                    </div>
                                </div>

                                <dl className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
                                    <div className="rounded-xl bg-slate-50 px-2.5 py-2">
                                        <dt className="text-navy-400">Menu</dt>
                                        <dd className="mt-0.5 font-extrabold text-navy-800">
                                            {r.jumlah_menu ?? r.menu?.length ?? 0}
                                        </dd>
                                    </div>
                                    <div className="rounded-xl bg-slate-50 px-2.5 py-2">
                                        <dt className="text-navy-400">Min. order</dt>
                                        <dd className="mt-0.5 font-extrabold text-navy-800">
                                            {rupiah(r.min_order ?? 0)}
                                        </dd>
                                    </div>
                                    <div className="rounded-xl bg-slate-50 px-2.5 py-2">
                                        <dt className="text-navy-400">Terdaftar</dt>
                                        <dd className="mt-0.5 font-extrabold text-navy-800">
                                            {waktuRelatif(r.dibuat_pada)}
                                        </dd>
                                    </div>
                                </dl>

                                <div className="mt-3 flex justify-end">
                                    <Button
                                        varian="garis"
                                        ukuran="sm"
                                        disabled={busy}
                                        ikon={r.buka ? Ban : CheckCircle2}
                                        onClick={() => {
                                            simpanRestoran(r.id, { buka: !r.buka });
                                            tambahToast(
                                                r.buka
                                                    ? `${r.nama} dinonaktifkan.`
                                                    : `${r.nama} diaktifkan kembali.`,
                                                'sukses',
                                            );
                                        }}
                                    >
                                        {r.buka ? 'Nonaktifkan' : 'Aktifkan'}
                                    </Button>
                                </div>
                            </Card>
                        </li>
                    ))}
                </ul>
            )}
        </DashboardLayout>
    );
}
