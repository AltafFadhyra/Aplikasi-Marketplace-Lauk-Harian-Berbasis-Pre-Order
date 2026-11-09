import { Head } from '@inertiajs/react';
import {
    Bell,
    Coins,
    Database,
    Globe2,
    Lock,
    RotateCcw,
    Save,
    Settings as SettingsIkon,
    ShieldCheck,
    Sliders,
} from 'lucide-react';
import { useState } from 'react';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Kosong } from '../../Components/ui/Feedback';
import { Checkbox, Input, Select, Textarea } from '../../Components/ui/Form';
import { PageHeader, SectionHeading } from '../../Components/ui/Misc';
import DashboardLayout from '../../Layouts/DashboardLayout';
import {
    BIAYA_LAYANAN,
    MAKS_HARI_PREORDER,
    MIN_BELANJA_GRATIS_ONGKIR,
    ONGKIR_DASAR,
    ONGKIR_PER_KM,
    ROLES,
} from '../../lib/constants';
import { rupiah } from '../../lib/format';
import { useDemo } from '../../stores/DemoContext';

const TABS = [
    { k: 'umum', l: 'Umum', ikon: Sliders },
    { k: 'pesanan', l: 'Pesanan', ikon: Coins },
    { k: 'notifikasi', l: 'Notifikasi', ikon: Bell },
    { k: 'keamanan', l: 'Keamanan', ikon: ShieldCheck },
];

const KUNCI_PENGATURAN = 'preorderly.pengaturan.v1';

const FORM_AWAL = {
    nama_aplikasi: 'Preorderly',
    nama_pendek: 'PO',
    email_support: 'halo@preorderly.id',
    telepon_support: '0812-0000-0000',
    alamat: 'Bandung, Jawa Barat',
    zona_waktu: 'Asia/Jakarta',
    bahasa: 'id',
    maks_hari_preorder: String(MAKS_HARI_PREORDER),
    min_belanja: String(MIN_BELANJA_GRATIS_ONGKIR),
    biaya_layanan: String(BIAYA_LAYANAN),
    ongkir_dasar: String(ONGKIR_DASAR),
    ongkir_per_km: String(ONGKIR_PER_KM),
    notif_email: true,
    notif_whatsapp: true,
    notif_push: true,
    notif_promosi: false,
    dua_faktor: false,
    batas_men_up: true,
    retensi_dokumen: '5 tahun',
    catatan: '',
};

function bacaPengaturan() {
    try {
        const tersimpan = JSON.parse(window.localStorage.getItem(KUNCI_PENGATURAN) ?? 'null');

        return tersimpan ? { ...FORM_AWAL, ...tersimpan } : FORM_AWAL;
    } catch {
        return FORM_AWAL;
    }
}

