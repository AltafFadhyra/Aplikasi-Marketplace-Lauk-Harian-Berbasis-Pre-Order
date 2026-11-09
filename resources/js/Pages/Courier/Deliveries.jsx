import { Head, Link } from '@inertiajs/react';
import { Check, MapPin, Navigation, Package, Phone, Route } from 'lucide-react';
import { useState } from 'react';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Kosong } from '../../Components/ui/Feedback';
import { Modal } from '../../Components/ui/Modal';
import { Textarea } from '../../Components/ui/Form';
import { InfoRow, PageHeader } from '../../Components/ui/Misc';
import { StepperStatus } from '../../Components/ui/Stepper';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { ROLES, toneBadgeStatus } from '../../lib/constants';
import { rupiah, waktuRelatif } from '../../lib/format';
import { alamatTeks, jarakTeks, ongkirNilai, teleponPembeli } from '../../lib/pesanan';
import { useDemo } from '../../stores/DemoContext';

const TAHAP = [
    { s: 'dibuat_untuk_kurir', l: 'Diterima dari restoran' },
    { s: 'diambil_kurir', l: 'Masuk dalam pengiriman' },
    { s: 'dalam_pengiriman', l: 'Dalam perjalanan' },
    { s: 'selesai', l: 'Sampai ke pembeli' },
];

