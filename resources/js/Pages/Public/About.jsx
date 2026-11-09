import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Bike,
    CalendarClock,
    ChefHat,
    ClipboardList,
    HeartHandshake,
    MapPin,
    ShieldCheck,
    Star,
    Store,
    Truck,
    Users,
} from 'lucide-react';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Avatar } from '../../Components/ui/Avatar';
import { SectionHeading } from '../../Components/ui/Misc';
import AppLayout from '../../Layouts/AppLayout';
import { useDemo } from '../../stores/DemoContext';

const FITUR = [
    {
        ikon: CalendarClock,
        judul: 'Pre-order terjadwal',
        teks: 'Pesan maksimal H+3 dengan slot produksi per jam. Dapur punya waktu menyiapkan dengan tenang, pembeli tetap dapat hasil segar.',
    },
    {
        ikon: Store,
        judul: 'Dapur lokal terverifikasi',
        teks: 'Setiap restoran melewati verifikasi NIB, NPWP, dan dokumen usaha sebelum bisa menerima pesanan.',
    },
    {
        ikon: Truck,
        judul: 'Kurir terverifikasi',
        teks: 'Kurir yang sudah diverifikasi dengan rating transparan, dilacak per tahap pengiriman.',
    },
    {
        ikon: ClipboardList,
        judul: 'Status transparan',
        teks: 'Dari diterima, dimasak, diantar, sampai selesai â€” setiap tahap bisa dilacak pembeli dan restoran.',
    },
    {
        ikon: ShieldCheck,
        judul: 'Pembayaran aman',
        teks: 'QRIS, transfer bank, DP 30%, atau COD dengan pencatatan status pembayaran yang jelas.',
    },
    {
        ikon: Bike,
        judul: 'Ongkir transparan',
        teks: 'Rp5.000 + Rp2.500/km, gratis ongkir untuk subtotal Rp75.000 ke dalam radius 12 km.',
    },
];

const ALUR = [
    { n: '01', judul: 'Cari dan pilih', teks: 'Temukan restoran, saring menu, dan lihat jadwal produksi yang tersedia.' },
    { n: '02', judul: 'Tentukan slot', teks: 'Pilih jam produksi, isi catatan rasa, dan tentukan metode pembayaran.' },
    { n: '03', judul: 'Dapur mulai memasak', teks: 'Restoran menerima pesanan lalu memasak dengan standar higienis.' },
    { n: '04', judul: 'Kurir mengantar', teks: 'Kurir terdekat diklaim, diperbarui status, dan mengantar sesuai alamat.' },
];

const NILAI = [
    { n: '55+', l: 'Pengguna aktif' },
    { n: '16', l: 'Restoran mitra' },
    { n: '84', l: 'Menu terdaftar' },
    { n: '4,6', l: 'Rating rata-rata' },
];

export default function About() {
    const { seed } = useDemo();
    const statistik = seed.statistik ?? {};
    const kurir = (seed.kurir ?? []).slice(0, 4);
    const restoran = (seed.restoran ?? []).slice(0, 3);

    return (
        <AppLayout>
            <Head title="Tentang Preorderly" />

            {/* Hero */}
            <section className="relative overflow-hidden bg-navy-900">
                <img
                    src="/images/banners/banner-2.jpg"
                    alt=""
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                    }}
                    className="absolute inset-0 size-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-900/90 to-powder-800/70" />

                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
                    <Badge tone="butter" className="mb-4">
                        Tugas besar pemrograman web
                    </Badge>

                    <h1 className="max-w-2xl text-3xl leading-tight font-extrabold text-white sm:text-4xl xl:text-5xl">
                        Marketplace yang menyambungkan dapur rumahan Bandung dengan meja makan keluarga.
                    </h1>

