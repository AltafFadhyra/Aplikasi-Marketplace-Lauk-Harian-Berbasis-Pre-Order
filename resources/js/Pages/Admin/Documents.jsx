import { Head } from '@inertiajs/react';
import { Archive, Eye, FileText, Filter, Lock, Search, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Kosong } from '../../Components/ui/Feedback';
import { Input } from '../../Components/ui/Form';
import { Modal } from '../../Components/ui/Modal';
import { FilterChip, PageHeader } from '../../Components/ui/Misc';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { ROLES } from '../../lib/constants';
import { waktuLengkap, waktuRelatif } from '../../lib/format';
import { useDemo } from '../../stores/DemoContext';

const TAB = [
    { k: 'semua', l: 'Semua' },
    { k: 'pending', l: 'Diajukan' },
    { k: 'verified', l: 'Terverifikasi' },
    { k: 'rejected', l: 'Ditolak' },
];

const TONE_DOKUMEN = {
    pending: 'peringatan',
    verified: 'sukses',
    rejected: 'bahaya',
};

const LABEL_DOKUMEN = {
    pending: 'Menunggu verifikasi',
    verified: 'Terverifikasi',
    rejected: 'Ditolak',
};

function BarisInfo({ label, nilai }) {
    if (nilai === null || nilai === undefined || nilai === '') return null;

    return (
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2 last:border-b-0">
            <dt className="text-[11px] text-navy-400">{label}</dt>
            <dd className="text-right text-[12px] font-bold text-navy-800">{nilai}</dd>
        </div>
    );
}

