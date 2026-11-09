import { Link } from '@inertiajs/react';
import { AtSign, Globe2, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useDemo } from '../../stores/DemoContext';
import Logo from '../ui/Logo';

const SOSMED = [
    { Ikon: AtSign, label: 'Instagram', href: 'https://instagram.com/preorderly' },
    { Ikon: MessageCircle, label: 'Facebook', href: 'https://facebook.com/preorderly' },
    { Ikon: Globe2, label: 'Website', href: 'https://preorderly.id' },
];

const TAUTAN = {
    Pembeli: [
        { label: 'Cari Makanan', href: '/cari' },
        { label: 'Pesanan Saya', href: '/pesanan' },
        { label: 'Notifikasi', href: '/notifikasi' },
        { label: 'Profil', href: '/profil' },
    ],
    Penjual: [
        { label: 'Dashboard Penjual', href: '/seller' },
        { label: 'Kelola Pesanan', href: '/seller/pesanan' },
        { label: 'Kelola Menu', href: '/seller/menu' },
        { label: 'Jadwal Produksi', href: '/seller/jadwal' },
        { label: 'Profil Toko', href: '/seller/toko' },
    ],
    Kurir: [
        { label: 'Dashboard Kurir', href: '/courier' },
        { label: 'Pesanan Tersedia', href: '/courier/tersedia' },
        { label: 'Pengiriman', href: '/courier/pengiriman' },
        { label: 'Riwayat', href: '/courier/riwayat' },
    ],
    Admin: [
        { label: 'Dashboard Admin', href: '/admin' },
        { label: 'Verifikasi', href: '/admin/verifikasi' },
        { label: 'Pengguna', href: '/admin/pengguna' },
        { label: 'Restoran', href: '/admin/restoran' },
        { label: 'Pesanan', href: '/admin/pesanan' },
    ],
};

const BANTUAN = [
    { label: 'Tentang Preorderly', href: '/tentang' },
    { label: 'Kebijakan Privasi', href: '/kebijakan-privasi' },
];

const PERAN_TAUTAN = {
    Pembeli: 'pembeli',
    Penjual: 'penjual',
    Kurir: 'kurir',
    Admin: 'admin',
};

export default function Footer() {
    const { peran } = useDemo();

    const tautanPeran = Object.entries(TAUTAN).filter(
        ([judul]) => peran && PERAN_TAUTAN[judul] === peran,
    );

    return (
        <footer className="mt-16 border-t border-slate-200/70 bg-white/60 pb-24 backdrop-blur-sm lg:pb-10">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
                    <div className="lg:col-span-2">
                        <Logo ukuran="md" />
                        <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-navy-500">
                            Preorderly menghubungkan dapur rumahan, restoran, dan kurir lokal dalam satu platform. Pesan
                            hari ini, diantar besok — tanpa drama chat dan markup harga yang tidak masuk akal.
                        </p>
                        <div className="mt-5 flex items-center gap-2">
                            {SOSMED.map(({ Ikon, label, href }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    aria-label={label}
                                    title={label}
                                    className="grid size-9 place-items-center rounded-xl border border-slate-200 bg-white text-navy-400 transition-colors hover:border-powder-300 hover:text-powder-600"
                                >
                                    <Ikon className="size-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {tautanPeran.map(([judul, isi]) => (
                        <div key={judul}>
                            <p className="text-[11px] font-extrabold tracking-wider text-navy-900 uppercase">
                                {judul}
                            </p>
                            <ul className="mt-4 space-y-2.5">
                                {isi.map((t) => (
                                    <li key={t.href}>
                                        <Link
                                            href={t.href}
                                            className="text-[13px] text-navy-500 transition-colors hover:text-powder-600"
                                        >
                                            {t.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-10 flex flex-col gap-3 border-t border-slate-200/70 pt-6 text-[12px] text-navy-400 sm:flex-row sm:items-center sm:justify-between">
                    <p>&copy; {new Date().getFullYear()} Preorderly. Tugas besar mata kuliah pemrograman web.</p>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                        <span className="inline-flex items-center gap-1.5">
                            <MapPin className="size-3.5" />
                            Bandung, Jawa Barat
                        </span>
                        <a
                            href="mailto:halo@preorderly.id"
                            className="inline-flex items-center gap-1.5 transition-colors hover:text-powder-600"
                        >
                            <Mail className="size-3.5" />
                            halo@preorderly.id
                        </a>
                        <a
                            href="tel:+6281234567890"
                            className="inline-flex items-center gap-1.5 transition-colors hover:text-powder-600"
                        >
                            <Phone className="size-3.5" />
                            0812-3456-7890
                        </a>
                    </div>
                </div>

                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                    {BANTUAN.map((t) => (
                        <li key={t.href}>
                            <Link
                                href={t.href}
                                className="text-[12px] text-navy-400 underline-offset-4 transition-colors hover:text-powder-600 hover:underline"
                            >
                                {t.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </footer>
    );
}
