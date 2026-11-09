import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { useLocalStorage } from '../hooks';
import { BIAYA_LAYANAN, DASHBOARD_ROLE, METODE_PEMBAYARAN, URUTAN_STATUS, indeksStatus } from '../lib/constants';
import { hitungOngkir, jarakKm } from '../lib/distance';
import {
    bacaPesananBersama,
    hidrasiPesananBersama,
    migrasiPesananLama,
    validasiSnapshotAkun,
} from '../lib/pesananBersama';

const DemoContext = createContext(null);

const tertunda = new Map();

/** Simulasi delay jaringan supaya terasa seperti aplikasi sungguhan. */
export function jeda(ms = 450) {
    return new Promise((selesai) => {
        const t = setTimeout(selesai, ms);

        tertunda.set(t, true);
    });
}

function uid(awalan = 'id') {
    return `${awalan}-${performance.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}-${Date.now() % 1000}`;
}

function nomorPesanan() {
    const angka = Math.floor(Math.random() * 9000) + 1000;

    return `PRD-${new Date().getFullYear()}-${angka}`;
}

/**
 * Encode password untuk disimpan di akun lokal.
 * `btoa` hanya menerima Latin-1, jadi karakter di luar itu diubah ke byte UTF-8.
 */
function sandikanKunci(kunci) {
    const teks = String(kunci ?? '');

    try {
        return btoa(teks);
    } catch {
        const byte = new TextEncoder().encode(teks);
        let hasil = '';

        for (const b of byte) hasil += String.fromCharCode(b);

        return btoa(hasil);
    }
}

/**
 * Cocokkan password dengan nilai `kunci` milik akun.
 * Mendukung format hash `btoa(password)` (akun registrasi) sekaligus format
 * plaintext lama (akun demo dan akun yang sempat tersimpan akibat bug sebelumnya).
 */
function cocokKunci(kunci, tersimpan) {
    const teks = String(kunci ?? '');
    const nilai = String(tersimpan ?? '');

    if (!nilai) return false;
    if (nilai === teks) return true;

    return nilai === sandikanKunci(teks);
}

/**
 * `propsAwal` diteruskan dari `setup()` di app.jsx.
 *
 * Provider ini dirender DI LUAR <App> Inertia (App hanya menerima page component,
 * tidak bisa dibungkus children), jadi `usePage()` tidak boleh dipakai di sini -
 * hook itu melempar "usePage must be used within the Inertia component" dan membuat
 * seluruh aplikasi gagal render. `demo` berasal dari HandleInertiaRequests::share()
 * sehingga nilainya sama di semua halaman dan tidak berubah saat navigasi.
 */