export default function Documents() {
    const { seed, busy, tambahToast, pengajuan: pengajuanAktif } = useDemo();

    const [tab, setTab] = useState('semua');
    const [cari, setCari] = useState('');
    const [dipilih, setDipilih] = useState(null);

    const semua = useMemo(
        () =>
            (pengajuanAktif ?? [])
                .filter((p) => p.dokumen)
                .map((p) => ({
                    ...p.dokumen,
                    pengajuan_id: p.id,
                    status: p.dokumen.status ?? p.status,
                    pemilik: p.pengguna?.nama,
                    email: p.pengguna?.email,
                    peran: p.peran,
                })),
        [seed],
    );

    const daftar = useMemo(() => {
        const q = cari.trim().toLowerCase();

        return semua
            .filter((d) => tab === 'semua' || d.status === tab)
            .filter(
                (d) =>
                    !q ||
                    d.pemilik?.toLowerCase().includes(q) ||
                    d.nama_lengkap?.toLowerCase().includes(q) ||
                    String(d.nomor_sertifikat ?? '').includes(q),
            );
    }, [semua, tab, cari]);

    const jumlah = (k) =>
        k === 'semua' ? semua.length : semua.filter((d) => d.status === k).length;

    const terarsip = semua.filter((d) => d.terarsip).length;

    return (
        <DashboardLayout judul="Dokumen" peran={ROLES.ADMIN}>
            <Head title="Dokumen Verifikasi" />

            <div className="mb-5">
                <PageHeader
                    judul="Dokumen verifikasi"
                    deskripsi="Kelola arsip KTP dan sertifikat dengan akses terbatas."
                    ikon={FileText}
                />
            </div>

            <ul className="mb-4 grid gap-3 sm:grid-cols-3">
                <li>
                    <Card elevate className="flex items-center gap-3 p-4">
                        <span className="grid size-11 place-items-center rounded-2xl bg-powder-50 text-powder-600">
                            <FileText className="size-5" />
                        </span>
                        <div>
                            <p className="text-[11px] text-navy-400">Total dokumen</p>
                            <p className="text-lg font-extrabold text-navy-900">{semua.length}</p>
                        </div>
                    </Card>
                </li>
                <li>
                    <Card elevate className="flex items-center gap-3 p-4">
                        <span className="grid size-11 place-items-center rounded-2xl bg-success-50 text-success-600">
                            <ShieldCheck className="size-5" />
                        </span>
                        <div>
                            <p className="text-[11px] text-navy-400">Terverifikasi</p>
                            <p className="text-lg font-extrabold text-navy-900">
                                {semua.filter((d) => d.status === 'verified').length}
                            </p>
                        </div>
                    </Card>
                </li>
                <li>
                    <Card elevate className="flex items-center gap-3 p-4">
                        <span className="grid size-11 place-items-center rounded-2xl bg-butter-50 text-butter-600">
                            <Archive className="size-5" />
                        </span>
                        <div>
                            <p className="text-[11px] text-navy-400">Sudah diarsipkan</p>
                            <p className="text-lg font-extrabold text-navy-900">{terarsip}</p>
                        </div>
                    </Card>
                </li>
            </ul>

            <Card elevate className="mb-4 flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                <ul className="flex flex-wrap gap-1.5">
                    {TAB.map((t) => (
                        <li key={t.k}>
                            <FilterChip
                                aktif={tab === t.k}
                                onClick={() => setTab(t.k)}
                                jumlah={jumlah(t.k)}
                            >
                                {t.l}
                            </FilterChip>
                        </li>
                    ))}
                </ul>

                <div className="lg:w-72">
                    <Input
                        placeholder="Cari nama atau nomor sertifikat..."
                        ikon={Search}
                        value={cari}
                        onChange={(e) => setCari(e.target.value)}
                        containerClassName="mb-0"
                    />
                </div>
            </Card>

            {!daftar.length ? (
                <Kosong
                    ikon={Filter}
                    judul="Dokumen tidak ditemukan"
                    deskripsi="Tidak ada dokumen pada filter ini."
                    className="rounded-3xl border border-slate-200 bg-white py-10"
                />
            ) : (
                <Card elevate className="overflow-hidden">
                    <ul className="divide-y divide-slate-100">
                        {daftar.map((d) => (
                            <li
                                key={d.pengajuan_id}
                                className="flex flex-col gap-3 px-4 py-3.5 transition hover:bg-powder-50/40 lg:flex-row lg:items-center"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[12px] font-extrabold text-navy-900">
                                        {d.pemilik ?? d.nama_lengkap}
                                    </p>
                                    <p className="truncate text-[10px] text-navy-400">
                                        NIK {d.nik ?? '-'} · {d.email ?? '-'}
                                    </p>
                                </div>

                                <div className="min-w-0 lg:w-44">
                                    <p className="truncate text-[11px] text-navy-600">
                                        {d.jenis_sertifikat ?? '-'}
                                    </p>
                                    <p className="truncate text-[10px] text-navy-400">
                                        {d.nomor_sertifikat ?? '-'}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5">
                                    <Badge tone={TONE_DOKUMEN[d.status] ?? 'netral'}>
                                        {LABEL_DOKUMEN[d.status] ?? d.status}
                                    </Badge>
                                    <Badge tone={d.terarsip ? 'netral' : 'peringatan'}>
                                        <Lock className="size-3" />
                                        {d.terarsip ? 'Diarsipkan' : 'Aktif'}
                                    </Badge>
                                </div>

                                <div className="text-[10px] text-navy-400 lg:w-40 lg:text-right">
                                    {d.disimpan_sampai ? (
                                        <>sampai {d.disimpan_sampai}</>
                                    ) : (
                                        <>diunggah {waktuRelatif(d.dibuat_pada)}</>
                                    )}
                                </div>

                                <div className="shrink-0">
                                    <Button
                                        varian="garis"
                                        ukuran="sm"
                                        ikon={Eye}
                                        disabled={busy}
                                        onClick={() => {
                                            setDipilih(d);
                                            tambahToast(`Menampilkan dokumen ${d.pemilik ?? d.nama_lengkap}.`, 'info');
                                        }}
                                    >
                                        Buka
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>
            )}

            <Card className="mt-4 flex items-start gap-3 p-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-powder-50 text-powder-600">
                    <Lock className="size-4" />
                </span>
                <p className="text-[11px] text-navy-400">
                    Setiap pembukaan dokumen dicatat lengkap dengan nama admin, alasan, dan alamat
                    IP sesuai kebijakan privasi Preorderly. Riwayat terakhir dibuka{' '}
                    {waktuLengkap(semua[0]?.dibuat_pada)} untuk data demo.
                </p>
            </Card>

            <Modal
                buka={Boolean(dipilih)}
                tutup={() => setDipilih(null)}
                judul="Detail dokumen"
                deskripsi={dipilih ? `Dokumen milik ${dipilih.pemilik ?? dipilih.nama_lengkap ?? '-'}.` : ''}
                ikon={FileText}
                footer={
                    <Button varian="garis" onClick={() => setDipilih(null)}>
                        Tutup
                    </Button>
                }
            >
                {dipilih ? (
                    <dl>
                        <BarisInfo label="Pemilik" nilai={dipilih.pemilik} />
                        <BarisInfo label="Email" nilai={dipilih.email} />
                        <BarisInfo label="NIK" nilai={dipilih.nik} />
                        <BarisInfo label="Nama lengkap" nilai={dipilih.nama_lengkap} />
                        <BarisInfo
                            label="Tempat, tanggal lahir"
                            nilai={
                                [dipilih.tempat_lahir, dipilih.tanggal_lahir].filter(Boolean).join(', ') ||
                                undefined
                            }
                        />
                        <BarisInfo label="Jenis sertifikat" nilai={dipilih.jenis_sertifikat} />
                        <BarisInfo label="Nomor sertifikat" nilai={dipilih.nomor_sertifikat} />
                        <BarisInfo label="Status" nilai={LABEL_DOKUMEN[dipilih.status] ?? dipilih.status} />
                        <BarisInfo label="Alasan tolak" nilai={dipilih.alasan_tolak} />
                        <BarisInfo
                            label="Jumlah akses"
                            nilai={typeof dipilih.jumlah_akses === 'number' ? `${dipilih.jumlah_akses} kali` : undefined}
                        />
                        <BarisInfo label="Disimpan sampai" nilai={dipilih.disimpan_sampai} />
                    </dl>
                ) : null}
            </Modal>
        </DashboardLayout>
    );
}
