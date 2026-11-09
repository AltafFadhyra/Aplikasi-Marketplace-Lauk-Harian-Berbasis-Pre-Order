import { Head, Link, usePage } from '@inertiajs/react';
import { CheckCircle2, Copy, MapPin, Package, Share2 } from 'lucide-react';
import { useState } from 'react';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { StepperStatus, Timeline } from '../../Components/ui/Stepper';
import AppLayout from '../../Layouts/AppLayout';
import { metodePembayaran, toneBadgeStatus } from '../../lib/constants';
import { rupiah, waktuLengkap } from '../../lib/format';
import { alamatNama, alamatTeks, namaPembeli } from '../../lib/pesanan';
import { useDemo } from '../../stores/DemoContext';

export default function OrderSuccess() {
    const { kode } = usePage().props;
    const { pesanan, tambahToast } = useDemo();
    const [salin, setSalin] = useState(false);

    const pesan = pesanan.find((p) => p.kode === kode);

    if (!pesan) {
        return (
            <AppLayout>
                <Head title="Pesanan Berhasil" />
                <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
                    <Card elevate className="p-8 text-center">
                        <CheckCircle2 className="mx-auto size-14 text-success-500" />
                        <h1 className="mt-4 text-xl font-extrabold text-navy-900">Pesanan diterima</h1>
                        <p className="mt-2 text-[13px] text-navy-500">
                            Kode pesanan <span className="font-bold text-navy-800">{kode ?? '-'}</span> sudah
                            tercatat. Buka daftar pesanan untuk melihat detailnya.
                        </p>
                        <Button as={Link} href="/pesanan" className="mt-5">Lihat pesanan saya</Button>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    const metode = metodePembayaran(pesan.metode_bayar);

    async function salinKode() {
        try {
            await navigator.clipboard.writeText(pesan.kode);
            setSalin(true);
            tambahToast('Kode pesanan disalin.', 'sukses');
            setTimeout(() => setSalin(false), 2000);
        } catch {
            tambahToast('Browser tidak mengizinkan menyalin otomatis.', 'error');
        }
    }

    async function bagikan() {
        const teks = `Pesanan ${pesan.kode} di ${pesan.restoran_nama} - Preorderly`;

        if (navigator.share) {
            try {
                await navigator.share({ title: 'Preorderly', text: teks });
                tambahToast('Berhasil membagikan pesanan.', 'sukses');
                return;
            } catch (e) {
                if (e?.name === 'AbortError') return;
            }
        }

        try {
            await navigator.clipboard.writeText(teks);
            tambahToast('Teks pesanan disalin. Tempel di WhatsApp untuk membagikan.', 'sukses');
        } catch {
            window.open(`https://wa.me/?text=${encodeURIComponent(teks)}`, '_blank', 'noopener');
            tambahToast('Membuka WhatsApp untuk membagikan pesanan.', 'info');
        }
    }

    return (
        <AppLayout>
            <Head title="Pesanan Berhasil" />

            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
                <div className="text-center">
                    <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-success-50 text-success-500">
                        <CheckCircle2 className="size-8" strokeWidth={2.2} />
                    </span>
                    <h1 className="mt-4 text-2xl font-extrabold text-navy-900 sm:text-3xl">
                        Pesanan berhasil dibuat!
                    </h1>
                    <p className="mt-2 text-[14px] text-navy-500">
                        {pesan.restoran_nama} sudah menerima pesananmu dan mulai dimasak.
                    </p>
                </div>

                <Card elevate className="mt-6 overflow-hidden">
                    {/* Kode pesanan */}
                    <div className="flex flex-col items-center gap-3 border-b border-dashed border-slate-200 bg-slate-50/70 px-5 py-5 sm:flex-row sm:justify-between">
                        <div>
                            <p className="text-[10px] font-bold tracking-wider text-navy-400 uppercase">
                                Kode pesanan
                            </p>
                            <p className="font-mono text-xl font-extrabold text-navy-900">{pesan.kode}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button ukuran="sm" varian="garis" onClick={salinKode}>
                                <Copy className="size-3.5" />
                                {salin ? 'Tersalin' : 'Salin'}
                            </Button>
                            <Button ukuran="sm" varian="garis" onClick={bagikan}>
                                <Share2 className="size-3.5" />
                                Bagikan
                            </Button>
                        </div>
                    </div>

                    <div className="p-5">
                        <StepperStatus status={pesan.status} timeline={pesan.timeline} />

                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2.5 rounded-2xl bg-slate-50 p-4">
                                <p className="text-[11px] font-bold text-navy-700">Diantar dari</p>
                                <p className="text-[13px] font-extrabold text-navy-900">{pesan.restoran_nama}</p>
                                <p className="text-[11px] text-navy-400">
                                    Slot{' '}
                                    {pesan.slot_label ??
                                        (pesan.eta ? waktuLengkap(pesan.eta) : '-')}
                                </p>
                            </div>

                            <div className="space-y-2.5 rounded-2xl bg-slate-50 p-4">
                                <p className="text-[11px] font-bold text-navy-700">Diantar ke</p>
                                <p className="text-[13px] font-extrabold text-navy-900">
                                    {alamatNama(pesan) || namaPembeli(pesan)}
                                </p>
                                <p className="flex items-start gap-1.5 text-[11px] text-navy-400">
                                    <MapPin className="mt-px size-3 shrink-0" />
                                    {alamatTeks(pesan)}
                                </p>
                            </div>
                        </div>

                        {/* Item */}
                        <ul className="mt-5 divide-y divide-slate-100 border-y border-slate-100">
                            {(pesan.items ?? []).map((b, i) => (
                                <li key={i} className="flex items-center gap-3 py-3">
                                    <img
                                        src={b.gambar}
                                        alt={b.nama}
                                        onError={(e) => {
                                            e.currentTarget.style.visibility = 'hidden';
                                        }}
                                        className="size-12 shrink-0 rounded-xl object-cover"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[12px] font-bold text-navy-900">{b.nama}</p>
                                        <p className="text-[10px] text-navy-400">{rupiah(b.harga)} Ã— {b.qty}</p>
                                    </div>
                                    <p className="shrink-0 text-[12px] font-extrabold text-navy-900">
                                        {rupiah(b.harga * b.qty)}
                                    </p>
                                </li>
                            ))}
                        </ul>

                        {/* Biaya */}
                        <dl className="mt-4 space-y-2 text-[13px]">
                            <div className="flex justify-between">
                                <dt className="text-navy-400">Subtotal</dt>
                                <dd className="font-bold text-navy-900">{rupiah(pesan.subtotal)}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-navy-400">Ongkir</dt>
                                <dd className="font-bold text-navy-900">
                                    {pesan.ongkir_gratis ? 'Gratis' : rupiah(pesan.ongkir)}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-navy-400">Biaya layanan</dt>
                                <dd className="font-bold text-navy-900">{rupiah(pesan.biaya_layanan)}</dd>
                            </div>

                            <div className="flex justify-between border-t border-dashed border-slate-200 pt-3">
                                <dt className="font-extrabold text-navy-800">Total</dt>
                                <dd className="text-lg font-extrabold text-navy-900">{rupiah(pesan.total)}</dd>
                            </div>

                            <div className="flex justify-between rounded-xl bg-powder-50 px-3 py-2.5">
                                <dt className="font-bold text-powder-700">
                                    Metode: {metode.label} Â· {toneBadgeStatus(pesan.status) === 'sukses' ? 'Lunas' : 'Belum lunas'}
                                </dt>
                                <dd className="font-extrabold text-powder-700">
                                    {rupiah(pesan.dibayar_sebesar ?? 0)}
                                </dd>
                            </div>

                            {pesan.sisa_tagihan > 0 ? (
                                <div className="flex justify-between px-1 text-[12px]">
                                    <dt className="text-navy-400">Sisa tagihan saat diterima</dt>
                                    <dd className="font-bold text-navy-600">{rupiah(pesan.sisa_tagihan)}</dd>
                                </div>
                            ) : null}
                        </dl>
                    </div>
                </Card>

                <Card className="mt-5 p-5">
                    <h2 className="text-[14px] font-extrabold text-navy-900">Riwayat status</h2>
                    <div className="mt-4">
                        <Timeline items={pesan.timeline ?? []} />
                    </div>
                </Card>

                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                    <Button as={Link} href="/pesanan" lebarPenuh varian="garis" className="flex-1">
                            <Package className="size-4" />
                            Lacak pesanan
                        </Button>
                    <Button as={Link} href="/cari" lebarPenuh className="flex-1">Lanjut pesan lagi</Button>
                </div>
            </div>
        </AppLayout>
    );
}
