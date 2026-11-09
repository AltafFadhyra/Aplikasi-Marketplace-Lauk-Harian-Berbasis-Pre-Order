import { Head } from '@inertiajs/react';
import { Ban, Bike, CheckCircle2, Download, Mail, Search, ShieldCheck, Store, User, Users as UsersIkon } from 'lucide-react';
import { useMemo, useState } from 'react';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Kosong } from '../../Components/ui/Feedback';
import { Input } from '../../Components/ui/Form';
import { FilterChip, PageHeader } from '../../Components/ui/Misc';
import { Avatar } from '../../Components/ui/Avatar';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { LABEL_ROLE, ROLES } from '../../lib/constants';
import { tanggalPanjang, waktuRelatif } from '../../lib/format';
import { useDemo } from '../../stores/DemoContext';

const IKON_PERAN = { pembeli: User, penjual: Store, kurir: Bike, admin: ShieldCheck };

const TAB = [
    { k: 'semua', l: 'Semua' },
    { k: 'pembeli', l: 'Pembeli' },
    { k: 'penjual', l: 'Penjual' },
    { k: 'kurir', l: 'Kurir' },
    { k: 'admin', l: 'Admin' },
];

const KUNCI_NONAKTIF = 'preorderly.pengguna-nonaktif.v1';

function bacaNonaktif() {
    try {
        return new Set(
            JSON.parse(window.localStorage.getItem(KUNCI_NONAKTIF) ?? '[]').map(String),
        );
    } catch {
        return new Set();
    }
}

