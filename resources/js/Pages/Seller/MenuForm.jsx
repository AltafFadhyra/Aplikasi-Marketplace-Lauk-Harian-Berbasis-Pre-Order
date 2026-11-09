import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, ChefHat, Clock3, Save, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Checkbox, Input, Select, Textarea } from '../../Components/ui/Form';
import { ImageUploader } from '../../Components/ui/ImageUploader';
import { SectionHeading } from '../../Components/ui/Misc';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { ROLES } from '../../lib/constants';
import { rupiah } from '../../lib/format';
import { useDemo } from '../../stores/DemoContext';

const KATEGORI = ['Nasi', 'Mie', 'Ayam', 'Ikan', 'Sayur', 'Minuman', 'Camilan', 'Dessert'];

export default function MenuForm() {
    const { menuId } = usePage().props;
    const { seed, akun, tambahToast, simpanMenu, hapusMenu } = useDemo();

    const toko = akun?.penjual ?? {};
    const restoran = (seed.restoran ?? []).find((r) => String(r.id) === String(toko.restoran_id));
    const menu = (restoran?.menu ?? []).find((m) => String(m.id) === String(menuId));

    const [form, setForm] = useState({
        nama: menu?.nama ?? '',
        kategori: menu?.kategori ?? KATEGORI[0],
        harga: menu?.harga ?? 25000,
        deskripsi: menu?.deskripsi ?? '',
        lead_time: menu?.lead_time_menit ?? 30,
        maks_harian: menu?.maks_harian ?? 20,
        catatan_masak: menu?.catatan_masak ?? '',
        hanya_preorder: menu?.hanya_preorder ?? false,
        aktif: menu?.aktif !== false,
    });
    const [galat, setGalat] = useState({});
    const [foto, setFoto] = useState(null);

    const ubah = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

    function fotoDataUrl() {
        if (!foto) return Promise.resolve(null);
        if (typeof foto === 'string') return Promise.resolve(foto);

        return new Promise((selesai) => {
            const pembaca = new FileReader();

            pembaca.onload = () => selesai(pembaca.result);
            pembaca.onerror = () => selesai(null);
            pembaca.readAsDataURL(foto);
        });
    }

    async function simpan(e) {
        e.preventDefault();
        const g = {};

        if (form.nama.trim().length < 3) g.nama = 'Nama menu minimal 3 karakter.';
        if (Number(form.harga) < 1000) g.harga = 'Harga minimal Rp1.000.';
        if (Number(form.lead_time) < 1) g.lead_time = 'Waktu persiapan minimal 1 menit.';
        if (Number(form.maks_harian) < 1) g.maks_harian = 'Minimal 1 porsi per hari.';
        if (form.deskripsi.trim().length < 10) g.deskripsi = 'Deskripsi minimal 10 karakter.';

        setGalat(g);
        if (Object.keys(g).length) return;

        if (!restoran) {
            tambahToast('Restoran akun ini tidak ditemukan.', 'bahaya');
            return;
        }

        const gambarBaru = await fotoDataUrl();

        simpanMenu(restoran.id, {
            id: menu?.id,
            nama: form.nama.trim(),
            kategori: form.kategori,
            harga: Number(form.harga),
            deskripsi: form.deskripsi.trim(),
            lead_time_menit: Number(form.lead_time),
            maks_harian: Number(form.maks_harian),
            catatan_masak: form.catatan_masak,
            hanya_preorder: Boolean(form.hanya_preorder),
            aktif: Boolean(form.aktif),
            lead_time_label: `${Number(form.lead_time)} menit`,
            jumlah_rating: menu?.jumlah_rating ?? 0,
            ...(gambarBaru ? { gambar: gambarBaru } : {}),
        });

        tambahToast(
            menu ? `Perubahan ${form.nama} disimpan.` : `Menu ${form.nama} ditambahkan.`,
            'sukses',
        );
        router.visit('/seller/menu');
    }

    return (
        <DashboardLayout judul={menu ? 'Ubah Menu' : 'Tambah Menu'} peran={ROLES.PENJUAL}>
            <Head title={menu ? `Ubah ${menu.nama}` : 'Tambah Menu'} />

            <Link
                href="/seller/menu"
                className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-bold text-navy-400 hover:text-powder-600"
            >
                <ArrowLeft className="size-3.5" />
                Kembali ke daftar menu
            </Link>

            <div className="mb-5">
                <h1 className="text-xl font-extrabold text-navy-900 sm:text-2xl">
                    {menu ? `Ubah ${menu.nama}` : 'Tambah menu baru'}
                </h1>
                <p className="mt-0.5 text-[13px] text-navy-500">
                    Lengkapi informasi menu agar pembeli bisa memahaminya dengan jelas.
                </p>
            </div>

            <form onSubmit={simpan}>
                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        <Card elevate className="p-5">
                            <SectionHeading judul="Informasi dasar" ikon={ChefHat} />

                            <div className="mt-4 space-y-4">
                                <Input
                                    label="Nama menu"
                                    value={form.nama}
                                    onChange={ubah('nama')}
                                    galat={galat.nama}
                                    wajib
                                />

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Select
                                        label="Kategori"
                                        value={form.kategori}
                                        onChange={ubah('kategori')}
                                    >
                                        {KATEGORI.map((k) => (
                                            <option key={k} value={k}>
                                                {k}
                                            </option>
                                        ))}
                                    </Select>

                                    <Input
                                        label="Harga (Rp)"
                                        type="number"
                                        min={1000}
                                        step={500}
                                        value={form.harga}
                                        onChange={ubah('harga')}
                                        galat={galat.harga}
                                        petunjuk={`Ditampilkan ${rupiah(Number(form.harga) || 0)}`}
                                        wajib
                                    />
                                </div>

                                <Textarea
                                    label="Deskripsi"
                                    value={form.deskripsi}
                                    onChange={ubah('deskripsi')}
                                    galat={galat.deskripsi}
                                    baris={4}
                                    petunjuk="Jelaskan bahan utama, rasa, dan ukuran porsi."
                                    wajib
                                />
                            </div>
                        </Card>

                        <Card elevate className="p-5">
                            <SectionHeading judul="Atur produksi" ikon={Clock3} />

                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                <Input
                                    label="Waktu persiapan (menit)"
                                    type="number"
                                    min={1}
                                    value={form.lead_time}
                                    onChange={ubah('lead_time')}
                                    galat={galat.lead_time}
                                    petunjuk="Dipakai menghitung estimasi tiba."
                                />
                                <Input
                                    label="Maksimum porsi per hari"
                                    type="number"
                                    min={1}
                                    value={form.maks_harian}
                                    onChange={ubah('maks_harian')}
                                    galat={galat.maks_harian}
                                />
                            </div>

                            <div className="mt-4">
                                <Textarea
                                    label="Catatan dapur"
                                    value={form.catatan_masak}
                                    onChange={ubah('catatan_masak')}
                                    baris={2}
                                    petunjuk="Contoh: menggunakan sambal buatan sendiri, ayam di potong 8 bagian."
                                />
                            </div>

                            <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-4">
                                <Checkbox
                                    label="Hanya tersedia sebagai pre-order"
                                    deskripsi="Menu tidak ditampilkan untuk pesanan instan di hari yang sama."
                                    checked={form.hanya_preorder}
                                    onChange={(v) => setForm((f) => ({ ...f, hanya_preorder: v }))}
                                />
                                <Checkbox
                                    label="Tampilkan di halaman restoran"
                                    deskripsi="Matikan untuk menyembunyikan menu sementara."
                                    checked={form.aktif}
                                    onChange={(v) => setForm((f) => ({ ...f, aktif: v }))}
                                />
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <Card elevate className="p-5">
                            <SectionHeading judul="Foto menu" ikon={Upload} />

                            <div className="mt-4">
                                <ImageUploader
                                    label="Foto utama"
                                    keterangan="Rasio 4:3, JPG/PNG maksimal 2 MB."
                                    berkas={foto}
                                    onUbah={setFoto}
                                />
                            </div>

                            {menu?.gambar && !foto ? (
                                <img
                                    src={menu.gambar}
                                    alt={menu.nama}
                                    className="mt-3 h-32 w-full rounded-2xl object-cover"
                                />
                            ) : null}
                        </Card>

                        {menu ? (
                            <Card className="p-5">
                                <SectionHeading judul="Statistik menu" />

                                <dl className="mt-3 space-y-2 text-[12px]">
                                    <div className="flex justify-between">
                                        <dt className="text-navy-400">Terjual</dt>
                                        <dd className="font-bold text-navy-800">{menu.terjual} porsi</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-navy-400">Rating</dt>
                                        <dd className="font-bold text-navy-800">
                                            {Number(menu.rating ?? 0).toFixed(1)} ({menu.jumlah_rating})
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-navy-400">Status</dt>
                                        <dd>
                                            <Badge tone={form.aktif ? 'sukses' : 'netral'} ukuran="xs">
                                                {form.aktif ? 'Aktif' : 'Nonaktif'}
                                            </Badge>
                                        </dd>
                                    </div>
                                </dl>
                            </Card>
                        ) : null}

                        <Card className="p-5">
                            <div className="space-y-2">
                                <Button type="submit" className="w-full" ikon={Save}>
                                    {menu ? 'Simpan perubahan' : 'Tambah menu'}
                                </Button>
                                <Button
                                    type="button"
                                    varian="garis"
                                    className="w-full"
                                    ikon={Trash2}
                                    onClick={() => {
                                        if (!menu) {
                                            setForm({
                                                nama: '',
                                                kategori: KATEGORI[0],
                                                harga: 25000,
                                                deskripsi: '',
                                                lead_time: 30,
                                                maks_harian: 20,
                                                catatan_masak: '',
                                                hanya_preorder: false,
                                                aktif: true,
                                            });
                                            setFoto(null);
                                            tambahToast('Formulir dikosongkan.', 'info');
                                            return;
                                        }

                                        if (!window.confirm(`Hapus menu ${menu.nama}?`)) return;

                                        hapusMenu(restoran.id, menu.id);
                                        tambahToast(`${menu.nama} dihapus dari daftar menu.`, 'sukses');
                                        router.visit('/seller/menu');
                                    }}
                                >
                                    {menu ? 'Hapus menu' : 'Kosongkan formulir'}
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
}
