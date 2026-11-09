import { Head, Link } from '@inertiajs/react';
import { Bike, ClipboardCheck, Clock, FileText, Inbox, Search, Store } from 'lucide-react';
import { useMemo, useState } from 'react';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Kosong } from '../../Components/ui/Feedback';
import { Input, Textarea } from '../../Components/ui/Form';
import { Modal } from '../../Components/ui/Modal';
import { FilterChip, PageHeader } from '../../Components/ui/Misc';
import { Avatar } from '../../Components/ui/Avatar';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { ROLES } from '../../lib/constants';
import { waktuRelatif } from '../../lib/format';
import { useDemo } from '../../stores/DemoContext';

const IKON_PERAN = { penjual: Store, kurir: Bike, pembeli: ClipboardCheck };

const TAB = [
    { k: 'pending', l: 'Menunggu' },
    { k: 'approved', l: 'Disetujui' },
    { k: 'rejected', l: 'Ditolak' },
    { k: 'semua', l: 'Semua' },
];

const LABEL_STATUS = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
};

const TONE_STATUS = {
    pending: 'peringatan',
    approved: 'sukses',
    rejected: 'bahaya',
};

export default function Verifications() {
    const { seed, pengajuan, daftarPengajuan, busy } = useDemo();

    const [tab, setTab] = useState('pending');
    const [cari, setCari] = useState('');
    const [dialog, setDialog] = useState(null);
    const [catatan, setCatatan] = useState('');

    const semua = pengajuan ?? [];

    const daftar = useMemo(() => {
        const q = cari.trim().toLowerCase();

        return semua
            .filter((p) => tab === 'semua' || p.status === tab)
            .filter(
                (p) =>
                    !q ||
                    p.pengguna?.nama?.toLowerCase().includes(q) ||
                    p.pengguna?.email?.toLowerCase().includes(q) ||
                    String(p.id) === q,
            );
    }, [semua, tab, cari]);

    const jumlah = (k) =>
        k === 'semua' ? semua.length : semua.filter((p) => p.status === k).length;

    // Pengajuan hasil registrasi di aplikasi ini tidak tersimpan di database,
    // jadi tidak bisa dibuka lewat halaman detail — proses langsung dari daftar.
    const idLokal = (p) => !/^\d+$/.test(String(p.id));

    function tutupDialog() {
        setDialog(null);
        setCatatan('');
    }

    async function konfirmasi() {
        if (!dialog) return;

        const status = dialog.aksi === 'setujui' ? 'approved' : 'rejected';

        if (status === 'rejected' && catatan.trim().length < 10) {
            return;
        }

        await daftarPengajuan({
            id: dialog.p.id,
            status,
            alasan: status === 'rejected' ? catatan.trim() : null,
            catatan: status === 'approved' ? catatan.trim() || null : null,
        });
        tutupDialog();
    }

    return (
        <DashboardLayout judul="Verifikasi" peran={ROLES.ADMIN}>
            <Head title="Verifikasi Pendaftaran" />

            <div className="mb-5">
                <PageHeader
                    judul="Verifikasi pendaftaran"
                    deskripsi="Tinjau dokumen KTP dan sertifikat sebelum menyetujui akun penjual atau kurir."
                    ikon={ClipboardCheck}
                />
            </div>

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
                        placeholder="Cari nama atau email..."
                        ikon={Search}
                        value={cari}
                        onChange={(e) => setCari(e.target.value)}
                        containerClassName="mb-0"
                    />
                </div>
            </Card>

            {!daftar.length ? (
                <Kosong
                    ikon={Inbox}
                    judul="Tidak ada pengajuan"
                    deskripsi="Belum ada pengajuan pada filter ini."
                    className="rounded-3xl border border-slate-200 bg-white py-10"
                />
            ) : (
                <ul className="space-y-3">
                    {daftar.map((p) => {
                        const Ikon = IKON_PERAN[p.peran] ?? ClipboardCheck;

                        return (
                            <li key={p.id}>
                                <Card hover elevate className="p-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                        <div className="flex min-w-0 flex-1 items-center gap-3">
                                            <Avatar
                                                nama={p.pengguna?.nama}
                                                gambar={p.pengguna?.avatar}
                                                ukuran="md"
                                            />
                                            <div className="min-w-0">
                                                <p className="truncate text-[13px] font-extrabold text-navy-900">
                                                    {p.pengguna?.nama ?? '-'}
                                                </p>
                                                <p className="truncate text-[11px] text-navy-400">
                                                    {p.pengguna?.email ?? '-'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <Badge tone="netral" ikon={Ikon}>
                                                {p.peran === 'penjual' ? 'Penjual' : 'Kurir'}
                                            </Badge>
                                            <Badge tone={TONE_STATUS[p.status] ?? 'netral'}>
                                                {LABEL_STATUS[p.status] ?? p.status}
                                            </Badge>
                                            <Badge tone="peringatan">
                                                <Clock className="size-3" />
                                                {waktuRelatif(p.dibuat_pada)}
                                            </Badge>
                                        </div>

                                        <div className="flex shrink-0 gap-2">
                                            {idLokal(p) ? (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setDialog({ p, aksi: 'setujui' });
                                                        setCatatan('');
                                                    }}
                                                    className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 px-3.5 py-2 text-[12px] font-bold text-navy-600 transition hover:bg-slate-50"
                                                >
                                                    <FileText className="size-3.5" />
                                                    Review
                                                </button>
                                            ) : (
                                                <Link
                                                    href={`/admin/verifikasi/${p.id}`}
                                                    className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 px-3.5 py-2 text-[12px] font-bold text-navy-600 transition hover:bg-slate-50"
                                                >
                                                    <FileText className="size-3.5" />
                                                    Review
                                                </Link>
                                            )}
                                            {p.status === 'pending' ? (
                                                idLokal(p) ? (
                                                    <Button
                                                        ukuran="sm"
                                                        disabled={busy}
                                                        onClick={() => {
                                                            setDialog({ p, aksi: 'setujui' });
                                                            setCatatan('');
                                                        }}
                                                    >
                                                        Proses
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        as={Link}
                                                        href={`/admin/verifikasi/${p.id}`}
                                                        ukuran="sm"
                                                    >
                                                        Proses
                                                    </Button>
                                                )
                                            ) : null}
                                        </div>
                                    </div>
                                </Card>
                            </li>
                        );
                    })}
                </ul>
            )}

            <p className="mt-5 text-center text-[11px] text-navy-300">
                Menampilkan {daftar.length} dari {semua.length} pengajuan.
            </p>

            <Modal
                buka={Boolean(dialog)}
                tutup={tutupDialog}
                judul={dialog?.aksi === 'tolak' ? 'Tolak pengajuan?' : 'Setujui pengajuan?'}
                deskripsi={
                    dialog?.aksi === 'tolak'
                        ? 'Berikan alasan penolakan agar pendaftar paham.'
                        : `Pengajuan ${dialog?.p?.pengguna?.nama ?? ''} akan disetujui.`
                }
                ikon={ClipboardCheck}
                footer={
                    <>
                        <Button varian="garis" onClick={tutupDialog}>
                            Batal
                        </Button>
                        <Button
                            disabled={busy}
                            varian={dialog?.aksi === 'tolak' ? 'bahaya' : 'utama'}
                            onClick={konfirmasi}
                        >
                            {dialog?.aksi === 'tolak' ? 'Ya, tolak' : 'Ya, setujui'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-3">
                    {dialog?.aksi === 'setujui' ? (
                        <div className="flex gap-2">
                            <Button
                                varian={dialog.aksi === 'setujui' ? 'utama' : 'garis'}
                                ukuran="sm"
                                onClick={() => setDialog((d) => ({ ...d, aksi: 'setujui' }))}
                            >
                                Setujui
                            </Button>
                            <Button
                                varian="garis"
                                ukuran="sm"
                                onClick={() => setDialog((d) => ({ ...d, aksi: 'tolak' }))}
                            >
                                Tolak
                            </Button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <Button
                                varian="garis"
                                ukuran="sm"
                                onClick={() => setDialog((d) => ({ ...d, aksi: 'setujui' }))}
                            >
                                Setujui
                            </Button>
                            <Button
                                varian={dialog?.aksi === 'tolak' ? 'bahaya' : 'garis'}
                                ukuran="sm"
                                onClick={() => setDialog((d) => ({ ...d, aksi: 'tolak' }))}
                            >
                                Tolak
                            </Button>
                        </div>
                    )}
                    <Textarea
                        label={dialog?.aksi === 'tolak' ? 'Alasan penolakan' : 'Catatan admin (opsional)'}
                        baris={3}
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        placeholder={
                            dialog?.aksi === 'tolak'
                                ? 'Jelaskan alasan penolakan (min. 10 karakter).'
                                : 'Catatan tambahan untuk arsip.'
                        }
                    />
                </div>
            </Modal>
        </DashboardLayout>
    );
}