export default function Deliveries() {
    const { pengiriman, seed, busy, majukanStatus, tambahToast } = useDemo();

    const [konfirmasi, setKonfirmasi] = useState(null);
    const [catatan, setCatatan] = useState('');

    const aktif = (pengiriman ?? []).filter((p) => p.status !== 'selesai');
    const selesai = (pengiriman ?? []).filter((p) => p.status === 'selesai');

    async function lanjut(p, statusBaru) {
        try {
            await majukanStatus(p.pesanan_id, statusBaru, 'Kurir');
            tambahToast(
                statusBaru === 'selesai'
                    ? `Pengiriman ${p.kode} selesai. Ongkir masuk ke pendataranmu.`
                    : `Status ${p.kode} diperbarui.`,
                'sukses',
            );
            setKonfirmasi(null);
            setCatatan('');
        } catch (salah) {
            tambahToast(salah.message, 'bahaya');
        }
    }

    return (
        <DashboardLayout judul="Pengiriman Aktif" peran={ROLES.KURIR}>
            <Head title="Pengiriman Aktif" />

            <div className="mb-5">
                <PageHeader
                    judul="Pengiriman aktif"
                    deskripsi="Perbarui status setiap tahap agar pembeli dapat memantau."
                    ikon={Route}
                />
            </div>

            {!aktif.length ? (
                <Kosong
                    ikon={Package}
                    judul="Tidak ada pengiriman aktif"
                    deskripsi="Klaim pesanan yang tersedia untuk mulai mengantar."
                    aksi={
                        <Button as={Link} href="/courier/tersedia">Lihat pesanan tersedia</Button>
                    }
                    className="rounded-3xl border border-slate-200 bg-white py-10"
                />
            ) : (
                <ul className="space-y-4">
                    {aktif.map((p) => {
                        const pesanan = (seed.pesanan ?? []).find(
                            (x) => String(x.id) === String(p.pesanan_id),
                        );

                        return (
                            <li key={p.id}>
                                <Card elevate className="p-4 sm:p-5">
                                    <div className="grid gap-4 lg:grid-cols-3">
                                        <div className="lg:col-span-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Link
                                                    href={`/courier/pengiriman/${p.kode}`}
                                                    className="text-[15px] font-extrabold text-navy-900 hover:text-powder-600"
                                                >
                                                    {p.kode}
                                                </Link>
                                                <Badge tone={toneBadgeStatus(pesanan?.status)}>
                                                    {pesanan?.status?.replace(/_/g, ' ') ?? 'diProses'}
                                                </Badge>
                                            </div>

                                            <p className="mt-2 inline-flex items-start gap-1.5 text-[12px] text-navy-600">
                                                <MapPin className="mt-0.5 size-3.5 shrink-0 text-navy-300" />
                                                {alamatTeks(p)}
                                            </p>

                                            <div className="mt-3.5">
                                                <StepperStatus
                                                    status={pesanan?.status ?? 'dibuat_untuk_kurir'}
                                                    timeline={pesanan?.timeline}
                                                />
                                            </div>

                                            <ul className="mt-3 space-y-1">
                                                {(pesanan?.items ?? []).map((it) => (
                                                    <li
                                                        key={it.id ?? it.menu_id}
                                                        className="flex items-center justify-between gap-3 text-[12px]"
                                                    >
                                                        <span className="truncate text-navy-600">
                                                            <span className="font-bold text-navy-800">
                                                                {it.qty}x
                                                            </span>{' '}
                                                            {it.nama}
                                                        </span>
                                                        <span className="shrink-0 font-bold text-navy-700">
                                                            {rupiah(it.subtotal ?? it.harga * it.qty)}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <p className="text-[10px] font-bold tracking-wide text-navy-400 uppercase">
                                                Ongkir
                                            </p>
                                            <p className="text-lg font-extrabold text-navy-900">
                                                {rupiah(ongkirNilai(p))}
                                            </p>

                                            <dl className="mt-2.5 space-y-1.5 text-[11px]">
                                                <InfoRow
                                                    label="Jarak"
                                                    nilai={jarakTeks(p) ?? '-'}
                                                    ikon={Navigation}
                                                />
                                                <InfoRow
                                                    label="Diklaim"
                                                    nilai={waktuRelatif(p.diambil_pada)}
                                                />
                                            </dl>

                                            <div className="mt-4 space-y-2">
                                                {TAHAP.map((t) => {
                                                    const aktifTahap =
                                                        pesanan?.status === t.s ||
                                                        (t.s === 'diambil_kurir' &&
                                                            pesanan?.status === 'dalam_pengiriman') ||
                                                        (t.s === 'dalam_pengiriman' &&
                                                            pesanan?.status === 'diambil_kurir');

                                                    return (
                                                        <Button
                                                            key={t.s}
                                                            className="w-full"
                                                            varian={aktifTahap ? 'utama' : 'garis'}
                                                            ukuran="sm"
                                                            disabled={busy || aktifTahap}
                                                            onClick={() =>
                                                                t.s === 'selesai'
                                                                    ? setKonfirmasi(p)
                                                                    : lanjut(p, t.s)
                                                            }
                                                        >
                                                            {t.s === 'selesai' ? (
                                                                <Check className="size-3.5" />
                                                            ) : (
                                                                <Navigation className="size-3.5" />
                                                            )}
                                                            {t.l}
                                                        </Button>
                                                    );
                                                })}
                                            </div>

                                            {teleponPembeli(pesanan) ? (
                                                <a
                                                    href={`tel:${teleponPembeli(pesanan)}`}
                                                    className="mt-2 flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 py-2 text-[12px] font-bold text-navy-600 transition hover:bg-white"
                                                >
                                                    <Phone className="size-3.5" />
                                                    Hubungi pembeli
                                                </a>
                                            ) : (
                                                <p className="mt-2 flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-slate-200 py-2 text-[12px] font-semibold text-navy-400">
                                                    <Phone className="size-3.5" />
                                                    Nomor pembeli tidak tersedia
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </li>
                        );
                    })}
                </ul>
            )}

            {selesai.length ? (
                <Card elevate className="mt-5 p-5">
                    <p className="text-[13px] font-extrabold text-navy-900">
                        Selesai minggu ini ({selesai.length})
                    </p>
                    <ul className="mt-2.5 flex flex-wrap gap-2">
                        {selesai.map((p) => (
                            <li key={p.id}>
                                <Link
                                    href={`/courier/pengiriman/${p.kode}`}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-3 py-1.5 text-[11px] font-bold text-success-700"
                                >
                                    <Check className="size-3" />
                                    {p.kode}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Card>
            ) : null}

            <Modal
                buka={Boolean(konfirmasi)}
                tutup={() => setKonfirmasi(null)}
                judul="Selesaikan pengiriman?"
                deskripsi={`Pesanan ${konfirmasi?.kode ?? ''} akan ditandai selesai dan ongkir masuk ke pendataanmu.`}
                ikon={Check}
                footer={
                    <>
                        <Button varian="garis" onClick={() => setKonfirmasi(null)}>
                            Batal
                        </Button>
                        <Button
                            disabled={busy}
                            onClick={() => konfirmasi && lanjut(konfirmasi, 'selesai')}
                        >
                            Ya, selesai
                        </Button>
                    </>
                }
            >
                <Textarea
                    baris={3}
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Catatan serah terima, misalnya barang diterima pembeli."
                />
            </Modal>
        </DashboardLayout>
    );
}
