import { Head, Link, router } from '@inertiajs/react';
import {
    Bell,
    BellOff,
    Check,
    CheckCheck,
    Package,
    ShieldCheck,
    Sparkles,
    Truck,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Kosong } from '../../Components/ui/Feedback';
import { PageHeader } from '../../Components/ui/Misc';
import AppLayout from '../../Layouts/AppLayout';
import { waktuRelatif } from '../../lib/format';
import { useDemo } from '../../stores/DemoContext';

const IKON_TIPE = {
    pesanan: Package,
    verifikasi: ShieldCheck,
    pengiriman: Truck,
    promo: Sparkles,
    sistem: Bell,
};

const LABEL_TIPE = {
    pesanan: 'Pesanan',
    verifikasi: 'Verifikasi',
    pengiriman: 'Pengiriman',
    promo: 'Promo',
    sistem: 'Sistem',
};

const TONE_TIPE = {
    pesanan: 'powder',
    verifikasi: 'butter',
    pengiriman: 'sukses',
    promo: 'bahaya',
    sistem: 'netral',
};

/**
 * Data notifikasi memuat link lama yang tidak ada di rute sekarang.
 * Petakan ke rute yang benar supaya tidak menabrak 404.
 */
const PETA_LINK = {
    '/orders': '/pesanan',
    '/courier/available': '/courier/tersedia',
    '/admin/verifications': '/admin/verifikasi',
    '/admin/orders': '/admin/pesanan',
};

function tujuanNotifikasi(link) {
    if (!link) return null;

    const tujuan = PETA_LINK[link] ?? link;

    return tujuan.startsWith('/') ? tujuan : null;
}

