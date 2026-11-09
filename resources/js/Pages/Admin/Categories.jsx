import { Head } from '@inertiajs/react';
import { FolderTree, Layers, Plus, Store, Tags, Trash2, UtensilsCrossed } from 'lucide-react';
import { useState } from 'react';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Kosong } from '../../Components/ui/Feedback';
import { Input } from '../../Components/ui/Form';
import { Modal } from '../../Components/ui/Modal';
import { PageHeader, SectionHeading } from '../../Components/ui/Misc';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { ROLES } from '../../lib/constants';
import { useDemo } from '../../stores/DemoContext';

export default function Categories() {
    const { seed, busy, tambahToast, tambahKategori, hapusKategori } = useDemo();

    const [dialog, setDialog] = useState(null);
    const [nama, setNama] = useState('');

    const semua = seed.kategori ?? [];

    const totalMenu = (seed.restoran ?? []).reduce((jumlah, r) => jumlah + (r.menu?.length ?? 0), 0);

    const terpasang = new Map();
    (seed.restoran ?? []).forEach((r) => {
        if (r.kategori) terpasang.set(r.kategori, (terpasang.get(r.kategori) ?? 0) + 1);
    });
    (seed.restoran ?? []).forEach((r) => {
        (r.menu ?? []).forEach((m) => {
            if (m.kategori) terpasang.set(m.kategori, (terpasang.get(m.kategori) ?? 0) + 1);
        });
    });

    function tutup() {
        setDialog(null);
        setNama('');
    }

    function simpan() {
        const rapi = nama.trim();

        if (!rapi) {
            tambahToast('Nama kategori wajib diisi.', 'bahaya');
            return;
        }

        if ((seed.kategori ?? []).some((k) => k.nama.toLowerCase() === rapi.toLowerCase())) {
            tambahToast(`Kategori "${rapi}" sudah terdaftar.`, 'peringatan');
            return;
        }

        tambahKategori(rapi);
        tambahToast(`Kategori "${rapi}" ditambahkan.`, 'sukses');
        tutup();
    }

    function hapus(k) {
        if ((terpasang.get(k.nama) ?? 0) > 0) {
            tambahToast(`Kategori "${k.nama}" tidak bisa dihapus karena sedang dipakai.`, 'peringatan');
            return;
        }

        if (!window.confirm(`Hapus kategori "${k.nama}"?`)) return;

        hapusKategori(k.id);
        tambahToast(`Kategori "${k.nama}" dihapus.`, 'sukses');
    }

    return (
        <DashboardLayout judul="Kategori" peran={ROLES.ADMIN}>
            <Head title="Kategori" />

            <div className="mb-5">
                <PageHeader
                    judul="Kategori restoran"
                    deskripsi="Kelompokkan jenis usaha agar pembeli lebih mudah menemukan menu."
                    ikon={Tags}
                    aksi={
                        <Button ikon={Plus} onClick={() => setDialog('tambah')}>
                            Tambah kategori
                        </Button>
                    }
                />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card elevate className="p-5 lg:col-span-2">
                    <SectionHeading
                        judul="Daftar kategori"
                        deskripsi={`${semua.length} kategori terdaftar`}
                    />

                    {!semua.length ? (
                        <Kosong
                            ikon={Layers}
                            judul="Belum ada kategori"
                            deskripsi="Tambahkan kategori pertama untuk mengelompokkan restoran."
                        />
                    ) : (
                        <ul className="mt-3 divide-y divide-slate-100">
                            {semua.map((k) => (
                                <li
                                    key={k.id ?? k.nama}
                                    className="flex items-center gap-3 py-3"
                                >
                                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-powder-50 text-powder-600">
                                        <FolderTree className="size-4" />
                                    </span>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[12px] font-extrabold text-navy-900">
                                            {k.nama}
                                        </p>
                                        {k.deskripsi ? (
                                            <p className="truncate text-[10px] text-navy-400">
                                                {k.deskripsi}
                                            </p>
                                        ) : null}
                                    </div>

                                    <Badge tone="netral">
                                        {terpasang.get(k.nama) ?? 0} dipakai
                                    </Badge>

                                    <Button
                                        varian="ghost"
                                        ukuran="sm"
                                        disabled={busy}
                                        ikon={Trash2}
                                        onClick={() => hapus(k)}
                                        aria-label={`Hapus ${k.nama}`}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                <div className="space-y-4">
                    <Card elevate className="p-5">
                        <SectionHeading judul="Statistik kategori" />

                        <ul className="mt-3 space-y-2.5">
                            <li className="flex items-center justify-between rounded-2xl bg-slate-50 px-3.5 py-2.5">
                                <span className="inline-flex items-center gap-1.5 text-[12px] text-navy-600">
                                    <Layers className="size-3.5" /> Total kategori
                                </span>
                                <span className="text-[12px] font-extrabold text-navy-900">
                                    {semua.length}
                                </span>
                            </li>
                            <li className="flex items-center justify-between rounded-2xl bg-slate-50 px-3.5 py-2.5">
                                <span className="inline-flex items-center gap-1.5 text-[12px] text-navy-600">
                                    <Store className="size-3.5" /> Restoran terpakai
                                </span>
                                <span className="text-[12px] font-extrabold text-navy-900">
                                    {terpasang.size}
                                </span>
                            </li>
                            <li className="flex items-center justify-between rounded-2xl bg-slate-50 px-3.5 py-2.5">
                                <span className="inline-flex items-center gap-1.5 text-[12px] text-navy-600">
                                    <UtensilsCrossed className="size-3.5" /> Menu terpakai
                                </span>
                                <span className="text-[12px] font-extrabold text-navy-900">
                                    {totalMenu}
                                </span>
                            </li>
                        </ul>
                    </Card>

                    <Card className="p-5">
                        <SectionHeading judul="Aturan kategori" />
                        <ul className="mt-3 space-y-2 text-[11px] text-navy-500">
                            <li className="flex gap-2">
                                <span className="text-powder-500">1.</span>
                                Satu restoran hanya boleh memakai satu kategori utama.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-powder-500">2.</span>
                                Kategori yang sudah dipakai tidak bisa dihapus.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-powder-500">3.</span>
                                Perubahan kategori tidak memengaruhi menu aktif.
                            </li>
                        </ul>
                    </Card>
                </div>
            </div>

            <Modal
                buka={Boolean(dialog)}
                tutup={tutup}
                judul="Tambah kategori"
                deskripsi="Kategori baru langsung tersedia untuk dipilih restoran."
                ikon={Tags}
                footer={
                    <>
                        <Button varian="garis" onClick={tutup}>
                            Batal
                        </Button>
                        <Button disabled={busy} onClick={simpan}>
                            Simpan
                        </Button>
                    </>
                }
            >
                <Input
                    label="Nama kategori"
                    wajib
                    petunjuk="Contoh: Nasi Goreng, Jajan Pass, Healthy Food."
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: Bakso dan Mie"
                />
            </Modal>
        </DashboardLayout>
    );
}
