import { Head } from '@inertiajs/react';
import { Clock3, MapPin, Phone, Save, Store, Upload, User } from 'lucide-react';
import { useState } from 'react';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Checkbox, Input, Select, Textarea } from '../../Components/ui/Form';
import { Rating } from '../../Components/ui/Avatar';
import { ImageUploader } from '../../Components/ui/ImageUploader';
import { InfoRow, PageHeader, SectionHeading } from '../../Components/ui/Misc';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { JENIS_USAHA, ROLES } from '../../lib/constants';
import { useDemo } from '../../stores/DemoContext';

export default function StoreProfile() {
    const { seed, akun, tambahToast, simpanProfil, simpanRestoran } = useDemo();

    const toko = akun?.penjual ?? {};
    const restoran = (seed.restoran ?? []).find((r) => String(r.id) === String(toko.restoran_id));

    const [form, setForm] = useState({
        nama_toko: toko.toko ?? restoran?.nama ?? '',
        jenis_usaha: JENIS_USAHA[0],
        telepon: toko.telepon ?? '',
        alamat: restoran?.alamat ?? '',
        deskripsi: restoran?.deskripsi ?? '',
        min_order: restoran?.min_order ?? 20000,
        gratis_ongkir: restoran?.gratis_ongkir ?? false,
        jam_buka: '08:00',
        jam_tutup: '21:00',
    });
    const [galat, setGalat] = useState({});
    const [banner, setBanner] = useState(null);
    const [logo, setLogo] = useState(null);

    const ubah = (f) => (e) => setForm((s) => ({ ...s, [f]: e.target.value }));

    function simpan(e) {
        e.preventDefault();
        const g = {};

        if (form.nama_toko.trim().length < 3) g.nama_toko = 'Nama toko minimal 3 karakter.';
        if (!form.alamat.trim()) g.alamat = 'Alamat operasional wajib diisi.';
        if (Number(form.min_order) < 0) g.min_order = 'Minimum order tidak boleh negatif.';

        setGalat(g);
        if (Object.keys(g).length) return;

        simpanRestoran(toko.restoran_id, {
            nama: form.nama_toko.trim(),
            alamat: form.alamat.trim(),
            deskripsi: form.deskripsi,
            min_order: Number(form.min_order),
        });
        simpanProfil({
            toko: form.nama_toko.trim(),
            telepon: form.telepon,
        });
        tambahToast('Profil toko berhasil disimpan.', 'sukses');
    }

    return (
        <DashboardLayout judul="Profil Toko" peran={ROLES.PENJUAL}>
            <Head title="Profil Toko" />

            <div className="mb-5">
                <PageHeader
                    judul="Profil toko"
                    deskripsi="Informasi yang dilihat pembeli saat menjelajahi restoranmu."
                    ikon={Store}
                    aksi={
                        <Badge tone={restoran?.buka ? 'sukses' : 'bahaya'} titik>
                            {restoran?.buka ? 'Sedang buka' : 'Tutup'}
                        </Badge>
                    }
                />
            </div>

            <form onSubmit={simpan}>
                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        <Card elevate className="p-5">
                            <SectionHeading judul="Identitas usaha" ikon={Store} />

                            <div className="mt-4 space-y-4">
                                <Input
                                    label="Nama toko"
                                    ikon={Store}
                                    value={form.nama_toko}
                                    onChange={ubah('nama_toko')}
                                    galat={galat.nama_toko}
                                    wajib
                                />

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Select
                                        label="Jenis usaha"
                                        value={form.jenis_usaha}
                                        onChange={ubah('jenis_usaha')}
                                    >
                                        {JENIS_USAHA.map((j) => (
                                            <option key={j} value={j}>
                                                {j}
                                            </option>
                                        ))}
                                    </Select>

                                    <Input
                                        label="Nomor telepon"
                                        ikon={Phone}
                                        value={form.telepon}
                                        onChange={ubah('telepon')}
                                    />
                                </div>

                                <Input
                                    label="Alamat operasional"
                                    ikon={MapPin}
                                    value={form.alamat}
                                    onChange={ubah('alamat')}
                                    galat={galat.alamat}
                                    petunjuk="Dipakai untuk menghitung ongkir dan jarak pembeli."
                                    wajib
                                />

                                <Textarea
                                    label="Deskripsi restoran"
                                    value={form.deskripsi}
                                    onChange={ubah('deskripsi')}
                                    baris={4}
                                    petunjuk="Ceritakan specialties, bahan utama, dan keistimewaan tokomu."
                                />
                            </div>
                        </Card>

                        <Card elevate className="p-5">
                            <SectionHeading judul="Atur pesanan" ikon={Clock3} />

                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                <Input
                                    label="Minimum order (Rp)"
                                    type="number"
                                    min={0}
                                    step={1000}
                                    value={form.min_order}
                                    onChange={ubah('min_order')}
                                    galat={galat.min_order}
                                />

                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        label="Buka"
                                        type="time"
                                        value={form.jam_buka}
                                        onChange={ubah('jam_buka')}
                                    />
                                    <Input
                                        label="Tutup"
                                        type="time"
                                        value={form.jam_tutup}
                                        onChange={ubah('jam_tutup')}
                                    />
                                </div>
                            </div>

                            <div className="mt-4 border-t border-slate-100 pt-4">
                                <Checkbox
                                    label="Gratis ongkir"
                                    deskripsi="Bebas ongkir tetap mengikuti aturan radius dan minimum belanja."
                                    checked={form.gratis_ongkir}
                                    onChange={(v) => setForm((s) => ({ ...s, gratis_ongkir: v }))}
                                />
                            </div>
                        </Card>

                        <Card elevate className="p-5">
                            <SectionHeading judul="Foto toko" ikon={Upload} />

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <ImageUploader
                                    label="Banner restoran"
                                    keterangan="Rasio lebar, minimal 1200x400."
                                    berkas={banner}
                                    onUbah={setBanner}
                                />
                                <ImageUploader
                                    label="Logo restoran"
                                    keterangan="Rasio 1:1,Recommend 512x512."
                                    berkas={logo}
                                    onUbah={setLogo}
                                />
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <Card elevate className="p-5">
                            <SectionHeading judul="Ringkasan toko" />

                            {restoran ? (
                                <>
                                    <div className="mt-3 overflow-hidden rounded-2xl">
                                        <img
                                            src={restoran.banner}
                                            alt={restoran.nama}
                                            onError={(e) => {
                                                e.currentTarget.style.visibility = 'hidden';
                                            }}
                                            className="h-24 w-full object-cover"
                                        />
                                    </div>

                                    <dl className="mt-3 space-y-2">
                                        <InfoRow label="Kategori" nilai={restoran.kategori} />
                                        <InfoRow
                                            label="Rating"
                                            nilai={`${Number(restoran.rating).toFixed(1)} (${
                                                restoran.jumlah_rating
                                            })`}
                                        />
                                        <InfoRow label="Terjual" nilai={`${restoran.terjual} porsi`} />
                                        <InfoRow
                                            label="Jumlah menu"
                                            nilai={`${restoran.jumlah_menu} menu`}
                                        />
                                        <InfoRow
                                            label="Slot tersedia"
                                            nilai={`${restoran.slot_tersedia} slot`}
                                        />
                                    </dl>

                                    <div className="mt-3">
                                        <Rating
                                            nilai={Number(restoran.rating)}
                                            jumlah={restoran.jumlah_rating}
                                        />
                                    </div>
                                </>
                            ) : (
                                <p className="mt-3 text-[12px] text-navy-400">
                                    Data restoran belum tersedia.
                                </p>
                            )}
                        </Card>

                        <Card className="p-5">
                            <SectionHeading judul="Status verifikasi" ikon={User} />

                            <div className="mt-3 space-y-2">
                                <Badge tone={toko.status === 'approved' ? 'sukses' : 'peringatan'}>
                                    {toko.status === 'approved' ? 'Terverifikasi admin' : 'Menunggu verifikasi'}
                                </Badge>
                                <p className="text-[11px] leading-relaxed text-navy-500">
                                    Dokumen usaha (NIB, NPWP, foto KTP) disimpan terenkripsi dan hanya dapat
                                    dilihat admin berwenang.
                                </p>
                            </div>
                        </Card>

                        <Card className="p-5">
                            <Button type="submit" className="w-full" ikon={Save}>
                                Simpan perubahan
                            </Button>
                        </Card>
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
}
