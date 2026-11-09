import { Link } from '@inertiajs/react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import Logo from '../Components/ui/Logo';

export default function GuestLayout({ children, judul, deskripsi, eyebrow, kembali = true, backHref = '/' }) {
    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            {/* Panel kiri: form */}
            <div className="flex flex-col px-5 py-6 sm:px-8 lg:px-12 xl:px-20">
                <div className="flex items-center justify-between">
                    <Link href="/" aria-label="Preorderly — beranda">
                        <Logo ukuran="sm" />
                    </Link>
                    {kembali ? (
                        <Link
                            href={backHref}
                            className="inline-flex items-center gap-1.5 rounded-2xl px-3 py-2 text-[13px] font-bold text-navy-500 transition-colors hover:bg-white hover:text-powder-600"
                        >
                            <ArrowLeft className="size-4" />
                            Kembali
                        </Link>
                    ) : null}
                </div>

                <div className="flex flex-1 items-center py-8">
                    <div className="mx-auto w-full max-w-md">
                        {eyebrow ? (
                            <p className="mb-2 text-[11px] font-extrabold tracking-[0.14em] text-powder-600 uppercase">
                                {eyebrow}
                            </p>
                        ) : null}
                        <h1 className="text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">{judul}</h1>
                        {deskripsi ? (
                            <p className="mt-2 text-[14px] leading-relaxed text-navy-500">{deskripsi}</p>
                        ) : null}

                        <div className="mt-7">{children}</div>
                    </div>
                </div>

                <p className="text-center text-[11px] text-navy-300">
                    Dengan melanjutkan, kamu menyetujui{' '}
                    <Link href="/kebijakan-privasi" className="font-semibold text-powder-600 hover:underline">
                        Kebijakan Privasi
                    </Link>{' '}
                    Preorderly.
                </p>
            </div>

            {/* Panel kanan: identitas visual */}
            <div className="relative hidden overflow-hidden bg-navy-900 lg:block">
                <div className="absolute inset-0 opacity-90">
                    <img
                        src="/images/banners/banner-1.jpg"
                        alt=""
                        className="size-full object-cover"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-navy-900/92 via-navy-900/80 to-powder-700/70" />

                <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
                    <div className="flex items-center gap-2 text-white/70">
                        <ShieldCheck className="size-4" />
                        <span className="text-[11px] font-bold tracking-[0.14em] uppercase">
                            Mitra terverifikasi Preorderly
                        </span>
                    </div>

                    <div className="max-w-md">
                        <h2 className="text-3xl leading-tight font-extrabold text-white xl:text-4xl">
                            Dapur lokalmu, punya pasar sendiri.
                        </h2>
                        <p className="mt-4 text-[15px] leading-relaxed text-white/75">
                            Bergabung dengan 13 restoran pilihan di Bandung. Kelola menu, atur jadwal produksi, dan
                            terima pesanan pre-order tanpa ribet.
                        </p>

                        <dl className="mt-8 grid grid-cols-3 gap-4">
                            {[
                                { n: '13', l: 'Restoran' },
                                { n: '5', l: 'Kurir' },
                                { n: '4.6', l: 'Rating rata-rata' },
                            ].map((s) => (
                                <div key={s.l} className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                                    <dt className="text-2xl font-extrabold text-butter-400">{s.n}</dt>
                                    <dd className="mt-0.5 text-[11px] font-semibold text-white/70">{s.l}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    <p className="text-[11px] text-white/40">
                        &copy; {new Date().getFullYear()} Preorderly. Tugas besar pemrograman web.
                    </p>
                </div>
            </div>
        </div>
    );
}