export function DemoProvider({ children, propsAwal }) {
    // Sesi login disimpan di localStorage — hanya ada setelah user benar-benar
    // login lewat halaman /auth/login (atau baru mendaftar).
    const [sesi, setSesi] = useLocalStorage('preorderly.sesi.v1', null);
    const [akunLokal, setAkunLokal] = useLocalStorage('preorderly.pengguna.v1', []);
    const [pengajuanBaru, setPengajuanBaru] = useLocalStorage('preorderly.pengajuan.v1', []);
    // Overlay data yang bisa diedit user (menu & profil restoran, kategori admin).
    // Kunci global agar perubahan terlihat lintas peran di browser yang sama.
    const [menuLokal, setMenuLokal] = useLocalStorage('preorderly.menu.v1', {});
    const [restoranLokal, setRestoranLokal] = useLocalStorage('preorderly.restoran.v1', {});
    const [kategoriLokal, setKategoriLokal] = useLocalStorage('preorderly.kategori.v1', []);
    const peran = sesi?.peran ?? null;
    const [dataBersama, setDataBersama] = useState({
        status: 'memuat',
        store: null,
        hasilMigrasi: null,
    });
    const migrasiBersama = useRef(false);

    const seedMentah = useMemo(() => propsAwal?.demo ?? {}, [propsAwal?.demo]);

    // Data server digabung dengan pesanan bersama sebelum filter peran diterapkan.
    // Dengan begitu pesanan milik pembeli tetap bisa terlihat oleh peran lain.
    const seed = useMemo(() => {
        const mentah = seedMentah;
        const { pesanan, pengiriman } = hidrasiPesananBersama({
            seedPesanan: mentah.pesanan ?? [],
            seedPengiriman: mentah.pengiriman ?? [],
            pesananBersama: dataBersama.store?.pesanan ?? [],
            pengirimanBersama: dataBersama.store?.pengiriman ?? [],
            sesi,
        });

        if (!sesi) {
            return { ...mentah, pesanan, pengiriman };
        }

        return {
            ...mentah,
            akun: { [sesi.peran]: sesi },
            pengajuan:
                sesi.peran === 'admin' ? [...pengajuanBaru, ...(mentah.pengajuan ?? [])] : [],
            notifikasi: (mentah.notifikasi ?? []).filter(
                (n) => String(n.pengguna_id) === String(sesi.id),
            ),
            kategori: [...(mentah.kategori ?? []), ...kategoriLokal],
            restoran: (mentah.restoran ?? []).map((r) => {
                const patch = restoranLokal[r.id];

                return {
                    ...r,
                    ...(patch ?? {}),
                    menu: menuLokal[r.id] ?? r.menu,
                };
            }),
            pesanan,
            pengiriman,
        };
    }, [seedMentah, sesi, pengajuanBaru, menuLokal, restoranLokal, kategoriLokal, dataBersama.store]);

    // Data lokal (keranjang, status pesanan, notifikasi) disimpan per akun,
    // sehingga keluar/masuk dengan akun lain tidak saling bocorkan.
    const kunciSimpan = `preorderly.demo.v1.${sesi?.id ?? 'tamu'}`;
    const sudahHidrasi = useRef(null);
    const snapshotTidakBolehDisimpan = useRef(new Set());
    const migrasiBerhasil =
        dataBersama.hasilMigrasi?.ok === true &&
        ['selesai', 'sudah_selesai', 'dipulihkan'].includes(dataBersama.hasilMigrasi?.status);

    const [toast, setToast] = useState([]);
    const [busy, setBusy] = useState(false);
    const [hidrasiSiap, setHidrasiSiap] = useState(null);

    const [keadaan, setKeadaan] = useState(() => ({
        keranjang: [],
        pesanan: [],
        slot: [],
        notifikasi: [],
        pengajuan: [],
        pengiriman: [],
        ulasan: [],
    }));

    // Migrasi satu kali dari seluruh snapshot pesanan lama ke penyimpanan bersama.
    useEffect(() => {
        if (migrasiBersama.current) return;

        migrasiBersama.current = true;

        let hasilMigrasi;

        try {
            hasilMigrasi = migrasiPesananLama();
        } catch (galat) {
            hasilMigrasi = { ok: false, status: 'gagal_migrasi', galat };
        }

        const baca = bacaPesananBersama();

        setDataBersama({
            status: baca.status,
            store: baca.ok ? baca.data : null,
            hasilMigrasi,
        });

        if (!hasilMigrasi.ok) {
            console.warn('[pesananBersama] migrasi belum selesai:', hasilMigrasi);
        } else if (hasilMigrasi.status === 'selesai') {
            console.info('[pesananBersama] migrasi selesai:', hasilMigrasi.ringkasan);
        } else if (hasilMigrasi.status === 'sudah_selesai') {
            console.info('[pesananBersama] migrasi sebelumnya sudah selesai.');
        } else if (hasilMigrasi.status === 'dipulihkan') {
            console.info('[pesananBersama] data bersama dipulihkan dari snapshot lama.');
        }
    }, []);

    // Hidrasi dari data server + penyimpanan bersama + snapshot akun.
    // Berjalan ulang hanya saat akun berganti (keluar/masuk), bukan saat navigasi.
    useEffect(() => {
        if (dataBersama.status === 'memuat') return;

        if (sudahHidrasi.current === kunciSimpan) return;

        sudahHidrasi.current = kunciSimpan;

        let tersimpan = {};

        try {
            const mentah = window.localStorage.getItem(kunciSimpan);

            if (mentah !== null && mentah !== undefined) {
                const nilai = JSON.parse(mentah);
                const validasi = validasiSnapshotAkun(nilai);

                if (validasi.ok) {
                    snapshotTidakBolehDisimpan.current.delete(kunciSimpan);
                } else {
                    snapshotTidakBolehDisimpan.current.add(kunciSimpan);

                    console.warn('[DemoContext] snapshot akun tidak valid dan tidak akan ditimpa:', {
                        kunci: kunciSimpan,
                        status: validasi.status,
                        field: validasi.field ?? null,
                        jenis: validasi.jenis ?? null,
                        indeks: validasi.indeks ?? null,
                    });
                }

                if (nilai && typeof nilai === 'object' && !Array.isArray(nilai)) {
                    tersimpan = nilai;
                }
            } else {
                snapshotTidakBolehDisimpan.current.delete(kunciSimpan);
            }
        } catch (galat) {
            snapshotTidakBolehDisimpan.current.add(kunciSimpan);
            tersimpan = {};

            console.warn('[DemoContext] snapshot akun gagal dibaca dan tidak akan ditimpa:', {
                kunci: kunciSimpan,
                galat,
            });
        }

        const adaSesi = sesi != null;
        const pesananSnapshot = adaSesi && Array.isArray(tersimpan.pesanan) ? tersimpan.pesanan : [];
        const pengirimanSnapshot =
            adaSesi && Array.isArray(tersimpan.pengiriman) ? tersimpan.pengiriman : [];
        const { pesanan, pengiriman } = hidrasiPesananBersama({
            seedPesanan: seedMentah.pesanan ?? [],
            seedPengiriman: seedMentah.pengiriman ?? [],
            pesananBersama: dataBersama.store?.pesanan ?? [],
            pengirimanBersama: dataBersama.store?.pengiriman ?? [],
            pesananSnapshot,
            pengirimanSnapshot,
            sesi,
        });
        const ambilCadangan = (nilai, cadangan) =>
            adaSesi && Array.isArray(nilai)
                ? nilai
                : (cadangan ?? []).map((item) => ({ ...item }));

        setKeadaan({
            keranjang: adaSesi && Array.isArray(tersimpan.keranjang) ? tersimpan.keranjang : [],
            pesanan,
            slot: ambilCadangan(tersimpan.slot, seed.slot),
            notifikasi: ambilCadangan(tersimpan.notifikasi, seed.notifikasi),
            pengajuan: ambilCadangan(tersimpan.pengajuan, seed.pengajuan),
            pengiriman: adaSesi ? pengiriman : [],
            ulasan: ambilCadangan(tersimpan.ulasan, seed.ulasan),
        });
        setHidrasiSiap(kunciSimpan);
    }, [
        dataBersama.status,
        dataBersama.store,
        kunciSimpan,
        sesi,
        seedMentah,
        seed.slot,
        seed.notifikasi,
        seed.pengajuan,
        seed.ulasan,
    ]);

    // Simpan ke localStorage setiap perubahan (hanya jika ada sesi aktif).
    useEffect(() => {
        if (!sesi) return;
        if (!migrasiBerhasil) return;
        if (hidrasiSiap !== kunciSimpan) return;
        if (snapshotTidakBolehDisimpan.current.has(kunciSimpan)) return;

        if (sudahHidrasi.current !== kunciSimpan) return;

        try {
            window.localStorage.setItem(kunciSimpan, JSON.stringify(keadaan));
        } catch {
            /* abaikan quota */
        }
    }, [hidrasiSiap, keadaan, kunciSimpan, migrasiBerhasil, sesi]);

    const akun = seed.akun ?? {};
    const penggunaAktif = sesi ?? null;

    const tambahToast = useCallback((pesan, jenis = 'sukses', judul = null) => {
        const id = uid('toast');

        setToast((t) => [...t, { id, pesan, jenis, judul }]);
        setTimeout(() => setToast((t) => t.filter((x) => x.id !== id)), 3800);
    }, []);

    const hapusToast = useCallback((id) => {
        setToast((t) => t.filter((x) => x.id !== id));
    }, []);

    const denganBusy = useCallback(async (fn, ms = 450) => {
        setBusy(true);

        try {
            await jeda(ms);

            return await fn();
        } finally {
            setBusy(false);
        }
    }, []);

    const tambahNotifikasi = useCallback((notif) => {
        setKeadaan((k) => ({
            ...k,
            notifikasi: [
                {
                    id: uid('notif'),
                    dibaca: false,
                    dibuat_pada: new Date().toISOString(),
                    ...notif,
                },
                ...k.notifikasi,
            ],
        }));
    }, []);

    // ------------------------------------------------------------- autentikasi
    /** Cari akun demo (password "password") atau akun hasil registrasi. */
    const cariAkun = useCallback(
        (surel) => {
            const demo = Object.values(seed.akun ?? {}).find(
                (a) => String(a.email).toLowerCase() === surel,
            );

            if (demo) return { akun: demo, kunci: 'password' };

            const lokal = akunLokal.find((a) => a.email === surel);

            if (lokal) return { akun: lokal, kunci: lokal.kunci };

            return null;
        },
        [seed.akun, akunLokal],
    );

    /** Login nyata: verifikasi email + password, lalu buka sesi. */
    const masuk = useCallback(
        (email, password) => {
            const surel = String(email ?? '').trim().toLowerCase();

            if (!surel || !password) {
                return { ok: false, pesan: 'Email dan password wajib diisi.' };
            }

            const hasil = cariAkun(surel);

            if (!hasil) {
                return { ok: false, pesan: 'Email belum terdaftar. Daftar dulu ya.' };
            }

            if (!cocokKunci(password, hasil.kunci)) {
                return { ok: false, pesan: 'Password salah. Coba lagi.' };
            }

            const { kunci, ...profil } = hasil.akun;

            setSesi({ ...profil, email: surel, masuk_pada: new Date().toISOString() });

            return { ok: true, peran: profil.peran };
        },
        [cariAkun, setSesi],
    );

    /** Registrasi: buat akun baru, simpan, lalu langsung login. */
    const daftar = useCallback(
        ({ nama, email, telepon = '', peran: peranBaru, password, pengajuan = null }) => {
            const surel = String(email ?? '').trim().toLowerCase();

            if (cariAkun(surel)) {
                return { ok: false, pesan: 'Email sudah terdaftar. Gunakan email lain atau masuk.' };
            }

            const baru = {
                id: 'usr-' + Date.now().toString(36),
                nama: String(nama ?? '').trim(),
                email: surel,
                telepon,
                peran: peranBaru,
                avatar: `/images/avatars/avatar-${Math.floor(Math.random() * 10)}.jpg`,
                alamat: null,
                patokan: null,
                latitude: null,
                longitude: null,
                restoran_id: null,
                toko: null,
                kunci: sandikanKunci(password),
                dibuat_pada: new Date().toISOString(),
            };

            setAkunLokal((l) => [...l, baru]);

            if (pengajuan) {
                const { kunci, ...profil } = baru;

                setPengajuanBaru((l) => [
                    {
                        id: 'reg-' + Date.now().toString(36),
                        peran: peranBaru,
                        status: 'pending',
                        form: pengajuan,
                        pengguna: {
                            id: profil.id,
                            nama: profil.nama,
                            email: profil.email,
                            telepon: profil.telepon,
                            avatar: profil.avatar,
                        },
                        dibuat_pada: profil.dibuat_pada,
                    },
                    ...l,
                ]);
            }

            const { kunci, ...profil } = baru;

            setSesi({ ...profil, masuk_pada: new Date().toISOString() });

            return { ok: true, peran: peranBaru };
        },
        [cariAkun, setAkunLokal, setPengajuanBaru, setSesi],
    );

    /** Keluar: hapus sesi, lalu pindah ke halaman login (bukan reload di tempat). */
    const keluar = useCallback(() => {
        setSesi(null);

        try {
            window.localStorage.removeItem('preorderly.peran');
        } catch {
            /* abaikan */
        }

        router.visit('/auth/login');
    }, [setSesi]);

    // ---------------------------------------------------------------- keranjang
    const keranjang = keadaan.keranjang;

    const tambahKeranjang = useCallback((menu, opsi = {}) => {
        setKeadaan((k) => {
            const ada = k.keranjang.find(
                (b) => b.menu_id === menu.id && b.restoran_id === menu.restoran_id,
            );

            if (ada) {
                return {
                    ...k,
                    keranjang: k.keranjang.map((b) =>
                        b.id === ada.id
                            ? { ...b, qty: Math.min(99, b.qty + (opsi.qty ?? 1)), catatan: opsi.catatan ?? b.catatan }
                            : b,
                    ),
                };
            }

            return {
                ...k,
                keranjang: [
                    ...k.keranjang,
                    {
                        id: uid('keranjang'),
                        menu_id: menu.id,
                        restoran_id: menu.restoran_id,
                        nama: menu.nama,
                        harga: menu.harga_efektif || menu.harga,
                        gambar: menu.gambar,
                        qty: opsi.qty ?? 1,
                        catatan: opsi.catatan ?? '',
                        lead_time_menit: menu.lead_time_menit,
                    },
                ],
            };
        });
    }, []);

    const ubahQtyKeranjang = useCallback((id, qty) => {
        setKeadaan((k) => ({
            ...k,
            keranjang:
                qty <= 0
                    ? k.keranjang.filter((b) => b.id !== id)
                    : k.keranjang.map((b) => (b.id === id ? { ...b, qty: Math.min(99, qty) } : b)),
        }));
    }, []);

    const hapusKeranjang = useCallback((id) => {
        setKeadaan((k) => ({ ...k, keranjang: k.keranjang.filter((b) => b.id !== id) }));
    }, []);

    const kosongkanKeranjang = useCallback(() => {
        setKeadaan((k) => ({ ...k, keranjang: [] }));
    }, []);

    const keranjangRingkas = useMemo(() => {
        const subtotal = keranjang.reduce((t, b) => t + b.harga * b.qty, 0);
        const restoranIds = [...new Set(keranjang.map((b) => b.restoran_id))];
        const perluOngkir = restoranIds.length === 1;
        const restoranPertama = restoranIds.length > 0 ? keranjang.find((b) => String(b.restoran_id) === String(restoranIds[0])) : null;
        const minOrderTersatisfied = restoranPertama ? subtotal >= (restoranPertama.min_order ?? 0) ? true : false : true;

        return {
            jumlah: keranjang.reduce((t, b) => t + b.qty, 0),
            subtotal,
            restoranIds,
            perluOngkir,
            minOrderTersatisfied,
        };
    }, [keranjang]);

    // --------------------------------------------------------------------- slot
    const slotRestoran = useCallback(
        (restoranId) =>
            keadaan.slot
                .filter((s) => String(s.restoran_id) === String(restoranId) && s.status === 'tersedia')
                .sort((a, b) => `${a.tanggal}${a.jam_mulai}`.localeCompare(`${b.tanggal}${b.jam_mulai}`)),
        [keadaan.slot],
    );

    const kurangiKuotaSlot = useCallback((slotId, jumlah = 1) => {
        if (!slotId) return;

        setKeadaan((k) => ({
            ...k,
            slot: k.slot.map((s) =>
                String(s.id) === String(slotId) ? { ...s, terisi: Math.max(0, (s.terisi ?? 0) + jumlah) } : s,
            ),
        }));
    }, []);

    /** Jadwalkan slot produksi baru untuk restoran penjual. */
    const tambahSlotProduksi = useCallback(
        (restoranId, { tanggal, mulai, selesai, kapasitas }) => {
            const tanggalDate = new Date(`${tanggal}T00:00:00`);
            const batas = new Date(tanggalDate);

            batas.setDate(batas.getDate() - 1);
            batas.setHours(21, 0, 0, 0);

            setKeadaan((k) => ({
                ...k,
                slot: [
                    ...k.slot,
                    {
                        id: uid('slot'),
                        restoran_id: String(restoranId),
                        tanggal,
                        tanggal_label: tanggalDate.toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                        }),
                        jam_mulai: mulai,
                        jam_selesai: selesai,
                        kapasitas: Number(kapasitas),
                        terisi: 0,
                        batas_pesan: batas.toISOString(),
                        status: 'tersedia',
                    },
                ],
            }));
        },
        [],
    );

    // ----------------------------------------------------------------- pesanan
    const buatPesanan = useCallback(
        async ({ slot_id, metode_bayar, alamat, catatan, simulated = false }) => {
            return denganBusy(() => {
                if (!keranjang.length) {
                    throw new Error('Keranjang masih kosong.');
                }

                const restoranId = keranjang[0].restoran_id;
                const restoran = (seed.restoran ?? []).find((r) => String(r.id) === String(restoranId));
                const subtotal = keranjang.reduce((t, b) => t + b.harga * b.qty, 0);
                const jarak = jarakKm(
                    { latitude: restoran?.latitude, longitude: restoran?.longitude },
                    { latitude: alamat?.latitude, longitude: alamat?.longitude },
                );
                const ongkir = hitungOngkir(jarak, subtotal);
                const total = subtotal + ongkir.dasar + BIAYA_LAYANAN;
                const bayarSekarang =
                    metode_bayar === 'cod'
                        ? 0
                        : metode_bayar === 'dp'
                          ? Math.round(subtotal * 0.3)
                          : total;

                const sekarang = new Date().toISOString();
                const pesananBaru = {
                    id: uid('pesanan'),
                    kode: nomorPesanan(),
                    pembeli_id: penggunaAktif?.id ?? 'demo-pembeli',
                    pembeli_nama: penggunaAktif?.nama ?? 'Pembeli Demo',
                    restoran_id: restoranId,
                    restoran_nama: restoran?.nama ?? 'Restoran',
                    kurir_id: null,
                    kurir_nama: null,
                    slot_id,
                    slot_label: keadaan.slot.find((s) => String(s.id) === String(slot_id))?.label ?? null,
                    items: keranjang.map((b) => ({
                        menu_id: b.menu_id,
                        nama: b.nama,
                        harga: b.harga,
                        qty: b.qty,
                        catatan: b.catatan,
                        gambar: b.gambar,
                    })),
                    subtotal,
                    ongkir: ongkir.dasar,
                    ongkir_gratis: ongkir.gratis,
                    biaya_layanan: BIAYA_LAYANAN,
                    diskon: 0,
                    total,
                    metode_bayar,
                    dibayar_sebesar: bayarSekarang,
                    sisa_tagihan: total - bayarSekarang,
                    status_bayar: metode_bayar === 'cod' ? 'menunggu_di_tempat' : 'lunas',
                    status: 'diproses',
                    catatan: catatan ?? '',
                    alamat,
                    jarak_km: jarak,
                    dibuat_pada: sekarang,
                    eta: keadaan.slot.find((s) => String(s.id) === String(slot_id))?.waktu ?? null,
                    timeline: [
                        { status: 'menunggu_pembayaran', label: 'Pesanan dibuat', pada: sekarang, oleh: 'Pembeli' },
                        { status: 'diproses', label: 'Pembayaran diterima, masuk dapur', pada: sekarang, oleh: 'Sistem' },
                    ],
                    simulated,
                };

                setKeadaan((k) => ({
                    ...k,
                    pesanan: [pesananBaru, ...k.pesanan],
                    keranjang: [],
                    slot: k.slot.map((s) =>
                        String(s.id) === String(slot_id) ? { ...s, terisi: (s.terisi ?? 0) + 1 } : s,
                    ),
                }));

                tambahNotifikasi({
                    pengguna_id: 'akun-penjual',
                    tipe: 'pesanan',
                    judul: 'Pesanan baru masuk',
                    isi: `${pesananBaru.kode} · ${pesananBaru.items.length} menu dari ${pesananBaru.pembeli_nama}`,
                    link: '/seller/pesanan',
                });

                tambahNotifikasi({
                    pengguna_id: penggunaAktif?.id ?? 'akun-pembeli',
                    tipe: 'pesanan',
                    judul: 'Pesanan berhasil dibuat',
                    isi: `${pesananBaru.kode} sedang dimasak di ${pesananBaru.restoran_nama}.`,
                    link: '/pesanan',
                });

                tambahToast(`Pesanan ${pesananBaru.kode} berhasil dibuat.`, 'sukses', 'Berhasil');

                return pesananBaru;
            }, 700);
        },
        [denganBusy, keranjang, keadaan.slot, penggunaAktif, seed.restoran, tambahNotifikasi, tambahToast],
    );

    const majukanStatus = useCallback(
        async (orderId, statusBaru, oleh = penggunaAktif?.nama ?? 'Sistem') => {
            return denganBusy(() => {
                const pesan = keadaan.pesanan.find((p) => String(p.id) === String(orderId));

                if (!pesan) {
                    tambahToast('Pesanan tidak ditemukan.', 'error');

                    return null;
                }

                // Validasi transisi status
                if (!canStatusDitransisi(pesan.status, statusBaru)) {
                    tambahToast('Transisi status dari "' + labelStatus(pesan.status) +
                        '" ke "' + labelStatus(statusBaru) + '" tidak valid.', 'error');

                    return null;
                }

                const hasil = {
                    ...pesan,
                    status: statusBaru,
                    dibatalkan_oleh: statusBaru === 'dibatalkan' ? oleh : pesan.dibatalkan_oleh,
                    timeline: [
                        ...(pesan.timeline ?? []),
                        {
                            status: statusBaru,
                            label: labelStatus(statusBaru),
                            pada: new Date().toISOString(),
                            oleh,
                        },
                    ],
                };

                setKeadaan((k) => ({
                    ...k,
                    // Slot dilepas kembali hanya jika pesanan dibatalkan sebelum dikirim.
                    slot:
                        statusBaru === 'dibatalkan' && pesan.slot_id
                            ? k.slot.map((s) =>
                                  String(s.id) === String(pesan.slot_id)
                                      ? { ...s, terisi: Math.max(0, (s.terisi ?? 0) - 1) }
                                      : s,
                              )
                            : k.slot,
                    pesanan: k.pesanan.map((p) => (String(p.id) === String(orderId) ? hasil : p)),
                    pengiriman:
                        statusBaru === 'diambil_kurir' || statusBaru === 'selesai'
                            ? k.pengiriman.map((p) =>
                                  String(p.pesanan_id) === String(orderId)
                                      ? {
                                            ...p,
                                            status: statusBaru === 'selesai' ? 'selesai' : 'diambil',
                                            ...(statusBaru === 'selesai'
                                                ? { selesai_pada: new Date().toISOString() }
                                                : { diambil_pada: new Date().toISOString() }),
                                        }
                                      : p,
                              )
                            : k.pengiriman,
                }));

                tambahNotifikasi({
                    pengguna_id: hasil.pembeli_id,
                    tipe: 'pengiriman',
                    judul: 'Status pesanan diperbarui',
                    isi: `${hasil.kode} · ${labelStatus(statusBaru)}`,
                    link: '/pesanan',
                });

                if (statusBaru === 'dalam_pengiriman') {
                    tambahNotifikasi({
                        pengguna_id: 'akun-kurir',
                        tipe: 'pengiriman',
                        judul: 'Pesanan dalam pengiriman',
                        isi: `${hasil.kode} sedang diantar ke pembeli.`,
                        link: '/courier/pengiriman',
                    });
                }

                tambahToast(`Status diubah menjadi "${labelStatus(statusBaru)}".`, 'sukses');

                return hasil;
            }, 600);
        },
        [denganBusy, keadaan.pesanan, penggunaAktif, tambahNotifikasi, tambahToast],
    );

    const batalkanPesanan = useCallback(
        async (orderId, alasan) => {
            const pesan = keadaan.pesanan.find((p) => String(p.id) === String(orderId));

            if (!pesan) throw new Error('Pesanan tidak ditemukan.');

            if (['diambil_kurir', 'dalam_pengiriman', 'selesai'].includes(pesan.status)) {
                throw new Error('Pesanan sudah dalam pengiriman dan tidak bisa dibatalkan.');
            }

            return await majukanStatus(orderId, 'dibatalkan', penggunaAktif?.nama ?? 'Pembeli');
        },
        [keadaan.pesanan, majukanStatus, penggunaAktif],
    );

    // ------------------------------------------------------------------ kiriman
    const pesananTersediaUntukKurir = useMemo(() => {
        const sudahDiklaim = new Set(
            keadaan.pengiriman.filter((p) => p.status !== 'selesai').map((p) => String(p.pesanan_id)),
        );

        return keadaan.pesanan.filter(
            (p) => ['diproses', 'siap_diantar'].includes(p.status) && !sudahDiklaim.has(String(p.id)),
        );
    }, [keadaan.pengiriman, keadaan.pesanan]);

    const klaimPengiriman = useCallback(
        async (orderId) => {
            return denganBusy(() => {
                const pesan = keadaan.pesanan.find((p) => String(p.id) === String(orderId));

                if (!pesan) throw new Error('Pesanan tidak ditemukan.');

                if (keadaan.pengiriman.some((p) => String(p.pesanan_id) === String(orderId) && p.status !== 'selesai')) {
                    throw new Error('Pesanan ini sudah diambil kurir lain.');
                }

                const pengirim = {
                    id: uid('kirim'),
                    pesanan_id: pesan.id,
                    kode: pesan.kode,
                    alamat: pesan.alamat,
                    jarak_km: pesan.jarak_km,
                    ongkir: pesan.ongkir,
                    status: 'diambil',
                    kurir_id: penggunaAktif?.id ?? 'akun-kurir',
                    kurir_nama: penggunaAktif?.nama ?? 'Kurir Demo',
                    diambil_pada: new Date().toISOString(),
                };

                setKeadaan((k) => ({
                    ...k,
                    pengiriman: [
                        pengirim,
                        ...k.pengiriman.filter((p) => String(p.pesanan_id) !== String(pesan.id)),
                    ],
                    pesanan: k.pesanan.map((p) =>
                        String(p.id) === String(pesan.id)
                            ? { ...p, kurir_id: pengirim.kurir_id, kurir_nama: pengirim.kurir_nama }
                            : p,
                    ),
                }));

                tambahNotifikasi({
                    pengguna_id: pesan.pembeli_id,
                    tipe: 'pengiriman',
                    judul: 'Kurir telah mengambil pesanan',
                    isi: `${pengirim.kurir_nama} akan mengantar ${pesan.kode}.`,
                    link: '/pesanan',
                });

                tambahToast(`Pesanan ${pesan.kode} berhasil diklaim.`, 'sukses', 'Ambil Pesanan');

                return pengirim;
            }, 700);
        },
        [denganBusy, keadaan.pengiriman, keadaan.pesanan, penggunaAktif, tambahNotifikasi, tambahToast],
    );

    // ---------------------------------------------------------------- pengajuan
    const daftarPengajuan = useCallback(
        async ({ id, status, alasan, catatan }) => {
            return denganBusy(() => {
                const ada = keadaan.pengajuan.some((p) => p.id === id);

                const data = {
                    id,
                    status,
                    alasan: alasan ?? null,
                    catatan: catatan ?? null,
                    diproses_pada: new Date().toISOString(),
                    diproses_oleh: penggunaAktif?.nama ?? 'Admin',
                };

                setKeadaan((k) => ({
                    ...k,
                    pengajuan: ada
                        ? k.pengajuan.map((p) => (p.id === id ? { ...p, ...data } : p))
                        : [data, ...k.pengajuan],
                }));

                tambahToast(
                    status === 'approved' ? 'Pengajuan berhasil disetujui.' : 'Pengajuan berhasil ditolak.',
                    status === 'approved' ? 'sukses' : 'info',
                    'Verifikasi',
                );

                return data;
            }, 650);
        },
        [denganBusy, keadaan.pengajuan, penggunaAktif, tambahToast],
    );

    // --------------------------------------------------------------- notifikasi
    const tandaiDibaca = useCallback((id) => {
        setKeadaan((k) => ({
            ...k,
            notifikasi: k.notifikasi.map((n) => (n.id === id ? { ...n, dibaca: true } : n)),
        }));
    }, []);

    const tandaiSemuaDibaca = useCallback(() => {
        setKeadaan((k) => ({ ...k, notifikasi: k.notifikasi.map((n) => ({ ...n, dibaca: true })) }));
    }, []);

    const notifikasiBelumDibaca = useMemo(
        () => keadaan.notifikasi.filter((n) => !n.dibaca).length,
        [keadaan.notifikasi],
    );

    // ------------------------------------------------------------------- ulasan
    const tambahUlasan = useCallback((ulasanBaru) => {
        setKeadaan((k) => ({ ...k, ulasan: [ulasanBaru, ...k.ulasan] }));
    }, []);

    /** Hapus semua perubahan lokal milik akun ini (bukan logout). */
    const bersihkanDemo = useCallback(() => {
        window.localStorage.removeItem(kunciSimpan);
        window.location.reload();
    }, [kunciSimpan]);

    const kirimOtpDemo = useCallback(() => '123456', []);

    // ------------------------------------------------------------ aksi nyata

    /** Simpan profil / toko milik akun yang sedang login. */
    const simpanProfil = useCallback(
        (partial) => {
            if (!sesi) return;

            const lengkap = { ...sesi, ...partial };

            setSesi(lengkap);
            setAkunLokal((prev) =>
                prev.map((a) => (String(a.id) === String(sesi.id) ? { ...a, ...partial } : a)),
            );
        },
        [sesi, setSesi, setAkunLokal],
    );

    /** Ganti password akun hasil registrasi. Akun demo selalu memakai "password". */
    const gantiKunci = useCallback(
        (kunciBaru, kunciLama) => {
            if (!sesi) return { ok: false, pesan: 'Tidak ada sesi login.' };

            const punyaSeed = Object.values(seed.akun ?? {}).some(
                (a) => String(a.email).toLowerCase() === String(sesi.email).toLowerCase(),
            );

            if (punyaSeed) {
                if (!cocokKunci(kunciLama, 'password')) {
                    return { ok: false, pesan: 'Password saat ini salah.' };
                }

                return { ok: false, pesan: 'Akun demo memakai password tetap "password".' };
            }

            const akunIni = akunLokal.find((a) => String(a.id) === String(sesi.id));

            if (!akunIni || !cocokKunci(kunciLama, akunIni.kunci)) {
                return { ok: false, pesan: 'Password saat ini salah.' };
            }

            setAkunLokal((prev) =>
                prev.map((a) =>
                    String(a.id) === String(sesi.id) ? { ...a, kunci: sandikanKunci(kunciBaru) } : a,
                ),
            );

            return { ok: true };
        },
        [sesi, akunLokal, seed.akun, setAkunLokal],
    );

    /** Simpan perubahan profil restoran (nama, alamat, deskripsi, ...). */
    const simpanRestoran = useCallback(
        (restoranId, patch) => {
            const rId = String(restoranId);

            setRestoranLokal((prev) => ({ ...prev, [rId]: { ...(prev[rId] ?? {}), ...patch } }));
        },
        [setRestoranLokal],
    );

    /** Tambah atau ubah menu di restoran penjual. `menu.id` kosong = menu baru. */
    const simpanMenu = useCallback(
        (restoranId, menu) => {
            const rId = String(restoranId);

            setMenuLokal((prev) => {
                const dasar =
                    prev[rId] ??
                    (seed.restoran ?? []).find((r) => String(r.id) === rId)?.menu ??
                    [];
                const daftar = dasar.map((m) => ({ ...m }));
                const idx = daftar.findIndex((m) => String(m.id) === String(menu.id));

                if (idx >= 0) daftar[idx] = { ...daftar[idx], ...menu };
                else
                    daftar.push({
                        gambar: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
                        rating: 0,
                        terjual: 0,
                        aktif: true,
                        lead_time_label: `${menu.lead_time ?? 30} menit`,
                        ...menu,
                        id: menu.id ?? uid('menu'),
                    });

                return { ...prev, [rId]: daftar };
            });
        },
        [seed, setMenuLokal],
    );

    const toggleMenu = useCallback(
        (restoranId, menuId) => {
            const rId = String(restoranId);

            setMenuLokal((prev) => {
                const dasar =
                    prev[rId] ??
                    (seed.restoran ?? []).find((r) => String(r.id) === rId)?.menu ??
                    [];

                return {
                    ...prev,
                    [rId]: dasar.map((m) =>
                        String(m.id) === String(menuId) ? { ...m, aktif: m.aktif === false } : m,
                    ),
                };
            });
        },
        [seed, setMenuLokal],
    );

    const hapusMenu = useCallback(
        (restoranId, menuId) => {
            const rId = String(restoranId);

            setMenuLokal((prev) => {
                const dasar =
                    prev[rId] ??
                    (seed.restoran ?? []).find((r) => String(r.id) === rId)?.menu ??
                    [];

                return { ...prev, [rId]: dasar.filter((m) => String(m.id) !== String(menuId)) };
            });
        },
        [seed, setMenuLokal],
    );

    const tambahKategori = useCallback(
        (nama, deskripsi = '') => {
            setKategoriLokal((prev) => [...prev, { id: uid('kat'), nama, deskripsi }]);
        },
        [setKategoriLokal],
    );

    const hapusKategori = useCallback(
        (id) => {
            setKategoriLokal((prev) => prev.filter((k) => String(k.id) !== String(id)));
        },
        [setKategoriLokal],
    );

    const nilai = useMemo(
        () => ({
            seed,
            akun,
            penggunaAktif,
            sesi,
            peran,
            masuk,
            daftar,
            keluar,
            simpanProfil,
            gantiKunci,
            simpanRestoran,
            simpanMenu,
            toggleMenu,
            hapusMenu,
            tambahKategori,
            hapusKategori,
            busy,
            toast,
            tambahToast,
            hapusToast,

            keranjang,
            keranjangRingkas,
            tambahKeranjang,
            ubahQtyKeranjang,
            hapusKeranjang,
            kosongkanKeranjang,

            pesanan: keadaan.pesanan,
            buatPesanan,
            majukanStatus,
            batalkanPesanan,

            slotRestoran,
            kurangiKuotaSlot,
            slot: keadaan.slot,
            tambahSlotProduksi,

            pesananTersediaUntukKurir,
            pengiriman: keadaan.pengiriman,
            klaimPengiriman,

            pengajuan: keadaan.pengajuan,
            daftarPengajuan,

            notifikasi: keadaan.notifikasi,
            notifikasiBelumDibaca,
            tandaiDibaca,
            tandaiSemuaDibaca,
            tambahNotifikasi,

            ulasan: keadaan.ulasan,
            tambahUlasan,

            kirimOtpDemo,
            bersihkanDemo,
        }),
        [
            seed,
            akun,
            penggunaAktif,
            sesi,
            peran,
            masuk,
            daftar,
            keluar,
            simpanProfil,
            gantiKunci,
            simpanRestoran,
            simpanMenu,
            toggleMenu,
            hapusMenu,
            tambahKategori,
            hapusKategori,
            busy,
            toast,
            tambahToast,
            hapusToast,
            keranjang,
            keranjangRingkas,
            tambahKeranjang,
            ubahQtyKeranjang,
            hapusKeranjang,
            kosongkanKeranjang,
            keadaan.pesanan,
            buatPesanan,
            majukanStatus,
            batalkanPesanan,
            slotRestoran,
            kurangiKuotaSlot,
            keadaan.slot,
            tambahSlotProduksi,
            pesananTersediaUntukKurir,
            keadaan.pengiriman,
            klaimPengiriman,
            keadaan.pengajuan,
            daftarPengajuan,
            keadaan.notifikasi,
            notifikasiBelumDibaca,
            tandaiDibaca,
            tandaiSemuaDibaca,
            tambahNotifikasi,
            keadaan.ulasan,
            tambahUlasan,
            kirimOtpDemo,
            bersihkanDemo,
        ],
    );

    return <DemoContext.Provider value={nilai}>{children}</DemoContext.Provider>;
}