export default function Users({ daftarPengguna = [] }) {
    const { tambahToast, busy } = useDemo();

    const [tab, setTab] = useState('semua');
    const [cari, setCari] = useState('');
    const [nonaktif, setNonaktif] = useState(bacaNonaktif);

    function toggleAktif(u) {
        const kunci = String(u.id);
        const sekarang = nonaktif.has(kunci);

        setNonaktif((prev) => {
            const s = new Set(prev);

            if (sekarang) s.delete(kunci);
            else s.add(kunci);

            try {
                window.localStorage.setItem(KUNCI_NONAKTIF, JSON.stringify([...s]));
            } catch {
                /* storage penuh, abaikan */
            }

            return s;
        });

        tambahToast(
            sekarang ? `${u.nama} diaktifkan kembali.` : `${u.nama} dinonaktifkan.`,
            'sukses',
        );
    }

    const daftar = useMemo(() => {
        const q = cari.trim().toLowerCase();

        return daftarPengguna
            .filter((u) => tab === 'semua' || u.peran === tab)
            .filter(
                (u) =>
                    !q ||
                    u.nama?.toLowerCase().includes(q) ||
                    u.email?.toLowerCase().includes(q) ||
                    String(u.id) === q,
            );
    }, [daftarPengguna, tab, cari]);

    const jumlah = (k) =>
        k === 'semua' ? daftarPengguna.length : daftarPengguna.filter((u) => u.peran === k).length;

    function eksporCsv() {
        if (!daftar.length) {
            tambahToast('Tidak ada data pengguna untuk diekspor.', 'peringatan');
            return;
        }

        const selubung = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`;
        const baris = [
            ['id', 'nama', 'email', 'telepon', 'peran', 'terdaftar'].join(','),
            ...daftar.map((u) =>
                [
                    selubung(u.id),
                    selubung(u.nama),
                    selubung(u.email),
                    selubung(u.telepon),
                    selubung(LABEL_ROLE[u.peran] ?? u.peran),
                    selubung(u.terdaftar),
                ].join(','),
            ),
        ];

        try {
            const blob = new Blob([`\uFEFF${baris.join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');

            a.href = url;
            a.download = 'pengguna-preorderly.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);

            tambahToast(`${daftar.length} pengguna diekspor ke CSV.`, 'sukses');
        } catch {
            tambahToast('Browser tidak mengizinkan pengunduhan file.', 'bahaya');
        }
    }

    return (
        <DashboardLayout judul="Pengguna" peran={ROLES.ADMIN}>
            <Head title="Manajemen Pengguna" />

            <div className="mb-5">
                <PageHeader
                    judul="Manajemen pengguna"
                    deskripsi="Kelola seluruh akun yang terdaftar di platform."
                    ikon={UsersIkon}
                    aksi={
                        <Button varian="garis" ukuran="sm" ikon={Download} onClick={eksporCsv}>
                            Ekspor CSV
                        </Button>
                    }
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
                    ikon={UsersIkon}
                    judul="Pengguna tidak ditemukan"
                    deskripsi="Tidak ada akun yang cocok dengan filter."
                    className="rounded-3xl border border-slate-200 bg-white py-10"
                />
            ) : (
                <Card elevate className="overflow-hidden">
                    <div className="hidden grid-cols-12 gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-2.5 text-[10px] font-bold tracking-wide text-navy-400 uppercase lg:grid">
                        <span className="col-span-4">Pengguna</span>
                        <span className="col-span-2">Peran</span>
                        <span className="col-span-3">Kontak</span>
                        <span className="col-span-2">Terdaftar</span>
                        <span className="col-span-1 text-right">Aksi</span>
                    </div>

                    <ul className="divide-y divide-slate-100">
                        {daftar.map((u) => {
                            const Ikon = IKON_PERAN[u.peran] ?? User;

                            return (
                                <li
                                    key={u.id}
                                    className="grid gap-2 px-4 py-3 transition hover:bg-powder-50/40 lg:grid-cols-12 lg:items-center lg:gap-3"
                                >
                                    <div className="flex min-w-0 items-center gap-3 lg:col-span-4">
                                        <Avatar
                                            nama={u.nama}
                                            gambar={u.avatar}
                                            ukuran="sm"
                                        />
                                        <div className="min-w-0">
                                            <p className="truncate text-[12px] font-extrabold text-navy-900">
                                                {u.nama}
                                                {nonaktif.has(String(u.id)) ? (
                                                    <Badge tone="bahaya" ukuran="xs" className="ml-1.5">
                                                        Nonaktif
                                                    </Badge>
                                                ) : null}
                                            </p>
                                            <p className="truncate text-[10px] text-navy-400">
                                                ID #{u.id}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-2">
                                        <Badge tone="netral" ikon={Ikon}>
                                            {LABEL_ROLE[u.peran] ?? u.peran}
                                        </Badge>
                                    </div>

                                    <div className="min-w-0 lg:col-span-3">
                                        <p className="truncate text-[11px] text-navy-600">
                                            <Mail className="mr-1 inline size-3 text-navy-300" />
                                            {u.email ?? '-'}
                                        </p>
                                        <p className="truncate text-[10px] text-navy-400">
                                            {u.telepon ?? '-'}
                                        </p>
                                    </div>

                                    <div className="text-[10px] text-navy-400 lg:col-span-2">
                                        <span className="lg:hidden">terdaftar </span>
                                        {tanggalPanjang(u.terdaftar)}
                                    </div>

                                    <div className="flex justify-end lg:col-span-1">
                                        <Button
                                            varian="garis"
                                            ukuran="sm"
                                            disabled={busy}
                                            ikon={nonaktif.has(String(u.id)) ? CheckCircle2 : Ban}
                                            onClick={() => toggleAktif(u)}
                                        >
                                            <span className="lg:sr-only">
                                                {nonaktif.has(String(u.id)) ? 'Aktifkan' : 'Nonaktifkan'}
                                            </span>
                                        </Button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </Card>
            )}

            <p className="mt-5 text-center text-[11px] text-navy-300">
                Menampilkan {daftar.length} dari {daftarPengguna.length} pengguna terdaftar.
            </p>
        </DashboardLayout>
    );
}
