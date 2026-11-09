import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, CalendarClock, Clock3, Flame, Minus, Plus, ShieldCheck, Star, Utensils } from 'lucide-react';
import { useMemo, useState } from 'react';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Kosong } from '../../Components/ui/Feedback';
import { Rating } from '../../Components/ui/Avatar';
import { PriceTag, SectionHeading } from '../../Components/ui/Misc';
import AppLayout from '../../Layouts/AppLayout';
import { rupiah, waktuRelatif } from '../../lib/format';
import { useDemo } from '../../stores/DemoContext';

export default function MenuDetail() {
    const { menuId } = usePage().props;
    const { seed, keranjang, tambahKeranjang, tambahToast } = useDemo();

    const [qty, setQty] = useState(1);
    const [catatan, setCatatan] = useState('');

    const menu = useMemo(() => {
        for (const r of seed.restoran ?? []) {
            const m = (r.menu ?? []).find((x) => String(x.id) === String(menuId));
            if (m) return { ...m, restoran: r };
        }
        return null;
    }, [seed.restoran, menuId]);

    if (!menu) {
        return (
            <AppLayout>
                <Head title="Menu" />
                <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
                    <Kosong
                        ikon={Utensils}
                        judul="Menu tidak ditemukan"
                        deskripsi="Menu ini mungkin sudah dihapus oleh restoran."
                        aksi={
                            <Button as={Link} href="/cari">Cari menu lain</Button>
                        }
                        className="rounded-3xl border border-white/70 bg-white/70 py-6"
                    />
                </div>
            </AppLayout>
        );
    }

    const resto = menu.restoran;
    const harga = menu.harga_efektif || menu.harga;
    const diskon = menu.harga_efektif && menu.harga_efektif < menu.harga;
    const maks = menu.maks_harian || 20;
    const total = harga * qty;
    const sudahDiKeranjang = keranjang.find(
        (b) => String(b.menu_id) === String(menu.id) && String(b.restoran_id) === String(resto.id),
    );

    const slot = (seed.slot ?? []).filter(
        (s) => String(s.restoran_id) === String(resto.id) && s.sisa > 0,
    );
    const ulasanMenu = (seed.ulasan ?? []).filter((u) => String(u.menu_id) === String(menu.id) && u.isi);
    const perluSlot = menu.hanya_preorder || !resto.buka;

    function tambah() {
        tambahKeranjang(menu, { qty, catatan: catatan.trim() });
        tambahToast(
            `${menu.nama} masuk keranjang${sudahDiKeranjang ? ', kuantitas digabung' : ''}.`,
            'sukses',
        );
    }

    return (
        <AppLayout>
            <Head title={`${menu.nama} - ${resto.nama}`} />

            <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-7">
                <Link
                    href={`/cari/restoran/${resto.slug}`}
                    className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-bold text-navy-400 transition-colors hover:text-powder-600"
                >
                    <ArrowLeft className="size-3.5" />
                    Kembali ke {resto.nama}
                </Link>

                <div className="grid gap-5 lg:grid-cols-5">
                    <div className="space-y-5 lg:col-span-3">
                        <Card elevate className="overflow-hidden">
                            <div className="relative aspect-4/3 bg-slate-100 sm:aspect-16/10">
                                <img
                                    src={menu.gambar}
                                    alt={menu.nama}
                                    onError={(e) => {
                                        e.currentTarget.style.visibility = 'hidden';
                                    }}
                                    className="size-full object-cover"
                                />
                                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                                    {diskon ? (
                                        <Badge tone="bahaya" ukuran="xs">
                                            Diskon
                                        </Badge>
                                    ) : null}
                                    {menu.hanya_preorder ? (
                                        <Badge tone="peringatan" ukuran="xs" ikon={Clock3}>
                                            Hanya pre-order
                                        </Badge>
                                    ) : null}
                                    {menu.terjual >= 100 ? (
                                        <Badge tone="butter" ukuran="xs" ikon={Flame}>
                                            {menu.terjual} terjual
                                        </Badge>
                                    ) : null}
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-bold text-powder-600">
                                            {menu.kategori}
                                        </p>
                                        <h1 className="mt-0.5 text-xl font-extrabold text-navy-900">
                                            {menu.nama}
                                        </h1>
                                    </div>
                                    <Rating
                                        nilai={Number(menu.rating ?? 0)}
                                        jumlah={menu.jumlah_rating}
                                        tampilAngka
                                        ukuran="sm"
                                    />
                                </div>

                                <div className="mt-3">
                                    <PriceTag harga={harga} coret={Boolean(diskon)} ukuran="lg" />
                                </div>

                                <p className="mt-3 text-[13px] leading-relaxed text-navy-600">
                                    {menu.deskripsi}
                                </p>

                                {menu.catatan_masak ? (
                                    <div className="mt-4 rounded-2xl bg-butter-50/70 px-4 py-3">
                                        <p className="text-[11px] font-extrabold text-butter-800">
                                            Catatan dapur
                                        </p>
                                        <p className="mt-0.5 text-[12px] text-navy-600">
                                            {menu.catatan_masak}
                                        </p>
                                    </div>
                                ) : null}

                                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-slate-100 pt-4 text-[12px] text-navy-500">
                                    <span className="inline-flex items-center gap-1.5">
                                        <Utensils className="size-3.5 text-navy-300" />
                                        {menu.terjual} porsi terjual
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <CalendarClock className="size-3.5 text-navy-300" />
                                        {menu.lead_time_label}
                                    </span>
                                    {resto.buka ? (
                                        <span className="inline-flex items-center gap-1.5 font-bold text-success-600">
                                            <ShieldCheck className="size-3.5" />
                                            Sedang buka
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 font-bold text-danger-600">
                                            <Clock3 className="size-3.5" />
                                            Restoran tutup
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {ulasanMenu.length ? (
                            <Card elevate className="p-5">
                                <SectionHeading judul="Apa kata pembeli" />
                                <ul className="mt-3 space-y-3">
                                    {ulasanMenu.map((u) => (
                                        <li key={u.id} className="rounded-2xl bg-slate-50 p-3.5">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-[12px] font-extrabold text-navy-900">
                                                    {u.nama}
                                                </p>
                                                <span className="inline-flex items-center gap-1 text-[10px] text-navy-300">
                                                    <Star className="size-3 fill-butter-400 text-butter-400" />
                                                    {waktuRelatif(u.dibuat_pada)}
                                                </span>
                                            </div>
                                            <p className="mt-1.5 text-[12px] text-navy-600">{u.isi}</p>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        ) : null}
                    </div>

                    <div className="lg:col-span-2">
                        <div className="sticky top-20 space-y-4">
                            <Card elevate className="p-5">
                                <div>
                                    <label
                                        htmlFor="catatan-menu"
                                        className="text-[11px] font-bold text-navy-500"
                                    >
                                        Catatan untuk restoran (opsional)
                                    </label>
                                    <textarea
                                        id="catatan-menu"
                                        rows={2}
                                        value={catatan}
                                        onChange={(e) => setCatatan(e.target.value)}
                                        maxLength={120}
                                        placeholder="Misal: sambal sedikit, tidak pedas"
                                        className="mt-1.5 w-full resize-none rounded-2xl border border-slate-200 px-3.5 py-2.5 text-[13px] text-navy-800 outline-none placeholder:text-navy-300 focus:border-powder-400 focus:ring-2 focus:ring-powder-200"
                                    />
                                </div>

                                <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 px-3.5 py-2.5">
                                    <span className="text-[12px] font-bold text-navy-600">Jumlah</span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setQty((q) => Math.max(1, q - 1))}
                                            disabled={qty <= 1}
                                            aria-label="Kurangi jumlah"
                                            className="grid size-7 place-items-center rounded-lg bg-white text-navy-600 shadow-sm transition disabled:opacity-40 hover:text-powder-600"
                                        >
                                            <Minus className="size-3.5" />
                                        </button>
                                        <span className="w-8 text-center text-[13px] font-extrabold text-navy-900">
                                            {qty}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setQty((q) => Math.min(maks, q + 1))}
                                            disabled={qty >= maks}
                                            aria-label="Tambah jumlah"
                                            className="grid size-7 place-items-center rounded-lg bg-white text-navy-600 shadow-sm transition disabled:opacity-40 hover:text-powder-600"
                                        >
                                            <Plus className="size-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <p className="mt-2 text-[10px] text-navy-400">
                                    Maksimal {maks} porsi per hari untuk menu ini.
                                </p>

                                <Button className="mt-3 w-full" ukuran="lg" onClick={tambah}>
                                    <Plus className="size-4" />
                                    Tambah ke keranjang
                                </Button>

                                <p className="mt-2 text-center text-[11px] text-navy-400">
                                    Total sementara {rupiah(total)}
                                </p>
                            </Card>

                            <Card className="p-4">
                                <p className="text-[11px] font-extrabold text-navy-700">
                                    {perluSlot ? 'Wajib pilih slot produksi' : 'Jadwal produksi tersedia'}
                                </p>
                                {!slot.length ? (
                                    <p className="mt-1.5 text-[11px] font-semibold text-warning-600">
                                        Jadwal 3 hari ke depan sudah penuh.
                                    </p>
                                ) : (
                                    <ul className="mt-2 flex flex-wrap gap-1.5">
                                        {slot.slice(0, 5).map((s) => (
                                            <li key={s.id}>
                                                <Badge tone="netral" ukuran="sm">
                                                    {s.tanggal_label} {s.jam_mulai}
                                                </Badge>
                                            </li>
                                        ))}
                                        {slot.length > 5 ? (
                                            <li>
                                                <Badge tone="powder" ukuran="sm">
                                                    +{slot.length - 5} lainnya
                                                </Badge>
                                            </li>
                                        ) : null}
                                    </ul>
                                )}
                                <p className="mt-2.5 text-[10px] leading-relaxed text-navy-400">
                                    Slot dipilih saat checkout. Kuota berkurang otomatis setelah pesanan
                                    dikonfirmasi.
                                </p>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