export default function Settings() {
    const { busy, tambahToast, bersihkanDemo } = useDemo();

    const [tab, setTab] = useState('umum');
    const [form, setForm] = useState(bacaPengaturan);

    const [galat, setGalat] = useState({});

    function ubah(field) {
        return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
    }

    function centang(field) {
        return () => setForm((f) => ({ ...f, [field]: !f[field] }));
    }

    function simpan(e) {
        e.preventDefault();

        const lokal = {};

        if (!form.nama_aplikasi.trim()) lokal.nama_aplikasi = 'Nama aplikasi wajib diisi.';
        if (!/^\S+@\S+\.\S+$/.test(form.email_support)) lokal.email_support = 'Email tidak valid.';
        if (Number(form.ongkir_per_km) < 0) lokal.ongkir_per_km = 'Tarif tidak boleh negatif.';

        setGalat(lokal);

        if (Object.keys(lokal).length) {
            tambahToast('Periksa kembali field yang ditandai.', 'bahaya');
            return;
        }

        try {
            window.localStorage.setItem(KUNCI_PENGATURAN, JSON.stringify(form));
        } catch {
            /* storage penuh, abaikan */
        }

        tambahToast('Pengaturan platform disimpan.', 'sukses');
    }

    return (
        <DashboardLayout judul="Pengaturan" peran={ROLES.ADMIN}>
            <Head title="Pengaturan Platform" />

            <div className="mb-5">
                <PageHeader
                    judul="Pengaturan platform"
                    deskripsi="Atur parameter global yang berlaku untuk seluruh role."
                    ikon={SettingsIkon}
                />
            </div>

            <div className="grid gap-4 lg:grid-cols-4">
                <Card elevate className="p-3 lg:self-start">
                    <ul className="space-y-1">
                        {TABS.map((t) => (
                            <li key={t.k}>
                                <button
                                    type="button"
                                    onClick={() => setTab(t.k)}
                                    className={[
                                        'flex w-full items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-left text-[12px] font-bold transition',
                                        tab === t.k
                                            ? 'bg-powder-500 text-white shadow-[0_8px_18px_-10px_rgba(109,156,210,0.9)]'
                                            : 'text-navy-500 hover:bg-powder-50/60 hover:text-navy-800',
                                    ].join(' ')}
                                >
                                    <t.ikon className="size-4" />
                                    {t.l}
                                </button>
                            </li>
                        ))}
                    </ul>
                </Card>

                <form onSubmit={simpan} className="space-y-4 lg:col-span-3">
                    {tab === 'umum' ? (
                        <Card elevate className="p-5">
                            <SectionHeading
                                judul="Identitas platform"
                                deskripsi="Nama dan kontak yang tampil di seluruh halaman."
                            />

                            <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
                                <Input
                                    label="Nama aplikasi"
                                    wajib
                                    ikon={Globe2}
                                    value={form.nama_aplikasi}
                                    onChange={ubah('nama_aplikasi')}
                                    galat={galat.nama_aplikasi}
                                />
                                <Input
                                    label="Nama singkat"
                                    petunjuk="Dipakai pada favicon dan mobile title."
                                    value={form.nama_pendek}
                                    onChange={ubah('nama_pendek')}
                                />
                                <Input
                                    label="Email dukungan"
                                    wajib
                                    ikon={Globe2}
                                    value={form.email_support}
                                    onChange={ubah('email_support')}
                                    galat={galat.email_support}
                                />
                                <Input
                                    label="Telepon dukungan"
                                    value={form.telepon_support}
                                    onChange={ubah('telepon_support')}
                                />
                                <Input
                                    label="Alamat kantor"
                                    value={form.alamat}
                                    onChange={ubah('alamat')}
                                />
                                <Select
                                    label="Zona waktu"
                                    value={form.zona_waktu}
                                    onChange={ubah('zona_waktu')}
                                >
                                    <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                                    <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                                    <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                                </Select>
                            </div>
                        </Card>
                    ) : null}

                    {tab === 'pesanan' ? (
                        <Card elevate className="p-5">
                            <SectionHeading
                                judul="Parameter pesanan"
                                deskripsi="Batas waktu, minimum belanja, dan perhitungan ongkir."
                            />

                            <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
                                <Input
                                    label="Maks hari pre-order"
                                    wajib
                                    petunjuk="Nilai bawaan platform adalah 3 hari ke depan."
                                    value={form.maks_hari_preorder}
                                    onChange={ubah('maks_hari_preorder')}
                                />
                                <Input
                                    label="Minimum belanja gratis ongkir"
                                    petunjuk={rupiah(Number(form.min_belanja))}
                                    value={form.min_belanja}
                                    onChange={ubah('min_belanja')}
                                />
                                <Input
                                    label="Biaya layanan"
                                    petunjuk={`Dikenakan sekali per pesanan: ${rupiah(
                                        Number(form.biaya_layanan),
                                    )}`}
                                    value={form.biaya_layanan}
                                    onChange={ubah('biaya_layanan')}
                                />
                                <Input
                                    label="Ongkir dasar"
                                    value={form.ongkir_dasar}
                                    onChange={ubah('ongkir_dasar')}
                                />
                                <Input
                                    label="Ongkir per km"
                                    value={form.ongkir_per_km}
                                    onChange={ubah('ongkir_per_km')}
                                    galat={galat.ongkir_per_km}
                                />
                            </div>

                            <div className="mt-4 rounded-2xl bg-powder-50 p-4">
                                <p className="text-[11px] font-bold text-navy-700">
                                    Simulasi perhitungan
                                </p>
                                <p className="mt-1 text-[12px] text-navy-600">
                                    Pesanan Rp80.000 sejauh 5 km =
                                    {rupiah(
                                        80000 +
                                            (80000 >= Number(form.min_belanja)
                                                ? 0
                                                : Number(form.ongkir_dasar) +
                                                  Number(form.ongkir_per_km) * 5) +
                                            Number(form.biaya_layanan),
                                    )}
                                </p>
                            </div>
                        </Card>
                    ) : null}

                    {tab === 'notifikasi' ? (
                        <Card elevate className="p-5">
                            <SectionHeading
                                judul="Saluran notifikasi"
                                deskripsi="Pilih kanal yang dipakai untuk pemberitahuan otomatis."
                            />

                            <ul className="mt-4 space-y-2.5">
                                {[
                                    { k: 'notif_email', l: 'Email', d: 'Ringkasan pesanan harian.' },
                                    {
                                        k: 'notif_whatsapp',
                                        l: 'WhatsApp',
                                        d: 'Update status pengiriman ke pembeli.',
                                    },
                                    { k: 'notif_push', l: 'Push notifikasi', d: 'Pengingat slot dan promo.' },
                                    {
                                        k: 'notif_promosi',
                                        l: 'Promosi &\u0026kabar baru',
                                        d: 'Kirim mingguan ke pengguna subscribed.',
                                    },
                                ].map((c) => (
                                    <li
                                        key={c.k}
                                        className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3.5 py-2.5"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-[12px] font-bold text-navy-800">
                                                {c.l}
                                            </p>
                                            <p className="text-[10px] text-navy-400">{c.d}</p>
                                        </div>
                                        <Checkbox checked={form[c.k]} onChange={centang(c.k)} />
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    ) : null}

                    {tab === 'keamanan' ? (
                        <>
                            <Card elevate className="p-5">
                                <SectionHeading
                                    judul="Keamanan akun"
                                    deskripsi="Kontrol akses untuk akun admin dan partner."
                                />

                                <ul className="mt-4 space-y-2.5">
                                    <li className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3.5 py-2.5">
                                        <div className="min-w-0">
                                            <p className="text-[12px] font-bold text-navy-800">
                                                Autentikasi dua faktor
                                            </p>
                                            <p className="text-[10px] text-navy-400">
                                                Wajib untuk seluruh akun admin.
                                            </p>
                                        </div>
                                        <Checkbox checked={form.dua_faktor} onChange={centang('dua_faktor')} />
                                    </li>
                                    <li className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3.5 py-2.5">
                                        <div className="min-w-0">
                                            <p className="text-[12px] font-bold text-navy-800">
                                                Batas unggah dokumen per menit
                                            </p>
                                            <p className="text-[10px] text-navy-400">
                                                Mencegah abuse pada halaman verifikasi.
                                            </p>
                                        </div>
                                        <Badge tone="netral">Aktif</Badge>
                                    </li>
                                </ul>

                                <Input
                                    containerClassName="mt-4"
                                    label="Retensi dokumen verifikasi"
                                    petunjuk="Dokumen KTP dan sertifikat dihapus otomatis setelah masa ini."
                                    value={form.retensi_dokumen}
                                    onChange={ubah('retensi_dokumen')}
                                />
                            </Card>

                            <Card className="p-5">
                                <SectionHeading judul="Catatan operasional" />
                                <Textarea
                                    baris={3}
                                    petunjuk="Tersimpan sebagai pengingat internal tim admin."
                                    value={form.catatan}
                                    onChange={ubah('catatan')}
                                    placeholder="Contoh: wajib cek NIK manual untuk pendaftar dari luar Bandung."
                                />
                            </Card>
                        </>
                    ) : null}

                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <Button
                            varian="garis"
                            ikon={RotateCcw}
                            onClick={() => {
                                bersihkanDemo();
                                tambahToast('State demo dikembalikan ke awal.', 'sukses');
                            }}
                        >
                            Reset data demo
                        </Button>
                        <Button type="submit" ikon={Save} disabled={busy}>
                            Simpan pengaturan
                        </Button>
                    </div>
                </form>
            </div>

            <Card className="mt-4 flex items-start gap-3 p-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-navy-500">
                    <Database className="size-4" />
                </span>
                <div className="min-w-0">
                    <p className="text-[12px] font-extrabold text-navy-900">Tersimpan lokal</p>
                    <p className="mt-0.5 text-[11px] text-navy-400">
                        Pengaturan disimpan di perangkat ini dan langsung berlaku untuk tampilan
                        aplikasi.
                    </p>
                </div>
                <Badge tone="sukses" ikon={Lock}>
                    Perangkat ini
                </Badge>
            </Card>
        </DashboardLayout>
    );
}