function labelStatus(status) {
    const peta = {
        menunggu_pembayaran: 'Menunggu Pembayaran',
        diproses: 'Sedang Dimasak',
        siap_diantar: 'Siap Diantar',
        diambil_kurir: 'Kurir Mengambil',
        dalam_pengiriman: 'Dalam Pengiriman',
        selesai: 'Pesanan Selesai',
        dibatalkan: 'Dibatalkan',
        kedaluwarsa: 'Kedaluwarsa',
    };

    return peta[status] ?? status;
}

/**
 * Validasi transisi status pesanan.
 * Hanya mengizinkan transisi ke status yang berada setelah status saat ini
 * dalam urutan alur, dan tidak mengizinkan transisi dari status akhir.
 */
function validasiTransisiStatus(statusLama, statusBaru, urutanStatus) {
    // Status akhir tidak boleh diubah
    const statusAkhir = new Set(['selesai', 'dibatalkan', 'kedaluwarsa']);
    if (statusAkhir.has(statusLama)) {
        return false;
    }

    // Tidak boleh sama
    if (statusLama === statusBaru) {
        return false;
    }

    // Mundur (ke status sebelumnya) tidak diizinkan
    const indeksLama = urutanStatus.indexOf(statusLama);
    const indeksBaru = urutanStatus.indexOf(statusBaru);
    if (indeksLama >= 0 && indeksBaru >= 0 && indeksBaru < indeksLama) {
        return false;
    }

    // Validasi transisi spesifik berdasarkan status lama
    switch (statusLama) {
        case 'menunggu_pembayaran':
            return statusBaru === 'diproses' || statusBaru === 'dibatalkan';
        case 'diproses':
            return statusBaru === 'siap_diantar' || statusBaru === 'dibatalkan';
        case 'siap_diantar':
            return statusBaru === 'diambil_kurir' || statusBaru === 'dibatalkan';
        case 'diambil_kurir':
            return statusBaru === 'dalam_pengiriman' || statusBaru === 'dibatalkan';
        case 'dalam_pengiriman':
            return statusBaru === 'selesai' || statusBaru === 'dibatalkan';
        default:
            // Untuk status lain, izinkan jika index baru lebih besar
            return indeksBaru > indeksLama;
    }
}

