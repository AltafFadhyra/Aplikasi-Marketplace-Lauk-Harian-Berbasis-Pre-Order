import { Head, Link } from '@inertiajs/react';
import { Coins, MapPin, Navigation, Package, PackageCheck, Search } from 'lucide-react';
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
import { alamatTeks, jarakTeks, ongkirNilai } from '../../lib/pesanan';
import { useDemo } from '../../stores/DemoContext';

export default function Available() {
    const { pesananTersediaUntukKurir, klaimPengiriman, busy, tambahToast } = useDemo();

    const [cari, setCari] = useState('');
    const [jarakMaks, setJarakMaks] = useState(10);

    const semua = pesananTersediaUntukKurir;

    const daftar = useMemo(() => {
        const q = cari.trim().toLowerCase();

        return semua
            .filter((p) => !q || p.kode.toLowerCase().includes(q))
            .filter((p) => Number(p.jarak_km ?? 0) <= jarakMaks)
            .sort((a, b) => Number(a.jarak_km ?? 0) - Number(b.jarak_km ?? 0));
    }, [semua, cari, jarakMaks]);

    async function klaim(p) {
        try {
            await klaimPengiriman(p.id);
            tambahToast(`Pesanan ${p.kode} berhasil diklaim.`, 'sukses');
        } catch (salah) {
            tambahToast(salah.message, 'bahaya');
        }
    }

    return (
        <DashboardLayout judul="Pesanan Tersedia" peran={ROLES.KURIR}>
            <Head title="Pesanan Tersedia" />

            <div className="mb-5">
                <PageHeader
                    judul="Pesanan tersedia"
                    deskripsi="Klaim pesanan yang dekat dengan posisimu untuk menghemat ongkir."
                    ikon={Package}
                />
            </div>

            <Card elevate className="mb-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="flex-1">
                    <Input
                        placeholder="Cari kode pesanan..."
                        ikon={Search}
                        value={cari}
                        onChange={(e) => setCari(e.target.value)}
                        containerClassName="mb-0"
                    />
                </div>

                <ul className="flex gap-1.5">
                    {[3, 5, 10, 20].map((k) => (
                        <li key={k}>
                            <FilterChip
                                aktif={jarakMaks === k}
                                onClick={() => setJarakMaks(k)}
                                ikon={Navigation}
                            >
                                {k} km
                            </FilterChip>
                        </li>
                    ))}
                </ul>
            </Card>

            {!daftar.length ? (
                <Kosong
                    ikon={PackageCheck}
                    judul="Tidak ada pesanan tersedia"
                    deskripsi="Belum ada pesanan yang cocok dengan filter jarak atau kata kunci kamu."
                    className="rounded-3xl border border-slate-200 bg-white py-10"
                />
            ) : (
                <ul className="grid gap-3.5 md:grid-cols-2">
                    {daftar.map((p) => (
                        <li key={p.id}>
                            <Card hover elevate className="flex h-full flex-col p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-[14px] font-extrabold text-navy-900">
                                            {p.kode}
                                        </p>
                                        <p className="mt-0.5 text-[11px] text-navy-400">
                                            Dibuat {waktuRelatif(p.dibuat_pada)}
                                        </p>
                                    </div>
                                    <Badge tone="powder" ikon={Coins}>
                                        {rupiah(ongkirNilai(p))}
                                    </Badge>
                                </div>

                                <p className="mt-3 inline-flex items-start gap-1.5 text-[12px] text-navy-600">
                                    <MapPin className="mt-0.5 size-3.5 shrink-0 text-navy-300" />
                                    {alamatTeks(p)}
                                </p>

                                <dl className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
                                    <div className="rounded-xl bg-slate-50 px-2.5 py-2">
                                        <dt className="text-navy-400">Jarak</dt>
                                        <dd className="mt-0.5 font-extrabold text-navy-800">
                                            {jarakTeks(p) ?? '-'}
                                        </dd>
                                    </div>
                                    <div className="rounded-xl bg-slate-50 px-2.5 py-2">
                                        <dt className="text-navy-400">Item</dt>
                                        <dd className="mt-0.5 font-extrabold text-navy-800">
                                            {(p.items ?? []).length} menu
                                        </dd>
                                    </div>
                                    <div className="rounded-xl bg-slate-50 px-2.5 py-2">
                                        <dt className="text-navy-400">Estimasi</dt>
                                        <dd className="mt-0.5 font-extrabold text-navy-800">
                                            {p.eta ? waktuRelatif(p.eta) : '-'}
                                        </dd>
                                    </div>
                                </dl>

                                <div className="mt-4 flex gap-2">
                                    <Button as={Link} href={`/courier/pengiriman/${p.kode}`} varian="garis" ukuran="sm" className="flex-1 w-full">
                                            Detail
                                        </Button>
                                    <Button
                                        ukuran="sm"
                                        disabled={busy}
                                        onClick={() => klaim(p)}
                                        className="flex-1"
                                    >
                                        Klaim
                                    </Button>
                                </div>
                            </Card>
                        </li>
                    ))}
                </ul>
            )}

            <p className="mt-5 text-center text-[11px] text-navy-300">
                Menampilkan {daftar.length} dari {semua.length} pesanan tersedia.
            </p>
        </DashboardLayout>
    );
}
