import { Head, Link, router } from '@inertiajs/react';
import { ChefHat, Clock3, Filter, Package, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Kosong } from '../../Components/ui/Feedback';
import { Input, Select } from '../../Components/ui/Form';
import { Rating } from '../../Components/ui/Avatar';
import { FilterChip, PageHeader, PriceTag } from '../../Components/ui/Misc';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { ROLES } from '../../lib/constants';
import { rupiah } from '../../lib/format';
import { useDemo } from '../../stores/DemoContext';

const KATEGORI = ['Semua', 'Makanan', 'Minuman', 'Camilan', 'Dessert'];

export default function Menus() {
    const { seed, akun, tambahToast, toggleMenu } = useDemo();

    const [cari, setCari] = useState('');
    const [kategori, setKategori] = useState('Semua');
    const [tampil, setTampil] = useState(9);

    const toko = akun?.penjual ?? {};
    const restoran = (seed.restoran ?? []).find((r) => String(r.id) === String(toko.restoran_id));
    const semuaMenu = restoran?.menu ?? [];

    const daftar = useMemo(() => {
        const q = cari.trim().toLowerCase();

        return semuaMenu.filter((m) => {
            const cocokCari = !q || m.nama.toLowerCase().includes(q);
            const cocokKategori = kategori === 'Semua' || (m.kategori ?? '') === kategori;
            return cocokCari && cocokKategori;
        });
    }, [semuaMenu, cari, kategori]);

    const aktif = semuaMenu.filter((m) => m.aktif !== false);
    const preorder = aktif.filter((m) => m.hanya_preorder);

    return (
        <DashboardLayout judul="Kelola Menu" peran={ROLES.PENJUAL}>
            <Head title="Kelola Menu" />

            <div className="mb-5">
                <PageHeader
                    judul="Kelola Menu"
                    deskripsi="Atur menu, harga, foto, dan ketersediaan harian."
                    ikon={ChefHat}
                    aksi={
                        <Button ikon={Plus} onClick={() => router.visit('/seller/menu/0/ubah')}>
                            Tambah menu
                        </Button>
                    }
                />
            </div>

            <ul className="mb-4 grid gap-3 sm:grid-cols-3">
                {[
                    { l: 'Total menu', v: semuaMenu.length, tone: 'text-navy-900' },
                    { l: 'Menu aktif', v: aktif.length, tone: 'text-success-600' },
                    { l: 'Hanya pre-order', v: preorder.length, tone: 'text-butter-700' },
                ].map((s) => (
                    <li key={s.l} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <p className="text-[10px] font-bold tracking-wide text-navy-400 uppercase">{s.l}</p>
                        <p className={['mt-0.5 text-lg font-extrabold', s.tone].join(' ')}>{s.v}</p>
                    </li>
                ))}
            </ul>

            <Card elevate className="mb-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="flex-1">
                    <Input
                        placeholder="Cari nama menu..."
                        ikon={Search}
                        value={cari}
                        onChange={(e) => setCari(e.target.value)}
                        containerClassName="mb-0"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="size-4 shrink-0 text-navy-300" />
                    <ul className="flex gap-1.5 overflow-x-auto">
                        {KATEGORI.map((k) => (
                            <li key={k} className="shrink-0">
                                <FilterChip aktif={kategori === k} onClick={() => setKategori(k)}>
                                    {k}
                                </FilterChip>
                            </li>
                        ))}
                    </ul>
                </div>
            </Card>

            {!daftar.length ? (
                <Kosong
                    ikon={Package}
                    judul="Menu tidak ditemukan"
                    deskripsi="Coba kata kunci lain atau pilih kategori berbeda."
                />
            ) : (
                <>
                    <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
                        {daftar.slice(0, tampil).map((m) => (
                            <Card key={m.id} hover className="flex flex-col overflow-hidden">
                                <div className="relative">
                                    <img
                                        src={m.gambar}
                                        alt={m.nama}
                                        onError={(e) => {
                                            e.currentTarget.style.visibility = 'hidden';
                                        }}
                                        className="h-36 w-full object-cover"
                                    />
                                    <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                                        {m.hanya_preorder ? (
                                            <Badge tone="peringatan" ukuran="xs" ikon={Clock3}>
                                                Pre-order
                                            </Badge>
                                        ) : null}
                                        {m.harga_efektif && m.harga_efektif < m.harga ? (
                                            <Badge tone="bahaya" ukuran="xs">
                                                Diskon
                                            </Badge>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="flex flex-1 flex-col p-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="line-clamp-1 flex-1 text-[13px] font-extrabold text-navy-900">
                                            {m.nama}
                                        </h3>
                                        <Rating nilai={Number(m.rating ?? 0)} tampilAngka={false} ukuran="sm" />
                                    </div>

                                    <p className="mt-0.5 text-[10px] font-bold text-powder-600">
                                        {m.kategori}
                                    </p>

                                    <div className="mt-2 flex items-end justify-between gap-2">
                                        <PriceTag
                                            harga={m.harga_efektif || m.harga}
                                            coret={Boolean(
                                                m.harga_efektif && m.harga_efektif < m.harga,
                                            )}
                                            ukuran="sm"
                                        />
                                        <span className="text-[10px] text-navy-400">
                                            {m.terjual} terjual
                                        </span>
                                    </div>

                                    <dl className="mt-3 grid grid-cols-2 gap-1.5 text-[10px]">
                                        <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                                            <dt className="text-navy-400">Persiapan</dt>
                                            <dd className="font-bold text-navy-700">
                                                {m.lead_time_label}
                                            </dd>
                                        </div>
                                        <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                                            <dt className="text-navy-400">Maks/hari</dt>
                                            <dd className="font-bold text-navy-700">{m.maks_harian} porsi</dd>
                                        </div>
                                    </dl>

                                    <div className="mt-3 flex gap-2">
                                        <Button as={Link} href={`/seller/menu/${m.id}/ubah`} varian="garis" ukuran="sm" className="flex-1 w-full">
                                                Ubah
                                            </Button>
                                        <Button
                                            varian={m.aktif === false ? 'garis' : 'pelan'}
                                            ukuran="sm"
                                            onClick={() => {
                                                if (!restoran) return;
                                                toggleMenu(restoran.id, m.id);
                                                tambahToast(
                                                    `${m.nama} ${m.aktif === false ? 'diaktifkan' : 'dinonaktifkan'}.`,
                                                    'sukses',
                                                );
                                            }}
                                        >
                                            {m.aktif === false ? 'Aktifkan' : 'Nonaktifkan'}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {daftar.length > tampil ? (
                        <div className="mt-4 text-center">
                            <Button varian="garis" onClick={() => setTampil((t) => t + 9)}>
                                Muat {Math.min(9, daftar.length - tampil)} menu lagi
                            </Button>
                        </div>
                    ) : null}
                </>
            )}

            <p className="mt-5 text-center text-[11px] text-navy-300">
                Harga yang tampil sudah termasuk diskon. Total menu: {daftar.length} dari {semuaMenu.length}.
            </p>
        </DashboardLayout>
    );
}