<p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-white/75">
                            Preorderly dibangun untuk keperluan pre-order yang selama ini tersebar di chat pribadi
                            dan media sosial. Kami menjadikannya satu produk: pencarian, pemesanan, penjadwalan produksi,
                            pembayaran, hingga pengiriman dalam satu alur yang transparan.
                        </p>

                    <div className="mt-7 flex flex-wrap gap-3">
                        <Button as={Link} href="/cari" ukuran="lg" className="bg-butter-400 text-navy-900 hover:bg-butter-500">
                                Jelajahi restoran
                                <ArrowRight className="size-4" />
                            </Button>
                        <Button as={Link} href="/auth/daftar-penjual" ukuran="lg" varian="ghost" className="border border-white/30 text-white hover:bg-white/10">
                                Gabung sebagai penjual
                            </Button>
                    </div>

                    <dl className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {NILAI.map((s) => (
                            <div key={s.l} className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur-sm">
                                <dt className="text-2xl font-extrabold text-butter-400">{s.n}</dt>
                                <dd className="mt-0.5 text-[11px] font-semibold text-white/70">{s.l}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* Masalah & solusi */}
            <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
                <div className="grid gap-8 lg:grid-cols-2">
                    <div>
                        <SectionHeading
                            judul="Kenapa Preorderly ada"
                            deskripsi="Pre-order undone punya manfaat, tapi cara lama masih terasa repot."
                        />
                        <div className="mt-4 space-y-3">
                            {[
                                {
                                    t: 'Pesanan tercecer di chat',
                                    d: 'Order masuk bercampur dengan obrolan, mudah kelewat, dan sulit dilacak.',
                                },
                                {
                                    t: 'Jadwal produksi tidak pasti',
                                    d: 'Pembeli tidak tahu kapan makanan benar-benar siap diambil atau diantar.',
                                },
                                {
                                    t: 'Kurir yang bisa dipercaya',
                                    d: 'Belum ada kepastian identitas dan reputasi pengantar di banyak platform lokal.',
                                },
                            ].map((m) => (
                                <div key={m.t} className="rounded-2xl border border-danger-100 bg-danger-50/50 p-4">
                                    <p className="text-[13px] font-extrabold text-danger-700">{m.t}</p>
                                    <p className="mt-1 text-[12px] leading-relaxed text-navy-500">{m.d}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <SectionHeading judul="Apa yang berubah dengan Preorderly" />
                        <div className="mt-4 space-y-3">
                            {[
                                {
                                    t: 'Satu alur, bukan lima chat',
                                    d: 'Dari pilih menu sampai kurir selesai, semuanya tercatat di satu tempat.',
                                },
                                {
                                    t: 'Slot produksi nyata',
                                    d: 'Setiap menu punya kuota per jam. Kuota otomatis berkurang saat pesanan masuk.',
                                },
                                {
                                    t: 'Status bisa ditelusuri',
                                    d: 'Pembeli melihat progres yang sama dengan yang dilihat dapur dan kurir.',
                                },
                            ].map((m) => (
                                <div key={m.t} className="rounded-2xl border border-success-100 bg-success-50/50 p-4">
                                    <p className="text-[13px] font-extrabold text-success-700">{m.t}</p>
                                    <p className="mt-1 text-[12px] leading-relaxed text-navy-500">{m.d}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Fitur */}
            <section className="bg-slate-50/70 py-14">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <SectionHeading
                        judul="Fitur utama"
                        deskripsi="Enam hal yang jadi tulang punggung platform."
                    />

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {FITUR.map((f) => (
                            <Card key={f.judul} hover elevate className="p-5">
                                <span className="grid size-11 place-items-center rounded-2xl bg-powder-50 text-powder-600">
                                    <f.ikon className="size-5" />
                                </span>
                                <h3 className="mt-3.5 text-[14px] font-extrabold text-navy-900">{f.judul}</h3>
                                <p className="mt-1.5 text-[12px] leading-relaxed text-navy-500">{f.teks}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Alur */}
            <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
                <SectionHeading judul="Alur pemesanan" deskripsi="Empat langkah, selesai sebelum makan malam." />

                <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {ALUR.map((a) => (
                        <li key={a.n}>
                            <Card hover className="h-full p-5">
                                <span className="text-3xl font-extrabold text-powder-200">{a.n}</span>
                                <h3 className="mt-2 text-[14px] font-extrabold text-navy-900">{a.judul}</h3>
                                <p className="mt-1.5 text-[12px] leading-relaxed text-navy-500">{a.teks}</p>
                            </Card>
                        </li>
                    ))}
                </ol>
            </section>

                {/* Mitra restoran dan kurir */}
            <section className="bg-navy-900 py-14">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <SectionHeading
                        judul="Restoran & kurir mitra"
                        deskripsi="Diambil langsung dari data platform."
                    />

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {restoran.map((r) => (
                            <Card key={r.id} className="p-4">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={r.logo ?? r.banner}
                                        alt={r.nama}
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                        className="size-12 rounded-2xl object-cover"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[13px] font-extrabold text-navy-900">
                                            {r.nama}
                                        </p>
                                        <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-navy-400">
                                            <Star className="size-3 fill-butter-400 text-butter-400" />
                                            {Number(r.rating).toFixed(1)} · {r.kategori}
                                        </p>
                                    </div>
                                </div>
                                <p className="mt-3 inline-flex items-center gap-1 text-[11px] text-navy-400">
                                    <MapPin className="size-3" />
                                    {r.alamat}
                                </p>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        {kurir.map((k) => (
                            <div
                                key={k.id}
                                className="flex items-center gap-2.5 rounded-2xl bg-white/10 px-3.5 py-2.5 backdrop-blur-sm"
                            >
                                <Avatar nama={k.nama} gambar={k.avatar} ukuran="sm" />
                                <div>
                                    <p className="text-[12px] font-bold text-white">{k.nama}</p>
<p className="text-[10px] text-white/60">
                                            {k.kendaraan} · {Number(k.rating).toFixed(1)}
                                        </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6">
                <span className="mx-auto grid size-14 place-items-center rounded-3xl bg-butter-100 text-butter-700">
                    <HeartHandshake className="size-7" />
                </span>
                <h2 className="mt-4 text-2xl font-extrabold text-navy-900">
                    Siap pesan hari ini, atau ikut mengubahnya?
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-[14px] leading-relaxed text-navy-500">
                    Pilih peranmu: pembeli untuk pesan, penjual untuk kelola dapur, kurir untuk mengantar, atau
                    admin untuk menjaga kualitas layanan.
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Button as={Link} href="/auth/login" ukuran="lg">Masuk</Button>
                    <Button as={Link} href="/auth/register" ukuran="lg" varian="garis">
                            <Users className="size-4" />
                            Daftar sebagai pembeli
                        </Button>
                    <Button as={Link} href="/auth/daftar-penjual" ukuran="lg" varian="garis">
                            <ChefHat className="size-4" />
                            Daftar sebagai penjual
                        </Button>
                    <Button as={Link} href="/auth/daftar-kurir" ukuran="lg" varian="garis">
                            <Truck className="size-4" />
                            Daftar sebagai kurir
                        </Button>
                </div>

                <p className="mt-6 text-[11px] text-navy-300">
                    {statistik.pengguna ?? 55} pengguna · {statistik.restoran ?? 16} restoran
                    {statistik.pesanan ?? 63} pesanan tercatat
                </p>
            </section>
        </AppLayout>
    );
}
