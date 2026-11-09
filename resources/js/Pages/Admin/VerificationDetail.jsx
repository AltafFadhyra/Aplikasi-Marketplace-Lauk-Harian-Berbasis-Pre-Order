import { Head, Link } from '@inertiajs/react';
import {
    Archive,
    Ban,
    Bike,
    Check,
    ChevronLeft,
    Eye,
    FileCheck2,
    FileWarning,
    Mail,
    Phone,
    ShieldCheck,
    Store,
    User,
    X,
} from 'lucide-react';
import { useState } from 'react';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Kosong } from '../../Components/ui/Feedback';
import { Textarea } from '../../Components/ui/Form';
import { Modal } from '../../Components/ui/Modal';
import { Avatar } from '../../Components/ui/Avatar';
import { InfoRow, PageHeader } from '../../Components/ui/Misc';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { ROLES } from '../../lib/constants';
import { waktuLengkap, waktuRelatif } from '../../lib/format';
import { useDemo } from '../../stores/DemoContext';

const TONE_STATUS = {
    pending: 'peringatan',
    approved: 'sukses',
    rejected: 'bahaya',
};

const LABEL_STATUS = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
};

export default function VerificationDetail({ pengajuanId, dokumen, riwayatAkses = [] }) {
    const { seed, busy, tambahToast, pengajuan: pengajuanAktif, daftarPengajuan } = useDemo();

    const [dialog, setDialog] = useState(null);
    const [catatan, setCatatan] = useState('');

    const pengajuan = (pengajuanAktif ?? []).find(
        (p) => String(p.id) === String(pengajuanId),
    );

    if (!pengajuan) {
        return (
            <DashboardLayout judul="Detail Verifikasi" peran={ROLES.ADMIN}>
                <Head title="Detail Verifikasi" />
                <Kosong
                    ikon={FileWarning}
                    judul="Pengajuan tidak ditemukan"
                    deskripsi="Data pengajuan sudah tidak tersedia."
                    aksi={
                        <Button as={Link} href="/admin/verifikasi" varian="garis">Kembali</Button>
                    }
                    className="rounded-3xl border border-slate-200 bg-white py-10"
                />
            </DashboardLayout>
        );
    }

    const p = pengajuan;
    const dok = dokumen ?? p.dokumen;
    const form = p.form ?? {};
    const sudahFinal = p.status !== 'pending';

    function tutup() {
        setDialog(null);
        setCatatan('');
    }

    async function kirim(aksi) {
        if (aksi === 'tolak' && catatan.trim().length < 10) {
            tambahToast('Alasan penolakan minimal 10 karakter.', 'bahaya');
            return;
        }

        const status = aksi === 'setujui' ? 'approved' : 'rejected';

        await daftarPengajuan({
            id: p.id,
            status,
            alasan: status === 'rejected' ? catatan.trim() : null,
            catatan: status === 'approved' ? catatan.trim() || null : null,
        });
        tutup();
    }

    return (
        <DashboardLayout judul="Detail Verifikasi" peran={ROLES.ADMIN}>
            <Head title={`Verifikasi ${p.pengguna?.nama ?? ''}`} />

            <div className="mb-5">
                <PageHeader
                    judul="Tinjau pengajuan"
                    deskripsi="Pastikan data dan dokumen sesuai sebelum memutuskan."
                    ikon={ShieldCheck}
                    breadcrumbs={[{ label: 'Verifikasi', href: '/admin/verifikasi' }, { label: `#${p.id}` }]}
                />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    <Card elevate className="p-5">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge tone={TONE_STATUS[p.status] ?? 'netral'}>
                                {LABEL_STATUS[p.status] ?? p.status}
                            </Badge>
                            <Badge tone="netral" ikon={p.peran === 'kurir' ? Bike : Store}>
                                {p.peran === 'kurir' ? 'Kurir' : 'Penjual'}
                            </Badge>
                            <span className="ml-auto text-[11px] text-navy-400">
                                Diajukan {waktuRelatif(p.dibuat_pada)}
                            </span>
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                            <Avatar nama={p.pengguna?.nama} gambar={p.pengguna?.avatar} ukuran="lg" />
                            <div className="min-w-0">
                                <p className="truncate text-[14px] font-extrabold text-navy-900">
                                    {p.pengguna?.nama ?? '-'}
                                </p>
                                <p className="truncate text-[11px] text-navy-400">
                                    {p.pengguna?.email ?? '-'}
                                </p>
                            </div>
                        </div>

                        <dl className="mt-4 border-t border-slate-100 pt-1">
                            <InfoRow
                                label="Nomor telepon"
                                nilai={p.pengguna?.telepon ?? '-'}
                                ikon={Phone}
                            />
                            <InfoRow label="Email" nilai={p.pengguna?.email ?? '-'} ikon={Mail} />
                        </dl>
                    </Card>

                    <Card elevate className="p-5">
                        <h2 className="text-[13px] font-extrabold text-navy-900">
                            Dokumen identitas
                        </h2>

                        {!dok ? (
                            <p className="mt-3 text-[12px] text-navy-400">
                                Tidak ada dokumen terlampir pada pengajuan ini.
                            </p>
                        ) : (
                            <>
                                <dl className="mt-2 border-t border-slate-100 pt-1">
                                    <InfoRow
                                        label="NIK"
                                        nilai={dok.nik ?? '-'}
                                        ikon={User}
                                    />
                                    <InfoRow
                                        label="Nama sesuai KTP"
                                        nilai={dok.nama_lengkap ?? '-'}
                                    />
                                    <InfoRow
                                        label="Tempat, tanggal lahir"
                                        nilai={`${dok.tempat_lahir ?? '-'}, ${dok.tanggal_lahir ?? '-'}`}
                                    />
                                </dl>

                                <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                                    <Card className="p-3.5">
                                        <p className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wide text-navy-400 uppercase">
                                            <FileCheck2 className="size-3.5" /> Sertifikat
                                        </p>
                                        <p className="mt-1 text-[12px] font-bold text-navy-800">
                                            {dok.jenis_sertifikat ?? '-'}
                                        </p>
                                        <p className="text-[11px] text-navy-400">
                                            {dok.nomor_sertifikat ?? '-'}
                                        </p>
                                    </Card>
                                    <Card className="p-3.5">
                                        <p className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wide text-navy-400 uppercase">
                                            <Archive className="size-3.5" /> Retensi
                                        </p>
                                        <p className="mt-1 text-[12px] font-bold text-navy-800">
                                            {dok.terarsip ? 'Sudah diarsipkan' : 'Aktif tersimpan'}
                                        </p>
                                        <p className="text-[11px] text-navy-400">
                                            {dok.disimpan_sampai
                                                ? `sampai ${dok.disimpan_sampai}`
                                                : 'Tanpa batas'}
                                        </p>
                                    </Card>
                                </div>

                                {dok.alasan_tolak ? (
                                    <p className="mt-3 rounded-2xl bg-danger-50 p-3.5 text-[12px] text-danger-700">
                                        Alasan ditolak: {dok.alasan_tolak}
                                    </p>
                                ) : null}
                            </>
                        )}
                    </Card>

                    <Card elevate className="p-5">
                        <h2 className="text-[13px] font-extrabold text-navy-900">
                            Riwayat akses dokumen
                        </h2>

                        {!riwayatAkses.length ? (
                            <p className="mt-3 text-[12px] text-navy-400">
                                Belum ada admin yang membuka dokumen ini.
                            </p>
                        ) : (
                            <ul className="mt-3 divide-y divide-slate-100">
                                {riwayatAkses.map((a, i) => (
                                    <li key={i} className="flex items-center gap-3 py-2.5">
                                        <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-powder-50 text-powder-600">
                                            <Eye className="size-3.5" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-[12px] font-bold text-navy-800">
                                                {a.nama ?? 'Admin'}
                                            </p>
                                            <p className="truncate text-[10px] text-navy-400">
                                                {a.alasan ?? '-'} · IP {a.ip ?? '-'}
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-[10px] text-navy-300">
                                            {waktuLengkap(a.waktu)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card elevate className="p-5">
                        <h2 className="text-[13px] font-extrabold text-navy-900">Data pengajuan</h2>

                        <dl className="mt-2 border-t border-slate-100 pt-1">
                            {Object.entries(form)
                                .slice(0, 6)
                                .map(([k, v]) => (
                                    <InfoRow
                                        key={k}
                                        label={k.replace(/_/g, ' ')}
                                        nilai={String(v ?? '-').slice(0, 40)}
                                    />
                                ))}
                        </dl>
                    </Card>

                    <Card className="p-5">
                        <h2 className="text-[13px] font-extrabold text-navy-900">Keputusan</h2>

                        {sudahFinal ? (
                            <div className="mt-3 space-y-2.5">
                                <p className="rounded-2xl bg-slate-50 p-3.5 text-[12px] text-navy-600">
                                    Pengajuan sudah{' '}
                                    <span className="font-extrabold">
                                        {LABEL_STATUS[p.status]?.toLowerCase()}
                                    </span>{' '}
                                    oleh {p.diproses_oleh ?? 'admin'}.
                                </p>
                                {p.catatan_admin ?? p.catatan ? (
                                    <p className="rounded-2xl bg-butter-50 p-3.5 text-[12px] text-navy-600">
                                        Catatan: {p.catatan_admin ?? p.catatan}
                                    </p>
                                ) : null}
                                {p.diproses_pada ? (
                                    <p className="text-[10px] text-navy-300">
                                        Diproses {waktuLengkap(p.diproses_pada)}
                                    </p>
                                ) : null}
                            </div>
                        ) : (
                            <div className="mt-3 space-y-2">
                                <Button
                                    className="w-full"
                                    disabled={busy}
                                    ikon={Check}
                                    onClick={() => setDialog('setujui')}
                                >
                                    Setujui pengajuan
                                </Button>
                                <Button
                                    className="w-full"
                                    varian="bahaya"
                                    disabled={busy}
                                    ikon={Ban}
                                    onClick={() => setDialog('tolak')}
                                >
                                    Tolak pengajuan
                                </Button>
                            </div>
                        )}

                        <Link
                            href="/admin/verifikasi"
                            className="mt-2 flex items-center justify-center gap-1.5 rounded-2xl py-2.5 text-[12px] font-bold text-navy-400 transition hover:text-navy-700"
                        >
                            <ChevronLeft className="size-3.5" />
                            Kembali ke daftar
                        </Link>
                    </Card>
                </div>
            </div>

            <Modal
                buka={Boolean(dialog)}
                tutup={tutup}
                judul={dialog === 'tolak' ? 'Tolak pengajuan?' : 'Setujui pengajuan?'}
                deskripsi={
                    dialog === 'tolak'
                        ? `Pengguna ${p.pengguna?.nama} akan mendapat notifikasi penolakan beserta alasannya.`
                        : `Akun ${p.pengguna?.nama} akan diaktifkan dan bisa langsung login.`
                }
                ikon={dialog === 'tolak' ? X : Check}
                footer={
                    <>
                        <Button varian="garis" onClick={tutup}>
                            Batal
                        </Button>
                        <Button
                            varian={dialog === 'tolak' ? 'bahaya' : 'utama'}
                            disabled={busy}
                            onClick={() => kirim(dialog)}
                        >
                            {dialog === 'tolak' ? 'Ya, tolak' : 'Ya, setujui'}
                        </Button>
                    </>
                }
            >
                <Textarea
                    baris={3}
                    label={dialog === 'tolak' ? 'Alasan penolakan' : 'Catatan admin (opsional)'}
                    wajib={dialog === 'tolak'}
                    petunjuk={
                        dialog === 'tolak'
                            ? 'Minimal 10 karakter. Akan dikirim ke pengguna.'
                            : 'Tersimpan pada riwayat verifikasi.'
                    }
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Contoh: foto KTP tidak terbaca, silakan unggah ulang."
                />
            </Modal>
        </DashboardLayout>
    );
}