export default function Notifications() {
    const { notifikasi, notifikasiBelumDibaca, tandaiDibaca, tandaiSemuaDibaca, tambahToast } = useDemo();

    const [filter, setFilter] = useState('semua');
    const [tampil, setTampil] = useState(12);

    const terfilter = useMemo(() => {
        const urut = [...notifikasi].sort((a, b) => new Date(b.dibuat_pada) - new Date(a.dibuat_pada));

        if (filter === 'belum') return urut.filter((n) => !n.dibaca);
        if (filter === 'semua') return urut;

        return urut.filter((n) => n.tipe === filter);
    }, [notifikasi, filter]);

    function buka(n) {
        tandaiDibaca(n.id);

        const tujuan = tujuanNotifikasi(n.link);

        if (tujuan) {
            router.visit(tujuan);
        }
    }

    return (
        <AppLayout>
            <Head title="Notifikasi" />

            <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-7">
                <PageHeader
                    judul="Notifikasi"
                    deskripsi="Kabar terbaru tentang pesanan, pengiriman, dan akun kamu."
                    ikon={Bell}
                    aksi={
                        notifikasiBelumDibaca > 0 ? (
                            <Button
                                varian="garis"
                                ukuran="sm"
                                onClick={() => {
                                    tandaiSemuaDibaca();
                                    tambahToast('Semua notifikasi ditandai sudah dibaca.', 'sukses');
                                }}
                            >
                                <CheckCheck className="size-3.5" />
                                Tandai semua dibaca
                            </Button>
                        ) : null
                    }
                />

                {notifikasiBelumDibaca > 0 ? (
                    <div className="mb-4 flex items-center gap-2.5 rounded-2xl border border-powder-200 bg-powder-50/70 px-4 py-3">
                        <Bell className="size-4 shrink-0 text-powder-600" />
                        <p className="text-[12px] font-bold text-powder-700">
                            Kamu punya {notifikasiBelumDibaca} notifikasi yang belum dibaca.
                        </p>
                    </div>
                ) : null}

                <ul className="mb-4 flex gap-2 overflow-x-auto pb-1">
                    {[
                        { k: 'semua', l: 'Semua' },
                        { k: 'belum', l: 'Belum dibaca' },
                        { k: 'pesanan', l: 'Pesanan' },
                        { k: 'pengiriman', l: 'Pengiriman' },
                        { k: 'verifikasi', l: 'Verifikasi' },
                        { k: 'promo', l: 'Promo' },
                    ].map((f) => (
                        <li key={f.k} className="shrink-0">
                            <button
                                type="button"
                                onClick={() => {
                                    setFilter(f.k);
                                    setTampil(12);
                                }}
                                className={[
                                    'rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-colors',
                                    filter === f.k
                                        ? 'bg-powder-500 text-white'
                                        : 'bg-white text-navy-500 hover:bg-powder-50',
                                ].join(' ')}
                            >
                                {f.l}
                            </button>
                        </li>
                    ))}
                </ul>

                {!terfilter.length ? (
                    <Kosong
                        ikon={BellOff}
                        judul="Tidak ada notifikasi"
                        deskripsi="Belum ada notifikasi pada filter ini. Kabar terbaru akan muncul di sini."
                        className="rounded-3xl border border-white/70 bg-white/70 py-6"
                    />
                ) : (
                    <ul className="space-y-2.5">
                        {terfilter.slice(0, tampil).map((n) => {
                            const Ikon = IKON_TIPE[n.tipe] ?? Bell;

                            return (
                                <li key={n.id}>
                                    <Card
                                        hover
                                        as="button"
                                        onClick={() => buka(n)}
                                        className={[
                                            'flex w-full items-start gap-3.5 p-4 text-left',
                                            n.dibaca ? 'opacity-70' : 'ring-1 ring-powder-200',
                                        ].join(' ')}
                                    >
                                        <span
                                            className={[
                                                'grid size-10 shrink-0 place-items-center rounded-2xl',
                                                n.dibaca ? 'bg-slate-100 text-navy-400' : 'bg-powder-50 text-powder-600',
                                            ].join(' ')}
                                        >
                                            <Ikon className="size-4.5" />
                                        </span>

                                        <span className="min-w-0 flex-1">
                                            <span className="flex flex-wrap items-center gap-2">
                                                <span className="text-[13px] font-extrabold text-navy-900">
                                                    {n.judul}
                                                </span>
                                                <Badge tone={TONE_TIPE[n.tipe] ?? 'netral'} ukuran="xs">
                                                    {LABEL_TIPE[n.tipe] ?? 'Info'}
                                                </Badge>
                                                {!n.dibaca ? (
                                                    <span className="size-1.5 rounded-full bg-danger-500" />
                                                ) : null}
                                            </span>

                                            {n.isi ? (
                                                <span className="mt-1 block text-[12px] leading-relaxed text-navy-500">
                                                    {n.isi}
                                                </span>
                                            ) : null}

                                            <span className="mt-1.5 flex items-center gap-2 text-[10px] text-navy-300">
                                                {waktuRelatif(n.dibuat_pada)}
                                                {n.dibaca ? (
                                                    <span className="inline-flex items-center gap-0.5">
                                                        <Check className="size-3" />
                                                        Dibaca
                                                    </span>
                                                ) : null}
                                            </span>
                                        </span>

                                        {tujuanNotifikasi(n.link) ? (
                                            <span className="shrink-0 self-center text-[11px] font-bold text-powder-600">
                                                Lihat
                                            </span>
                                        ) : null}
                                    </Card>
                                </li>
                            );
                        })}
                    </ul>
                )}

                {terfilter.length > tampil ? (
                    <div className="mt-4 text-center">
                        <Button varian="garis" onClick={() => setTampil((t) => t + 12)}>
                            Muat lagi ({terfilter.length - tampil} tersisa)
                        </Button>
                    </div>
                ) : null}

                <p className="mt-6 text-center text-[11px] text-navy-300">
                    Notifikasi tampil di dalam aplikasi ini.{' '}
                    <Link href="/kebijakan-privasi" className="font-bold text-powder-600">
                        Baca kebijakan privasi
                    </Link>
                </p>
            </div>
        </AppLayout>
    );
}
