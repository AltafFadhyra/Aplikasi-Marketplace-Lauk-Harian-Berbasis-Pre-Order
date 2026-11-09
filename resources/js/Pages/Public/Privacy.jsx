import { Head, Link } from '@inertiajs/react';
import { FileLock, ShieldCheck, Trash2 } from 'lucide-react';
import Badge from '../../Components/ui/Badge';
import Card from '../../Components/ui/Card';
import AppLayout from '../../Layouts/AppLayout';

const BAGIAN = [
    {
        judul: 'Data yang kami kumpulkan',
        poin: [
            'Data akun: nama, email, nomor telepon, dan NIK yang disensor saat ditampilkan.',
            'Data transaksi: riwayat pesanan, metode pembayaran, dan alamat pengiriman.',
            'Data operasional: lokasi pengantaran, riwayat pengiriman kurir, dan catatan oleh restoran.',
        ],
    },
    {
        judul: 'Tujuan penggunaan',
        poin: [
            'Memproses pesanan, menghitung ongkir, dan menjadwalkan produksi.',
            'Memverifikasi identitas restoran, penjual, dan kurir.',
            'Mengirim notifikasi pemesanan dan pembaruan status pengiriman.',
        ],
    },
    {
        judul: 'Berbagi data',
        poin: [
            'Data penerima hanya dibagikan kepada restoran dan kurir yang mengerjakan pesananmu.',
            'Tidak ada penjualan data kepada pihak ketiga untuk keperluan pemasaran.',
            'Berbagi data hanya dilakukan jika diwajibkan oleh peraturan perundang-undangan.',
        ],
    },
    {
        judul: 'Keamanan',
        poin: [
            'Dokumen verifikasi disimpan dalam bentuk terenkripsi dan hanya diakses admin berwenang.',
            'NIK ditampilkan tersensor, misalnya 3201****0001.',
            'Password disimpan dengan hashing dan tidak pernah ditampilkan kembali.',
        ],
    },
    {
        judul: 'Retensi dan penghapusan',
        poin: [
            'Dokumen verifikasi disimpan maksimal 5 tahun setelah akun ditutup.',
            'Data pesanan disimpan sesuai kewajiban pembukuan selama 5 tahun.',
            'Kamu dapat meminta penghapusan akun dan data pribadi kapan saja.',
        ],
    },
    {
        judul: 'Hak kamu sebagai pengguna',
        poin: [
            'Melihat dan mengunduh salinan data pribadi kamu.',
            'Mengoreksi data yang tidak akurat.',
            'Menarik persetujuan atas pemrosesan data tertentu.',
        ],
    },
];

export default function Privacy() {
    return (
        <AppLayout>
            <Head title="Kebijakan Privasi" />

            <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-9">
                <Badge tone="powder" ikon={FileLock} className="mb-3">
                    Dokumen internal
                </Badge>

                <h1 className="text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">
                    Kebijakan Privasi Preorderly
                </h1>
                <p className="mt-2 text-[13px] text-navy-400">
                    Terakhir diperbarui:
                </p>

                <Card elevate className="mt-5 flex items-start gap-3.5 border-butter-200 bg-butter-50/50 p-4">
                    <ShieldCheck className="mt-0.5 size-5 shrink-0 text-butter-700" />
                    <p className="text-[12px] leading-relaxed text-navy-600">
                        Halaman ini disusun sebagai rancangan kebijakan untuk proyek pemrograman web. Pada
                        fase produksi, dokumen final akan disusun bersama penasihat hukum dan instansi terkatif.
                    </p>
                </Card>

                <div className="mt-6 space-y-5">
                    {BAGIAN.map((b) => (
                        <Card key={b.judul} elevate className="p-5">
                            <h2 className="text-[15px] font-extrabold text-navy-900">{b.judul}</h2>
                            <ul className="mt-3 space-y-2">
                                {b.poin.map((p) => (
                                    <li key={p} className="flex gap-2.5 text-[13px] leading-relaxed text-navy-600">
                                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-powder-400" />
                                        {p}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    ))}
                </div>

                <Card className="mt-5 p-5">
                    <h2 className="flex items-center gap-2 text-[15px] font-extrabold text-navy-900">
                        <Trash2 className="size-4 text-danger-500" />
                        Penghapusan akun
                    </h2>
                    <p className="mt-2 text-[13px] leading-relaxed text-navy-600">
                        Kirim permintaan penghapusan akun dari halaman Profil, atau hubungi admin platform. Akun akan
                        dinonaktifkan dalam 7 hari kerja dan data yang wajib disimpan akan diarsipkan.
                    </p>
                    <Link href="/profil">
                        <span className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-bold text-powder-600 hover:underline">
                            Buka pengaturan profil
                        </span>
                    </Link>
                </Card>

                <p className="mt-6 text-center text-[11px] text-navy-300">
                    Ada pertanyaan? Lihat{' '}
                    <Link href="/tentang" className="font-bold text-powder-600 hover:underline">
                        halaman tentang kami
                    </Link>
                    .
                </p>
            </div>
        </AppLayout>
    );
}
