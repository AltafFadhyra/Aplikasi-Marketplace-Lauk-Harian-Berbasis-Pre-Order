import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, Check, ChefHat, MapPin, Package, Phone, Printer, Truck, User } from 'lucide-react';
import { useState } from 'react';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Kosong } from '../../Components/ui/Feedback';
import { Textarea } from '../../Components/ui/Form';
import { StepperStatus, Timeline } from '../../Components/ui/Stepper';
import { InfoRow, SectionHeading } from '../../Components/ui/Misc';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { ROLES, STATUS_PESANAN, toneBadgeStatus } from '../../lib/constants';
import { tanggalPanjang, waktuLengkap, waktuRelatif } from '../../lib/format';
import {
    alamatTeks,
    namaPembeli,
    ongkirGratis,
    ongkirNilai,
    subTotalPesanan,
    sudahLunas,
    teleponPembeli,
} from '../../lib/pesanan';
import { useDemo } from '../../stores/DemoContext';

const CATATAN = [
    'Pedas',
    'Tanpa sambal',
    'Packing lunch box',
    'Bungkus terpisah',
    'Es sedikit',
];

export default function OrderDetail() {
    const { kode } = usePage().props;
    const { seed, busy, majukanStatus, tambahToast, tambahNotifikasi } = useDemo();

    const [catatan, setCatatan] = useState('');
    const [aksi, setAksi] = useState(null);

    const pesan = (seed.pesanan ?? []).find((p) => String(p.kode) === String(kode));

    if (!pesan) {
        return (
            <DashboardLayout judul="Detail Pesanan" peran={ROLES.PENJUAL}>
                <Head title="Pesanan Tidak Ditemukan" />
                <Kosong
                    ikon={Package}
                    judul="Pesanan tidak ditemukan"
                    deskripsi={`Kode ${kode} tidak ada dalam daftar toko kamu.`}
                />
            </DashboardLayout>
    );
    }

    const meta = STATUS_PESANAN[pesan.status] ?? {};
    const lanjutan = [
        { s: 'dikonfirmasi', l: 'Konfirmasi pesanan' },
        { s: 'sedang_dimasak', l: 'Mulai masak' },
        { s: 'siap_diambil', l: 'Tandai siap' },
        { s: 'dibuat_untuk_kurir', l: 'Serahkan ke kurir' },
        { s: 'selesai', l: 'Selesaikan' },
    ];

    const bisaMaju = lanjutan.some((x) =>
        ['dikonfirmasi', 'sedang_dimasak', 'siap_diambil', 'dibuat_untuk_kurir'].includes(x.s),
    );

    async function ubahStatus(baru) {
        setAksi(baru);
        try {
            await majukanStatus(pesan.id, baru, 'Penjual');
            tambahNotifikasi({
                judul: `Pesanan ${pesan.kode} ${baru.replace(/_/g, ' ')}`,
                isi: 'Status pesanan berhasil diperbarui oleh restoran.',
                tipe: 'pesanan',
                link: `/pesanan/${pesan.kode}`,
            });
        } finally {
            setAksi(null);
        }
    }

    return (
        <DashboardLayout judul={`Pesanan ${pesan.kode}`} peran={ROLES.PENJUAL}>
            <Head title={`Pesanan ${pesan.kode}`} />

            <a
                href="/seller/pesanan"
                className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-bold text-navy-400 hover:text-powder-600"
            >
                <ArrowLeft className="size-3.5" />
                Kembali ke daftar pesanan
            </a>

            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl font-extrabold text-navy-900 sm:text-2xl">{pesan.kode}</h1>
                        <Badge tone={toneBadgeStatus(pesan.status)} ikon={meta.ikon}>
                            {meta.label ?? pesan.status}
                        </Badge>
                    </div>
                    <p className="mt-1 text-[12px] text-navy-400">
                        Dibuat {waktuRelatif(pesan.dibuat_pada)} · {waktuLengkap(pesan.dibuat_pada)}
                    </p>
                </div>

                <Button
                    varian="garis"
                    ukuran="sm"
                    ikon={Printer}
                    onClick={() => window.print()}
                >
                    Cetak struk
                </Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    <Card elevate className="p-5">
                        <SectionHeading judul="Rincian pesanan" ikon={Package} />

                        <ul className="mt-4 space-y-3">
                            {(pesan.items ?? []).map((it) => (
                                <li
                                    key={it.id ?? it.menu_id}
                                    className="flex items-center gap-3.5 rounded-2xl bg-slate-50 p-3"
                                >
                                    <img
                                        src={it.gambar}
                                        alt={it.nama}
                                        onError={(e) => {
                                            e.currentTarget.style.visibility = 'hidden';
                                        }}
                                        className="size-14 shrink-0 rounded-2xl object-cover"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[13px] font-extrabold text-navy-900">
                                            {it.nama}
                                        </p>
                                        {it.catatan ? (
                                            <p className="mt-0.5 text-[11px] text-navy-500">
                                                Catatan: {it.catatan}
                                            </p>
                                        ) : null}
                                        <p className="mt-0.5 text-[11px] text-navy-400">
                                            {it.qty} x {rupiahLokal(it.harga)}
                                        </p>
                                    </div>
                                    <p className="shrink-0 text-[13px] font-extrabold text-navy-900">
                                        {rupiahLokal(it.subtotal ?? it.harga * it.qty)}
                                    </p>
                                </li>
                            ))}
                        </ul>

                        <dl className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-[12px]">
                            <div className="flex justify-between">
                                <dt className="text-navy-500">Subtotal</dt>
                                <dd className="font-bold text-navy-800">{rupiahLokal(subTotalPesanan(pesan))}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-navy-500">Ongkir</dt>
                                <dd className="font-bold text-navy-800">
                                    {ongkirGratis(pesan)
                                        ? 'Gratis ongkir'
                                        : rupiahLokal(ongkirNilai(pesan))}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-navy-500">Biaya layanan</dt>
                                <dd className="font-bold text-navy-800">
                                    {rupiahLokal(pesan.biaya_layanan)}
                                </dd>
                            </div>
                            <div className="flex justify-between border-t border-slate-100 pt-2">
                                <dt className="font-extrabold text-navy-900">Total</dt>
                                <dd className="text-[15px] font-extrabold text-navy-900">
                                    {rupiahLokal(pesan.total)}
                                </dd>
                            </div>
                        </dl>
                    </Card>

                    <Card elevate className="p-5">
                        <SectionHeading judul="Catatan untuk dapur" />
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {CATATAN.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setCatatan((v) => (v ? `${v}, ${c}` : c))}
                                    className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-navy-600 transition hover:bg-powder-50 hover:text-powder-700"
                                >
                                    + {c}
                                </button>
                            ))}
                        </div>
                        <div className="mt-3">
                            <Textarea
                                value={catatan}
                                onChange={(e) => setCatatan(e.target.value)}
                                baris={2}
                                placeholder="Contoh: pesanan untuk jam makan siang, mohon siapkan eksklusif."
                            />
                        </div>
                        <div className="mt-2 flex justify-end">
                            <Button
                                ukuran="sm"
                                onClick={() => {
                                    tambahToast('Catatan dapur disimpan.', 'sukses');
                                    setCatatan('');
                                }}
                            >
                                <Check className="size-3.5" />
                                Simpan catatan
                            </Button>
                        </div>
                    </Card>

                    <Card elevate className="p-5">
                        <SectionHeading judul="Riwayat status" />
                        <div className="mt-4">
                            <Timeline items={pesan.timeline ?? []} />
                        </div>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card elevate className="p-5">
                        <SectionHeading judul="Kemajuan" />
                        <div className="mt-4">
                            <StepperStatus status={pesan.status} timeline={pesan.timeline} />
                        </div>

                        {bisaMaju ? (
                            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                                <p className="text-[11px] font-bold text-navy-500">Tindakan berikutnya</p>
                                {lanjutan.map((x) => (
                                    <Button
                                        key={x.s}
                                        className="w-full"
                                        varian={x.s === 'selesai' ? 'lembut' : 'garis'}
                                        ukuran="sm"
                                        disabled={busy || aksi === x.s}
                                        onClick={() => ubahStatus(x.s)}
                                    >
                                        {x.s === 'sedang_dimasak' ? (
                                            <ChefHat className="size-3.5" />
                                        ) : x.s === 'dibuat_untuk_kurir' ? (
                                            <Truck className="size-3.5" />
                                        ) : (
                                            <Check className="size-3.5" />
                                        )}
                                        {x.l}
                                    </Button>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-[11px] text-navy-500">
                                Pesanan sudah selesai atau dibatalkan. Tidak ada tindakan lanjutan.
                            </p>
                        )}
                    </Card>

                    <Card className="p-5">
                        <SectionHeading judul="Pembeli" ikon={User} />
                        <dl className="mt-3 space-y-2">
                            <InfoRow label="Nama"                                 nilai={namaPembeli(pesan)} ikon={User} />
                            <InfoRow
                                label="Telepon"
                                nilai={teleponPembeli(pesan) || 'Tidak tersedia'}
                                ikon={Phone}
                            />
                            <InfoRow
                                label="Alamat"
                                nilai={alamatTeks(pesan)}
                                ikon={MapPin}
                            />
                        </dl>

                        {pesan.slot_id || pesan.slot_label ? (
                            <div className="mt-3 rounded-2xl bg-powder-50/70 px-4 py-3">
                                <p className="text-[11px] font-bold text-powder-700">Slot produksi</p>
                                <p className="mt-0.5 text-[12px] text-navy-600">
                                    {pesan.slot_label ?? `Slot #${pesan.slot_id}`}
                                </p>
                            </div>
                        ) : null}
                    </Card>

                    <Card className="p-5">
                        <SectionHeading judul="Pembayaran" />
                        <dl className="mt-3 space-y-2">
                            <InfoRow label="Metode" nilai={pesan.metode_bayar} />
                            <InfoRow
                                label="Status"
                                nilai={
                                    sudahLunas(pesan)
                                        ? 'Lunas'
                                        : `Belum lunas · ${rupiahLokal(pesan.sisa_tagihan)}`
                                }
                            />
                            {pesan.dibayar_sebesar ? (
                                <InfoRow
                                    label="Dibayar"
                                    nilai={rupiahLokal(pesan.dibayar_sebesar)}
                                />
                            ) : null}
                            <InfoRow
                                label="Jatuh tempo"
                                nilai={tanggalPanjang(pesan.kedaluwarsa)}
                            />
                        </dl>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}

function rupiahLokal(n) {
    const angka = Number(n ?? 0);

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(angka);
}