export function canStatusDitransisi(statusLama, statusBaru) {
    return validasiTransisiStatus(statusLama, statusBaru, URUTAN_STATUS);
}

export function useDemo() {
    const konteks = useContext(DemoContext);

    if (!konteks) {
        throw new Error('useDemo() harus dipakai di dalam <DemoProvider>.');
    }

    return konteks;
}

/**
 * Gerbang akses berbasis sesi login & peran.
 *
 * - 'tamu'  → hanya untuk yang BELUM login (halaman auth)
 * - 'auth'  → wajib login, peran apa pun
 * - peran   → wajib login DAN peran harus cocok ('pembeli', 'penjual', 'kurir', 'admin')
 *
 * Mengembalikan true jika halaman boleh dirender; selain itu user
 * dialihkan ke halaman login (belum sesi) atau dashboard perannya
 * (peran tidak cocok) — tidak pernah menyisihkan halaman asing.
 */
export function useJaga(peranWajib) {
    const { sesi } = useDemo();

    let boleh;

    if (peranWajib === 'tamu') boleh = !sesi;
    else if (peranWajib === 'auth') boleh = !!sesi;
    else boleh = !!sesi && sesi.peran === peranWajib;

    const tujuan = !sesi ? '/auth/login' : (DASHBOARD_ROLE[sesi.peran] ?? '/');

    useEffect(() => {
        if (boleh) return;

        router.visit(tujuan);
    }, [boleh, tujuan]);

    return boleh;
}

export { indeksStatus, URUTAN_STATUS, METODE_PEMBAYARAN };
