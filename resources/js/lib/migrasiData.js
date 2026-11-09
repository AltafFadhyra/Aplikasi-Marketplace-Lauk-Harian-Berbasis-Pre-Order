import {
    KUNCI_DATA,
    KUNCI_MIGRASI,
    PREFIX_BACKUP,
    VERSI_SKEMA,
    adalahObjek,
    buatStoreDariSeed,
    gabungUnik,
    kunciUlasan,
    lengkapiFieldArray,
    normalisasiAkunLokal,
    normalisasiKategori,
    normalisasiMenu,
    normalisasiNotifikasi,
    normalisasiPesanan,
    normalisasiPengajuan,
    normalisasiPengiriman,
    normalisasiRestoran,
    normalisasiSlot,
    normalisasiStore,
    normalisasiUlasan,
    sidik,
    validasiNonaktif,
    validasiStore,
} from './skemaData.js';

export const KONFIRMASI_PAKSA = 'SAYA_MENYETUJUI_TIMPA_DATA_SOUORDER';

export const VERSI_MARKER = 1;

const MODE_MARKER_DIKENAL = new Set([
    'migrasi_awal',
    'upgrade',
    'tulis_ulang',
    'pulihkan_store_rusak',
    'inisialisasi_field',
    'normalisasi',
    'perbaikan_marker',
]);

const PREFIX_LAMA = 'preorderly.';
const PREFIX_DEMO = 'preorderly.demo.v1.';
const PREFIX_SOUORDER = 'souorder.';
const BATAS_KUNCI_STORAGE = 1_000_000;

const FIELD_ARRAY = [
    'restoran',
    'kategori',
    'slot',
    'pesanan',
    'pengiriman',
    'pengajuan',
    'notifikasi',
    'ulasan',
    'akun_lokal',
    'nonaktif',
];

export function bacaJsonAman(storage, kunci) {
    let mentah = null;

    try {
        mentah = storage.getItem(kunci);
    } catch (galat) {
        return { status: 'gagal_baca', ada: false, ok: false, nilai: null, mentah: null, galat };
    }

    if (mentah === null) {
        return { status: 'tidak_ada', ada: false, ok: true, nilai: null, mentah: null };
    }

    try {
        return { status: 'ok', ada: true, ok: true, nilai: JSON.parse(mentah), mentah };
    } catch (galat) {
        return { status: 'json_rusak', ada: true, ok: false, nilai: null, mentah, galat };
    }
}

export function tulisJsonAman(storage, kunci, nilai) {
    try {
        const teks = JSON.stringify(nilai);

        storage.setItem(kunci, teks);

        return { ok: true, teks };
    } catch (galat) {
        return { ok: false, galat };
    }
}

function tulisMentahTerverifikasi(storage, kunci, mentah, percobaan = 2) {
    if (
        !storage ||
        typeof storage.getItem !== 'function' ||
        typeof storage.setItem !== 'function'
    ) {
        return {
            ok: false,
            status: 'storage_tidak_tersedia',
            galat: new Error('Storage tidak tersedia atau tidak valid.'),
            percobaan: 0,
        };
    }

    if (typeof mentah !== 'string') {
        return {
            ok: false,
            status: 'nilai_tidak_valid',
            galat: new Error(`Nilai mentah untuk "${kunci}" harus berupa string.`),
            percobaan: 0,
        };
    }

    const maks = batasPercobaan(percobaan);
    let galat = null;

    for (let ke = 1; ke <= maks; ke += 1) {
        try {
            storage.setItem(kunci, mentah);
        } catch (error) {
            galat = error;
            continue;
        }

        try {
            if (storage.getItem(kunci) === mentah) {
                return { ok: true, percobaan: ke };
            }
        } catch (error) {
            galat = error;
            continue;
        }

        galat = new Error(`Verifikasi tulis mentah "${kunci}" gagal.`);
    }

    return {
        ok: false,
        status: 'gagal_verifikasi',
        galat: galat ?? new Error(`Gagal menulis mentah "${kunci}".`),
        percobaan: maks,
    };
}

function batasPercobaan(nilai) {
    const angka = Number(nilai);

    if (!Number.isFinite(angka)) return 2;

    return Math.min(5, Math.max(1, Math.trunc(angka)));
}

export function tulisJsonTerverifikasi(storage, kunci, nilai, percobaan = 2) {
    if (
        !storage ||
        typeof storage.getItem !== 'function' ||
        typeof storage.setItem !== 'function'
    ) {
        return {
            ok: false,
            status: 'storage_tidak_tersedia',
            galat: new Error('Storage tidak tersedia atau tidak valid.'),
            percobaan: 0,
        };
    }

    const maks = batasPercobaan(percobaan);
    let galat = null;

    for (let ke = 1; ke <= maks; ke += 1) {
        const tulis = tulisJsonAman(storage, kunci, nilai);

        if (!tulis.ok) {
            galat = tulis.galat;
            continue;
        }

        const baca = bacaJsonAman(storage, kunci);

        if (baca.ok && baca.mentah === tulis.teks) {
            return { ok: true, teks: tulis.teks, percobaan: ke };
        }

        galat = new Error(`Verifikasi tulis "${kunci}" gagal.`);
    }

    return {
        ok: false,
        status: 'gagal_verifikasi',
        galat: galat ?? new Error(`Gagal menulis "${kunci}".`),
        percobaan: maks,
    };
}

function bacaDaftarKunci(storage) {
    if (!storage || typeof storage.key !== 'function') {
        return {
            status: 'storage_tidak_tersedia',
            ok: false,
            kunci: [],
            galat: new Error('Storage tidak tersedia.'),
        };
    }

    let jumlah = 0;

    try {
        jumlah = storage.length;
    } catch (galat) {
        return { status: 'gagal_baca', ok: false, kunci: [], galat };
    }

    if (
        typeof jumlah !== 'number' ||
        !Number.isInteger(jumlah) ||
        jumlah < 0 ||
        jumlah > BATAS_KUNCI_STORAGE
    ) {
        return {
            status: 'gagal_baca',
            ok: false,
            kunci: [],
            galat: new Error('Panjang storage tidak valid.'),
        };
    }

    const hasil = [];

    for (let i = 0; i < jumlah; i += 1) {
        try {
            const kunci = storage.key(i);

            if (typeof kunci !== 'string') {
                return {
                    status: 'tidak_stabil',
                    ok: false,
                    kunci: hasil,
                    galat: new Error('Daftar key storage berubah saat dibaca.'),
                };
            }

            hasil.push(kunci);
        } catch (galat) {
            return { status: 'gagal_baca', ok: false, kunci: hasil, galat };
        }
    }

    return { status: 'ok', ok: true, kunci: hasil };
}

function bentukNilai(nilai) {
    return nilai === null ? 'null' : typeof nilai;
}

function galatBacaDataLama(hasil, kunci) {
    const galat = new Error(
        hasil.status === 'json_rusak'
            ? `JSON data lama "${kunci}" rusak.`
            : `Data lama "${kunci}" gagal dibaca.`,
    );

    galat.kode = hasil.status;
    galat.kunci = kunci;
    galat.asal = hasil.galat;

    return galat;
}

function galatBentukDataLama(kunci, nilai, field = null, harapan = 'array') {
    const bentuk = bentukNilai(nilai);
    const lokasi = field ? ` pada "${kunci}.${field}"` : ` pada "${kunci}"`;
    const galat = new Error(
        `Data lama${lokasi} harus berupa ${harapan}, bukan ${bentuk}.`,
    );

    galat.kode = 'bentuk_tidak_valid';
    galat.kunci = kunci;
    galat.bentuk = bentuk;

    if (field) galat.field = field;

    return galat;
}

function bacaArrayLamaStrict(storage, kunci) {
    const hasil = bacaJsonAman(storage, kunci);

    if (hasil.status === 'gagal_baca' || hasil.status === 'json_rusak') {
        throw galatBacaDataLama(hasil, kunci);
    }

    if (!hasil.ada) return [];

    if (!Array.isArray(hasil.nilai)) {
        throw galatBentukDataLama(kunci, hasil.nilai);
    }

    return hasil.nilai;
}

function bacaObjekLamaStrict(storage, kunci) {
    const hasil = bacaJsonAman(storage, kunci);

    if (hasil.status === 'gagal_baca' || hasil.status === 'json_rusak') {
        throw galatBacaDataLama(hasil, kunci);
    }

    if (!hasil.ada) return undefined;

    if (!adalahObjek(hasil.nilai)) {
        throw galatBentukDataLama(kunci, hasil.nilai, null, 'objek');
    }

    return hasil.nilai;
}

function bacaArrayDemoStrict(state, kunci, field) {
    if (!Object.prototype.hasOwnProperty.call(state, field)) return [];

    if (state[field] === undefined) return [];

    if (!Array.isArray(state[field])) {
        throw galatBentukDataLama(kunci, state[field], field);
    }

    return state[field];
}

function pastikanRestoranLokal(restoranLokal, kunci) {
    if (restoranLokal === undefined) return;

    for (const [id, patch] of Object.entries(restoranLokal)) {
        if (!adalahObjek(patch)) {
            throw galatBentukDataLama(kunci, patch, id, 'objek');
        }
    }
}

function pastikanMenuLokal(menuLokal, kunci) {
    if (menuLokal === undefined) return;

    for (const [id, menu] of Object.entries(menuLokal)) {
        if (!Array.isArray(menu)) {
            throw galatBentukDataLama(kunci, menu, id);
        }
    }
}

function waktuIso(sekarang) {
    const tanggal = sekarang instanceof Date ? sekarang : new Date(sekarang);
    const aman = Number.isNaN(tanggal.getTime()) ? new Date() : tanggal;

    return aman.toISOString();
}

function waktuNilai(...nilai) {
    for (const item of nilai) {
        if (typeof item !== 'string' || !item.trim()) continue;

        const waktu = Date.parse(item);

        if (Number.isFinite(waktu)) return waktu;
    }

    return Number.NEGATIVE_INFINITY;
}

function angkaFinite(nilai) {
    return typeof nilai === 'number' && Number.isFinite(nilai);
}

function kunciAkun(akun) {
    if (!adalahObjek(akun)) return null;

    if (akun.id !== undefined && akun.id !== null) return `id:${String(akun.id)}`;
    if (typeof akun.email === 'string' && akun.email.trim()) {
        return `email:${akun.email.trim().toLowerCase()}`;
    }

    return null;
}

function kunciPesanan(pesanan) {
    if (!adalahObjek(pesanan)) return null;

    if (pesanan.id !== undefined && pesanan.id !== null) {
        return `id:${String(pesanan.id)}`;
    }

    if (pesanan.kode !== undefined && pesanan.kode !== null) {
        return `kode:${String(pesanan.kode)}`;
    }

    return null;
}

function kunciSlot(slot) {
    return adalahObjek(slot) && slot.id !== undefined && slot.id !== null
        ? String(slot.id)
        : null;
}

function kunciPengajuan(pengajuan) {
    return adalahObjek(pengajuan) && pengajuan.id !== undefined && pengajuan.id !== null
        ? String(pengajuan.id)
        : null;
}

function kunciPengiriman(pengiriman) {
    if (!adalahObjek(pengiriman)) return null;

    if (pengiriman.id !== undefined && pengiriman.id !== null) {
        return `id:${String(pengiriman.id)}`;
    }

    if (pengiriman.pesanan_id !== undefined && pengiriman.pesanan_id !== null) {
        return `pesanan:${String(pengiriman.pesanan_id)}`;
    }

    return null;
}

function kunciNotifikasi(notifikasi) {
    if (!adalahObjek(notifikasi)) return null;

    if (notifikasi.id !== undefined && notifikasi.id !== null) {
        return String(notifikasi.id);
    }

    return `notif:${sidik(
        notifikasi.pengguna_id,
        notifikasi.tipe,
        notifikasi.judul,
        notifikasi.dibuat_pada,
    )}`;
}

function kunciKategori(kategori) {
    if (!adalahObjek(kategori)) return null;

    return kategori.id ?? kategori.slug ?? kategori.nama ?? null;
}

function kunciNonaktif(item) {
    if (typeof item === 'string') return `string:${item}`;

    if (typeof item === 'number') return `number:${String(item)}`;

    return `${typeof item}:${String(item)}`;
}

function pilihPesanan(lama, baru) {
    const waktuLama = waktuNilai(
        lama?.diperbarui_pada,
        lama?.dibuat_pada,
        ...(Array.isArray(lama?.timeline) ? lama.timeline.map((item) => item?.pada) : []),
    );
    const waktuBaru = waktuNilai(
        baru?.diperbarui_pada,
        baru?.dibuat_pada,
        ...(Array.isArray(baru?.timeline) ? baru.timeline.map((item) => item?.pada) : []),
    );

    if (waktuBaru > waktuLama) return baru;
    if (waktuLama > waktuBaru) return lama;

    if (lama?.asal === 'seed' && baru?.asal !== 'seed') return baru;

    return lama;
}

function pilihSlot(lama, baru) {
    return Number(baru?.terisi ?? 0) > Number(lama?.terisi ?? 0) ? baru : lama;
}

function pilihPengajuan(lama, baru) {
    const waktuLama = waktuNilai(
        lama?.diproses_pada,
        lama?.diperbarui_pada,
        lama?.dibuat_pada,
    );
    const waktuBaru = waktuNilai(
        baru?.diproses_pada,
        baru?.diperbarui_pada,
        baru?.dibuat_pada,
    );

    if (waktuBaru > waktuLama) {
        return { ...lama, ...baru };
    }

    return { ...baru, ...lama };
}

function pilihPengiriman(lama, baru) {
    const waktuLama = waktuNilai(
        lama?.diperbarui_pada,
        lama?.selesai_pada,
        lama?.diambil_pada,
    );
    const waktuBaru = waktuNilai(
        baru?.diperbarui_pada,
        baru?.selesai_pada,
        baru?.diambil_pada,
    );

    return waktuBaru >= waktuLama ? baru : lama;
}

function pilihUlasan(lama, baru) {
    return baru?.dibuat_pada || baru?.isi || baru?.komentar ? baru : lama;
}

function jumlahStore(store) {
    return Object.fromEntries(
        FIELD_ARRAY.map((field) => [
            field,
            Array.isArray(store?.[field]) ? store[field].length : 0,
        ]),
    );
}

export function kumpulkanSnapshot(storage) {
    const daftar = bacaDaftarKunci(storage);

    if (!daftar.ok) {
        return {
            status: daftar.status,
            lengkap: false,
            kunci: [],
            sumber: {},
            gagal: [],
            galat: daftar.galat ?? null,
        };
    }

    const kunci = daftar.kunci.filter(
        (item) =>
            item.startsWith(PREFIX_LAMA) ||
            (item.startsWith(PREFIX_SOUORDER) && !item.startsWith(PREFIX_BACKUP)),
    );
    const sumber = {};
    const gagal = [];

    for (const item of kunci) {
        let mentah = null;

        try {
            mentah = storage.getItem(item);
        } catch (galat) {
            gagal.push({ kunci: item, status: 'gagal_baca', galat });
            continue;
        }

        if (mentah === null) {
            gagal.push({
                kunci: item,
                status: 'hilang_saat_dibaca',
                galat: new Error(`Key "${item}" hilang saat snapshot dibaca.`),
            });
            continue;
        }

        sumber[item] = mentah;
    }

    return {
        status: gagal.length ? 'tidak_lengkap' : 'ok',
        lengkap: gagal.length === 0,
        kunci: Object.keys(sumber).sort(),
        sumber,
        gagal,
    };
}

function sidikSnapshot(snapshot) {
    const bagian = [];

    for (const kunci of snapshot.kunci) {
        bagian.push(kunci, snapshot.sumber[kunci]);
    }

    return sidik(...bagian);
}

function kunciSumberBackupValid(kunci) {
    return (
        typeof kunci === 'string' &&
        (kunci.startsWith(PREFIX_LAMA) ||
            (kunci.startsWith(PREFIX_SOUORDER) &&
                !kunci.startsWith(PREFIX_BACKUP)))
    );
}

export function bacaBackup(storage, kunci, opsi = {}) {
    const { untukStore = false } = opsi;
    const hasil = bacaJsonAman(storage, kunci);

    if (!hasil.ok) {
        return {
            status: hasil.status,
            ok: false,
            kunci,
            galat:
                hasil.galat ??
                new Error(`Backup "${kunci}" tidak dapat dibaca.`),
        };
    }

    if (!hasil.ada) {
        return {
            status: 'tidak_ada',
            ok: false,
            kunci,
            galat: new Error(`Backup "${kunci}" tidak ditemukan.`),
        };
    }

    const nilai = hasil.nilai;

    if (!adalahObjek(nilai)) {
        return {
            status: 'tidak_valid',
            ok: false,
            kunci,
            galat: new Error(`Backup "${kunci}" harus berupa objek.`),
        };
    }

    if (nilai.versi !== undefined && nilai.versi !== 1) {
        return {
            status: 'versi_tidak_dikenal',
            ok: false,
            kunci,
            galat: new Error(`Versi backup "${kunci}" tidak dikenal.`),
        };
    }

    if (!adalahObjek(nilai.sumber)) {
        return {
            status: 'sumber_tidak_valid',
            ok: false,
            kunci,
            galat: new Error(`Sumber backup "${kunci}" harus berupa objek.`),
        };
    }

    const kunciSumber = Object.keys(nilai.sumber).sort();

    for (const item of kunciSumber) {
        if (!kunciSumberBackupValid(item)) {
            return {
                status: 'sumber_tidak_valid',
                ok: false,
                kunci,
                galat: new Error(
                    `Key "${item}" pada backup "${kunci}" tidak diizinkan.`,
                ),
            };
        }

        if (typeof nilai.sumber[item] !== 'string') {
            return {
                status: 'sumber_tidak_valid',
                ok: false,
                kunci,
                galat: new Error(
                    `Nilai key "${item}" pada backup "${kunci}" harus berupa string mentah.`,
                ),
            };
        }
    }

    if (typeof nilai.sidik !== 'string' || !nilai.sidik.trim()) {
        return {
            status: 'sidik_tidak_valid',
            ok: false,
            kunci,
            galat: new Error(`Sidik backup "${kunci}" tidak valid.`),
        };
    }

    const sidikHitung = sidikSnapshot({
        kunci: kunciSumber,
        sumber: nilai.sumber,
    });

    if (sidikHitung !== nilai.sidik) {
        return {
            status: 'sidik_tidak_cocok',
            ok: false,
            kunci,
            sidik: sidikHitung,
            galat: new Error(`Sidik backup "${kunci}" tidak cocok.`),
        };
    }

    if (
        nilai.jumlah_key !== undefined &&
        (!Number.isInteger(nilai.jumlah_key) ||
            nilai.jumlah_key < 0 ||
            nilai.jumlah_key !== kunciSumber.length)
    ) {
        return {
            status: 'jumlah_key_tidak_cocok',
            ok: false,
            kunci,
            sidik: sidikHitung,
            galat: new Error(`Jumlah key backup "${kunci}" tidak cocok.`),
        };
    }

    if (
        nilai.dibuat_pada !== undefined &&
        waktuNilai(nilai.dibuat_pada) === Number.NEGATIVE_INFINITY
    ) {
        return {
            status: 'metadata_tidak_valid',
            ok: false,
            kunci,
            sidik: sidikHitung,
            galat: new Error(`Metadata waktu backup "${kunci}" tidak valid.`),
        };
    }

    let store = null;
    let storeBaca = null;

    if (untukStore) {
        const mentahStore = nilai.sumber[KUNCI_DATA];

        if (typeof mentahStore !== 'string') {
            return {
                status: 'backup_tanpa_store',
                ok: false,
                kunci,
                sidik: sidikHitung,
                galat: new Error(
                    `Backup "${kunci}" tidak memiliki store aktif.`,
                ),
            };
        }

        try {
            storeBaca = JSON.parse(mentahStore);
        } catch (galat) {
            return {
                status: 'store_backup_rusak',
                ok: false,
                kunci,
                sidik: sidikHitung,
                galat,
            };
        }

        const versi = versiStore(storeBaca);

        if (!adalahObjek(storeBaca) || versi === null) {
            return {
                status: 'store_backup_rusak',
                ok: false,
                kunci,
                sidik: sidikHitung,
                galat: new Error(
                    `Store pada backup "${kunci}" bukan objek atau versinya tidak valid.`,
                ),
            };
        }

        if (versi > VERSI_SKEMA) {
            return {
                status: 'store_backup_lebih_baru',
                ok: false,
                kunci,
                sidik: sidikHitung,
                versi,
                galat: new Error(
                    `Store pada backup "${kunci}" lebih baru dari skema yang didukung.`,
                ),
            };
        }

        const validasiStoreBackup = validasiStore(storeBaca, { ketat: false });

        if (!validasiStoreBackup.ok) {
            return {
                status: 'store_backup_tidak_valid',
                ok: false,
                kunci,
                sidik: sidikHitung,
                versi,
                validasi: validasiStoreBackup,
                galat: new Error(
                    `Struktur store pada backup "${kunci}" tidak valid.`,
                ),
            };
        }

        store = storeBaca;
    }

    return {
        status: 'ok',
        ok: true,
        kunci,
        nilai,
        sumber: nilai.sumber,
        kunci_sumber: kunciSumber,
        sidik: sidikHitung,
        jumlah_key: kunciSumber.length,
        versi: nilai.versi ?? null,
        dibuat_pada: nilai.dibuat_pada ?? null,
        store,
    };
}

export function cariBackupValidTerbaru(storage, opsi = {}) {
    const {
        untukStore = true,
        kunciPrioritas = null,
        wajibPrioritas = false,
    } = opsi;

    if (kunciPrioritas !== null) {
        const prioritas = bacaBackup(storage, kunciPrioritas, { untukStore });

        if (prioritas.ok) {
            return {
                status: 'ok',
                ok: true,
                backup: prioritas,
                kandidat: [prioritas],
                dipilih_oleh: 'metadata_marker',
                prioritas_gagal: null,
            };
        }

        if (wajibPrioritas) {
            return {
                status: 'gagal_prioritas',
                ok: false,
                backup: null,
                kandidat: [],
                galat: prioritas.galat,
                prioritas_gagal: prioritas,
            };
        }
    }

    const daftar = bacaDaftarKunci(storage);

    if (!daftar.ok) {
        return {
            status: daftar.status,
            ok: false,
            backup: null,
            kandidat: [],
            galat: daftar.galat,
        };
    }

    const kandidat = [];
    const gagal = [];

    for (const kunci of daftar.kunci) {
        if (!kunci.startsWith(PREFIX_BACKUP)) continue;

        const backup = bacaBackup(storage, kunci, { untukStore });

        if (backup.ok) {
            kandidat.push(backup);
        } else {
            gagal.push(backup);
        }
    }

    kandidat.sort((kiri, kanan) => {
        const waktuKiri =
            waktuNilai(kiri.dibuat_pada) === Number.NEGATIVE_INFINITY
                ? Number.NEGATIVE_INFINITY
                : waktuNilai(kiri.dibuat_pada);
        const waktuKanan =
            waktuNilai(kanan.dibuat_pada) === Number.NEGATIVE_INFINITY
                ? Number.NEGATIVE_INFINITY
                : waktuNilai(kanan.dibuat_pada);

        if (waktuKiri !== waktuKanan) return waktuKanan - waktuKiri;

        return kanan.kunci.localeCompare(kiri.kunci);
    });

    if (!kandidat.length) {
        return {
            status: 'tidak_ada',
            ok: false,
            backup: null,
            kandidat: [],
            gagal,
            galat: new Error(
                'Tidak ada backup valid yang dapat digunakan untuk restore.',
            ),
            prioritas_gagal:
                kunciPrioritas !== null
                    ? bacaBackup(storage, kunciPrioritas, { untukStore })
                    : null,
        };
    }

    return {
        status: 'ok',
        ok: true,
        backup: kandidat[0],
        kandidat,
        dipilih_oleh: 'fallback_terbaru_valid',
        prioritas_gagal:
            kunciPrioritas !== null
                ? bacaBackup(storage, kunciPrioritas, { untukStore })
                : null,
        gagal,
    };
}

function hapusMentahTerverifikasi(storage, kunci, percobaan = 2) {
    if (!storage || typeof storage.removeItem !== 'function') {
        return {
            ok: false,
            galat: new Error('Storage tidak mendukung penghapusan key.'),
        };
    }

    const maks = batasPercobaan(percobaan);
    let galat = null;

    for (let ke = 1; ke <= maks; ke += 1) {
        try {
            storage.removeItem(kunci);

            if (storage.getItem(kunci) === null) {
                return { ok: true, percobaan: ke };
            }
        } catch (error) {
            galat = error;
        }
    }

    return {
        ok: false,
        galat: galat ?? new Error(`Gagal menghapus key "${kunci}".`),
    };
}

function rollbackMentah(storage, sebelum, daftarKunci, percobaan = 2) {
    const gagal = [];

    for (const kunci of [...daftarKunci].reverse()) {
        const nilaiAwal = sebelum.get(kunci);

        if (nilaiAwal === null) {
            const hapus = hapusMentahTerverifikasi(storage, kunci, percobaan);

            if (!hapus.ok) {
                gagal.push({
                    kunci,
                    operasi: 'hapus',
                    galat: hapus.galat,
                });
            }

            continue;
        }

        const tulis = tulisMentahTerverifikasi(
            storage,
            kunci,
            nilaiAwal,
            percobaan,
        );

        if (!tulis.ok) {
            gagal.push({
                kunci,
                operasi: 'tulis_ulang',
                galat: tulis.galat,
            });
        }
    }

    return {
        ok: gagal.length === 0,
        gagal,
    };
}

export function pulihkanDariBackup({
    storage,
    backupKey = null,
    sekarang = new Date(),
    retry = 2,
} = {}) {
    if (
        !storage ||
        typeof storage.getItem !== 'function' ||
        typeof storage.setItem !== 'function'
    ) {
        return {
            status: 'storage_tidak_tersedia',
            ok: false,
            alasan: 'Storage tidak tersedia atau tidak valid.',
        };
    }

    const batasRetry = batasPercobaan(retry);
    const marker = bacaMarker(storage);
    let dipilihOleh = 'parameter';

    if (backupKey !== null && backupKey !== undefined) {
        if (
            typeof backupKey !== 'string' ||
            !backupKey.startsWith(PREFIX_BACKUP)
        ) {
            return {
                status: 'backup_key_tidak_valid',
                ok: false,
                alasan: 'backupKey harus berupa key backup yang valid.',
            };
        }
    }

    let backup;

    if (backupKey !== null && backupKey !== undefined) {
        backup = bacaBackup(storage, backupKey, { untukStore: true });

        if (!backup.ok) {
            return {
                status: 'gagal_backup',
                ok: false,
                alasan: backup.status,
                backup,
                galat: backup.galat,
            };
        }
    } else {
        const kunciPrioritas =
            marker.ok &&
            adalahObjek(marker.nilai) &&
            typeof marker.nilai.backup_key === 'string'
                ? marker.nilai.backup_key
                : null;
        const kandidat = cariBackupValidTerbaru(storage, {
            untukStore: true,
            kunciPrioritas,
        });

        if (!kandidat.ok) {
            return {
                status: 'backup_tidak_tersedia',
                ok: false,
                alasan: kandidat.status,
                backup: null,
                kandidat: kandidat.kandidat ?? [],
                galat: kandidat.galat,
            };
        }

        backup = kandidat.backup;
        dipilihOleh = kandidat.dipilih_oleh;
    }

    const snapshot = kumpulkanSnapshot(storage);

    if (!snapshot.lengkap) {
        return {
            status: 'gagal_snapshot',
            ok: false,
            backup,
            snapshot,
            galat:
                snapshot.galat ??
                new Error('Snapshot keamanan sebelum restore tidak lengkap.'),
        };
    }

    const cadanganKeamanan = buatBackup(
        storage,
        snapshot,
        sekarang,
        batasRetry,
    );

    if (!cadanganKeamanan.ok) {
        return {
            status: 'gagal_backup_keamanan',
            ok: false,
            backup,
            cadangan_keamanan: cadanganKeamanan,
            galat: cadanganKeamanan.galat,
        };
    }

    const target = backup.kunci_sumber.filter(
        (kunci) => kunci !== KUNCI_MIGRASI,
    );

    if (backup.sumber[KUNCI_MIGRASI] !== undefined) {
        target.push(KUNCI_MIGRASI);
    }

    const sebelum = new Map();

    for (const kunci of target) {
        try {
            sebelum.set(kunci, storage.getItem(kunci));
        } catch (galat) {
            return {
                status: 'gagal_baca_sebelum_restore',
                ok: false,
                kunci,
                backup,
                cadangan_keamanan: cadanganKeamanan,
                galat,
            };
        }
    }

    const disentuh = [];
    let kegagalan = null;
    let markerAkhir = null;

    for (const kunci of target) {
        disentuh.push(kunci);
        const tulis = tulisMentahTerverifikasi(
            storage,
            kunci,
            backup.sumber[kunci],
            batasRetry,
        );

        if (!tulis.ok) {
            kegagalan = {
                kunci,
                status: tulis.status ?? 'gagal_tulis',
                galat: tulis.galat,
            };
            break;
        }
    }

    if (!kegagalan) {
        for (const kunci of target) {
            let nilaiSekarang;

            try {
                nilaiSekarang = storage.getItem(kunci);
            } catch (galat) {
                kegagalan = {
                    kunci,
                    status: 'gagal_verifikasi',
                    galat,
                };
                break;
            }

            if (nilaiSekarang !== backup.sumber[kunci]) {
                kegagalan = {
                    kunci,
                    status: 'gagal_verifikasi',
                    galat: new Error(
                        `Key "${kunci}" tidak cocok setelah restore.`,
                    ),
                };
                break;
            }
        }
    }

    if (!kegagalan) {
        markerAkhir = bacaMarker(storage);

        if (backup.sumber[KUNCI_MIGRASI] !== undefined) {
            if (!markerAkhir.ok) {
                kegagalan = {
                    kunci: KUNCI_MIGRASI,
                    status: 'marker_tidak_valid',
                    galat:
                        markerAkhir.galat ??
                        new Error('Marker hasil restore tidak valid.'),
                };
            } else {
                const jumlahMarker = periksaJumlahMarker(
                    markerAkhir.nilai,
                    backup.store,
                );

                if (!jumlahMarker.ok) {
                    const beda = jumlahMarker.beda
                        .map(
                            (item) =>
                                `${item.field}=${item.aktual} (marker ${item.diharapkan})`,
                        )
                        .join(', ');

                    kegagalan = {
                        kunci: KUNCI_MIGRASI,
                        status: 'marker_jumlah_tidak_cocok',
                        galat: new Error(
                            `Jumlah marker tidak cocok: ${beda}.`,
                        ),
                    };
                }
            }
        } else if (
            !markerAkhir.ok &&
            (markerAkhir.ada || markerAkhir.status === 'gagal_baca')
        ) {
            kegagalan = {
                kunci: KUNCI_MIGRASI,
                status: 'marker_tidak_valid',
                galat:
                    markerAkhir.galat ??
                    new Error('Marker yang tersisa setelah restore tidak valid.'),
            };
        }
    }

    if (kegagalan) {
        const rollback = rollbackMentah(
            storage,
            sebelum,
            disentuh,
            batasRetry,
        );

        return {
            status: 'gagal_pulihkan',
            ok: false,
            alasan: kegagalan.status,
            backup,
            cadangan_keamanan: cadanganKeamanan,
            dipulihkan: disentuh,
            rollback_ok: rollback.ok,
            rollback_gagal: rollback.gagal,
            marker: markerAkhir?.nilai ?? null,
            marker_ok: markerAkhir?.ok ?? null,
            marker_galat: markerAkhir?.galat ?? null,
            marker_backup_ok: markerAkhir?.backup_ok ?? false,
            galat: kegagalan.galat,
        };
    }

    return {
        status: 'dipulihkan',
        ok: true,
        backup,
        backup_key: backup.kunci,
        dipilih_oleh: dipilihOleh,
        cadangan_keamanan: cadanganKeamanan,
        dipulihkan: target,
        rollback_ok: null,
        rollback_gagal: [],
        store: backup.store,
        perlu_migrasi:
            adalahObjek(backup.store) &&
            versiStore(backup.store) !== VERSI_SKEMA,
        marker: markerAkhir.nilai ?? null,
        marker_ok: markerAkhir.ok ? true : null,
        marker_backup_ok: markerAkhir.backup_ok,
    };
}

function buatNamaBackup(storage, sekarang) {
    const dasar = `${PREFIX_BACKUP}${waktuIso(sekarang).replace(/[:.]/g, '-')}`;
    let nama = dasar;
    let nomor = 2;

    for (;;) {
        const cek = bacaJsonAman(storage, nama);

        if (cek.status === 'tidak_ada') {
            return { status: 'ok', ok: true, nama };
        }

        if (cek.status === 'gagal_baca') {
            return { status: 'gagal_baca', ok: false, galat: cek.galat };
        }

        nama = `${dasar}-${nomor}`;
        nomor += 1;
    }
}

export function buatBackup(storage, snapshot, sekarang = new Date(), percobaan = 2) {
    if (!snapshot || !Array.isArray(snapshot.kunci) || !snapshot.sumber) {
        return { ok: false, status: 'snapshot_tidak_valid', galat: new Error('Snapshot backup tidak valid.') };
    }

    if (snapshot.lengkap !== true) {
        return {
            ok: false,
            status: 'snapshot_tidak_lengkap',
            galat: new Error('Snapshot backup tidak lengkap.'),
        };
    }

    if (!snapshot.kunci.length) {
        return { ok: true, kunci: null, kosong: true, sidik: null };
    }

    const hash = sidikSnapshot(snapshot);
    const daftarBackup = bacaDaftarKunci(storage);

    if (!daftarBackup.ok) {
        return { ok: false, status: daftarBackup.status, galat: daftarBackup.galat };
    }

    for (const kunci of daftarBackup.kunci) {
        if (!kunci.startsWith(PREFIX_BACKUP)) continue;

        const lama = bacaJsonAman(storage, kunci);

        if (
            lama.ok &&
            adalahObjek(lama.nilai) &&
            lama.nilai.sidik === hash &&
            adalahObjek(lama.nilai.sumber) &&
            sidikSnapshot({
                kunci: Object.keys(lama.nilai.sumber).sort(),
                sumber: lama.nilai.sumber,
            }) === hash
        ) {
            return {
                ok: true,
                kunci,
                dipakai_ulang: true,
                sidik: hash,
                kosong: false,
            };
        }
    }

    const namaBackup = buatNamaBackup(storage, sekarang);

    if (!namaBackup.ok) {
        return { ok: false, status: 'gagal_nama_backup', galat: namaBackup.galat };
    }

    const kunciBaru = namaBackup.nama;
    const isi = {
        versi: 1,
        dibuat_pada: waktuIso(sekarang),
        sidik: hash,
        jumlah_key: snapshot.kunci.length,
        sumber: snapshot.sumber,
    };
    const tulis = tulisJsonTerverifikasi(storage, kunciBaru, isi, percobaan);

    if (!tulis.ok) {
        return {
            ok: false,
            status: tulis.status ?? 'gagal_tulis',
            galat: tulis.galat,
            kunci: kunciBaru,
        };
    }

    const verifikasi = bacaJsonAman(storage, kunciBaru);

    if (!verifikasi.ok || !adalahObjek(verifikasi.nilai)) {
        return { ok: false, galat: new Error('Backup tidak dapat dibaca ulang.'), kunci: kunciBaru };
    }

    const sumberVerifikasi = adalahObjek(verifikasi.nilai.sumber)
        ? verifikasi.nilai.sumber
        : {};
    const hashVerifikasi = sidikSnapshot({
        kunci: Object.keys(sumberVerifikasi).sort(),
        sumber: sumberVerifikasi,
    });

    if (hashVerifikasi !== hash) {
        return { ok: false, galat: new Error('Isi backup tidak cocok setelah ditulis.'), kunci: kunciBaru };
    }

    return {
        ok: true,
        kunci: kunciBaru,
        dipakai_ulang: false,
        sidik: hash,
        kosong: false,
    };
}

function versiStore(store) {
    if (!adalahObjek(store)) return null;

    if (store.versi === undefined || store.versi === null || store.versi === '') {
        return 1;
    }

    const versi = Number(store.versi);

    return Number.isFinite(versi) && versi >= 0 ? versi : null;
}

function serialisasiStabil(nilai) {
    if (nilai === undefined) return 'undefined';

    if (nilai === null || typeof nilai !== 'object') {
        return JSON.stringify(nilai);
    }

    if (Array.isArray(nilai)) {
        return `[${nilai.map((item) => serialisasiStabil(item)).join(',')}]`;
    }

    const kunci = Object.keys(nilai).sort();

    return `{${kunci
        .map(
            (item) =>
                `${JSON.stringify(item)}:${serialisasiStabil(nilai[item])}`,
        )
        .join(',')}}`;
}

export function tingkatkanStore(store) {
    if (!adalahObjek(store)) {
        return { ok: false, status: 'bukan_objek' };
    }

    const versi = versiStore(store);

    if (versi === null) {
        return { ok: false, status: 'versi_tidak_dikenal' };
    }

    if (versi > VERSI_SKEMA) {
        return { ok: false, status: 'lebih_baru', versi };
    }

    const validasiMentah = validasiStore(store, { ketat: true });
    const lengkap = lengkapiFieldArray(store);
    const hasil = normalisasiStore(lengkap.store);
    const fieldDiinisialisasi = lengkap.field_diinisialisasi ?? [];
    const objekDiinisialisasi = lengkap.objek_diinisialisasi ?? [];

    hasil.versi = VERSI_SKEMA;

    if (hasil.revisi === undefined || hasil.revisi === null || hasil.revisi === '') {
        hasil.revisi = 0;
    } else {
        hasil.revisi = Number(hasil.revisi);
    }

    if (fieldDiinisialisasi.length || objekDiinisialisasi.length) {
        const metaLama = adalahObjek(hasil.meta) ? hasil.meta : {};
        const migrasiLama = adalahObjek(metaLama.migrasi) ? metaLama.migrasi : {};
        const fieldLama = Array.isArray(migrasiLama.field_diinisialisasi)
            ? migrasiLama.field_diinisialisasi
            : [];
        const objekLama = Array.isArray(migrasiLama.objek_diinisialisasi)
            ? migrasiLama.objek_diinisialisasi
            : [];

        hasil.meta = {
            ...metaLama,
            migrasi: {
                ...migrasiLama,
                versi_skema: VERSI_SKEMA,
                field_diinisialisasi: [
                    ...new Set([...fieldLama, ...fieldDiinisialisasi]),
                ],
                objek_diinisialisasi: [
                    ...new Set([...objekLama, ...objekDiinisialisasi]),
                ],
            },
        };
    }

    const validasi = validasiStore(hasil, { ketat: true });

    if (!validasi.ok) {
        return {
            ok: false,
            status: 'tidak_valid',
            validasi,
            store: hasil,
            field_diinisialisasi: fieldDiinisialisasi,
            objek_diinisialisasi: objekDiinisialisasi,
        };
    }

    return {
        ok: true,
        store: hasil,
        versi_lama: versi,
        field_diinisialisasi: fieldDiinisialisasi,
        objek_diinisialisasi: objekDiinisialisasi,
        berubah:
            versi !== VERSI_SKEMA ||
            !validasiMentah.ok ||
            fieldDiinisialisasi.length > 0 ||
            objekDiinisialisasi.length > 0 ||
            serialisasiStabil(store) !== serialisasiStabil(hasil),
    };
}

function terapkanRestoranLokal(store, restoranLokal) {
    if (!adalahObjek(restoranLokal)) return;

    for (const [id, patch] of Object.entries(restoranLokal)) {
        if (!adalahObjek(patch)) continue;

        const indeks = store.restoran.findIndex(
            (restoran) => String(restoran?.id) === String(id),
        );
        const dasar = indeks >= 0 ? store.restoran[indeks] : { id: patch.id ?? id };
        const hasil = normalisasiRestoran({ ...dasar, ...patch });

        if (indeks >= 0) store.restoran[indeks] = hasil;
        else store.restoran.push(hasil);
    }
}

function terapkanMenuLokal(store, menuLokal) {
    if (!adalahObjek(menuLokal)) return;

    for (const [id, menu] of Object.entries(menuLokal)) {
        if (!Array.isArray(menu)) continue;

        const indeks = store.restoran.findIndex(
            (restoran) => String(restoran?.id) === String(id),
        );
        const daftar = menu.map((item) => normalisasiMenu(item));

        if (indeks >= 0) {
            store.restoran[indeks] = normalisasiRestoran({
                ...store.restoran[indeks],
                menu: daftar,
            });
        } else {
            store.meta = {
                ...(adalahObjek(store.meta) ? store.meta : {}),
                menu_tanpa_restoran: {
                    ...(adalahObjek(store.meta?.menu_tanpa_restoran)
                        ? store.meta.menu_tanpa_restoran
                        : {}),
                    [id]: daftar,
                },
            };
        }
    }
}

function migrasiAwal(storage, seedMentah) {
    const store = buatStoreDariSeed(seedMentah);

    const akunLokal = bacaArrayLamaStrict(
        storage,
        'preorderly.pengguna.v1',
    ).map((akun) => normalisasiAkunLokal(akun));

    store.akun_lokal = gabungUnik(akunLokal, kunciAkun, (lama, baru) => ({
        ...lama,
        ...baru,
    }));

    const nonaktifMentah = bacaArrayLamaStrict(
        storage,
        'preorderly.pengguna-nonaktif.v1',
    );
    let nonaktifValid = true;

    for (const item of nonaktifMentah) {
        if (validasiNonaktif(item).galat.length > 0) {
            nonaktifValid = false;
        }
    }

    store.nonaktif = nonaktifValid
        ? gabungUnik(nonaktifMentah, kunciNonaktif, (lama) => lama)
        : nonaktifMentah.slice();

    const kategoriLokal = bacaArrayLamaStrict(
        storage,
        'preorderly.kategori.v1',
    ).map((kategori) => normalisasiKategori(kategori));

    store.kategori = gabungUnik(
        [...store.kategori, ...kategoriLokal],
        kunciKategori,
        (lama, baru) => ({ ...lama, ...baru }),
    );

    const restoranLokal = bacaObjekLamaStrict(
        storage,
        'preorderly.restoran.v1',
    );
    const menuLokal = bacaObjekLamaStrict(storage, 'preorderly.menu.v1');

    pastikanRestoranLokal(restoranLokal, 'preorderly.restoran.v1');
    pastikanMenuLokal(menuLokal, 'preorderly.menu.v1');
    terapkanRestoranLokal(store, restoranLokal);
    terapkanMenuLokal(store, menuLokal);

    const pengaturan = bacaObjekLamaStrict(
        storage,
        'preorderly.pengaturan.v1',
    );

    if (pengaturan !== undefined) {
        store.pengaturan = { ...pengaturan };
    }

    const pengajuanBaru = bacaArrayLamaStrict(
        storage,
        'preorderly.pengajuan.v1',
    ).map((pengajuan) => normalisasiPengajuan(pengajuan));

    const pesananLokal = [];
    const slotLokal = [];
    const notifikasiLokal = [];
    const pengajuanLokal = [];
    const pengirimanLokal = [];
    const ulasanLokal = [];

    const daftarState = bacaDaftarKunci(storage);

    if (!daftarState.ok) {
        const galat = new Error('Daftar key state demo gagal dibaca.');
        galat.kode = daftarState.status;
        galat.asal = daftarState.galat;

        throw galat;
    }

    for (const kunci of daftarState.kunci) {
        if (!kunci.startsWith(PREFIX_DEMO)) continue;

        const pemilikAkun = kunci.slice(PREFIX_DEMO.length) || null;
        const stateBaca = bacaJsonAman(storage, kunci);

        if (stateBaca.status === 'gagal_baca' || stateBaca.status === 'json_rusak') {
            throw galatBacaDataLama(stateBaca, kunci);
        }

        if (!stateBaca.ada) continue;

        if (!adalahObjek(stateBaca.nilai)) {
            throw galatBentukDataLama(kunci, stateBaca.nilai, null, 'objek');
        }

        const stateNilai = stateBaca.nilai;

        pesananLokal.push(
            ...bacaArrayDemoStrict(stateNilai, kunci, 'pesanan').map((pesanan) =>
                normalisasiPesanan(pesanan),
            ),
        );
        slotLokal.push(
            ...bacaArrayDemoStrict(stateNilai, kunci, 'slot').map((slot) =>
                normalisasiSlot(slot),
            ),
        );
        notifikasiLokal.push(
            ...bacaArrayDemoStrict(stateNilai, kunci, 'notifikasi').map((notifikasi) =>
                normalisasiNotifikasi(
                    notifikasi,
                    pemilikAkun === 'tamu' ? null : pemilikAkun,
                ),
            ),
        );
        pengajuanLokal.push(
            ...bacaArrayDemoStrict(stateNilai, kunci, 'pengajuan').map((pengajuan) =>
                normalisasiPengajuan(pengajuan),
            ),
        );
        pengirimanLokal.push(
            ...bacaArrayDemoStrict(stateNilai, kunci, 'pengiriman').map((pengiriman) =>
                normalisasiPengiriman(pengiriman),
            ),
        );
        ulasanLokal.push(
            ...bacaArrayDemoStrict(stateNilai, kunci, 'ulasan').map((ulasan) =>
                normalisasiUlasan(ulasan),
            ),
        );
    }

    store.pesanan = gabungUnik(
        [...store.pesanan, ...pesananLokal],
        kunciPesanan,
        pilihPesanan,
    );
    store.slot = gabungUnik(
        [...store.slot, ...slotLokal],
        kunciSlot,
        pilihSlot,
    );
    store.notifikasi = gabungUnik(
        [...store.notifikasi, ...notifikasiLokal],
        kunciNotifikasi,
        (lama, baru) => (baru?.dibaca === undefined ? lama : baru),
    );
    store.pengajuan = gabungUnik(
        [...store.pengajuan, ...pengajuanBaru, ...pengajuanLokal],
        kunciPengajuan,
        pilihPengajuan,
    );
    store.pengiriman = gabungUnik(
        pengirimanLokal,
        kunciPengiriman,
        pilihPengiriman,
    );
    store.ulasan = gabungUnik(
        [...store.ulasan, ...ulasanLokal],
        kunciUlasan,
        pilihUlasan,
    );

    const hasil = normalisasiStore(store);

    hasil.versi = VERSI_SKEMA;
    hasil.revisi = Number.isFinite(Number(hasil.revisi)) ? Number(hasil.revisi) : 0;

    return hasil;
}

export function validasiMarker(marker) {
    const galat = [];
    const peringatan = [];

    if (!adalahObjek(marker)) {
        return { ok: false, galat: ['Marker bukan objek.'], peringatan };
    }

    if (marker.versi_marker !== undefined) {
        if (
            !angkaFinite(marker.versi_marker) ||
            !Number.isInteger(marker.versi_marker) ||
            marker.versi_marker < 1
        ) {
            galat.push('versi_marker harus berupa bilangan bulat positif.');
        } else if (marker.versi_marker > VERSI_MARKER) {
            galat.push('versi_marker lebih baru dari yang didukung.');
        }
    }

    const versiBaru = marker.versi_baru !== undefined ? marker.versi_baru : marker.versi;

    if (
        !angkaFinite(versiBaru) ||
        !Number.isInteger(versiBaru) ||
        versiBaru !== VERSI_SKEMA
    ) {
        galat.push(`versi_baru harus bernilai ${VERSI_SKEMA}.`);
    }

    if (marker.status !== 'selesai') {
        galat.push('status marker harus "selesai".');
    }

    if (waktuNilai(marker.selesai_pada) === Number.NEGATIVE_INFINITY) {
        galat.push('selesai_pada harus berupa tanggal yang valid.');
    }

    if (typeof marker.mode !== 'string' || !MODE_MARKER_DIKENAL.has(marker.mode)) {
        galat.push('mode marker tidak dikenal.');
    }

    if (marker.versi_lama !== undefined && marker.versi_lama !== null) {
        if (
            !angkaFinite(marker.versi_lama) ||
            !Number.isInteger(marker.versi_lama) ||
            marker.versi_lama < 0
        ) {
            galat.push('versi_lama harus berupa bilangan bulat tidak negatif atau null.');
        }
    }

    if (
        marker.backup_key !== undefined &&
        marker.backup_key !== null &&
        (typeof marker.backup_key !== 'string' ||
            !marker.backup_key.startsWith(PREFIX_BACKUP))
    ) {
        galat.push('backup_key tidak valid.');
    }

    if (marker.jumlah !== undefined) {
        if (!adalahObjek(marker.jumlah)) {
            galat.push('jumlah harus berupa objek.');
        } else {
            for (const [field, nilai] of Object.entries(marker.jumlah)) {
                if (!angkaFinite(nilai) || !Number.isInteger(nilai) || nilai < 0) {
                    galat.push(`jumlah.${field} harus berupa bilangan bulat tidak negatif.`);
                }
            }
        }
    }

    for (const field of ['field_diinisialisasi', 'objek_diinisialisasi']) {
        if (marker[field] === undefined) continue;

        if (!Array.isArray(marker[field]) || marker[field].some((item) => typeof item !== 'string')) {
            galat.push(`${field} harus berupa array string.`);
        }
    }

    return {
        ok: galat.length === 0,
        galat,
        peringatan,
        versi: Number.isInteger(versiBaru) ? versiBaru : null,
    };
}

function periksaBackupMarker(storage, marker) {
    if (!adalahObjek(marker)) {
        return {
            ok: false,
            status: 'marker_tidak_valid',
            backup: null,
            galat: new Error('Marker tidak valid untuk pemeriksaan backup.'),
        };
    }

    if (marker.backup_key === undefined || marker.backup_key === null) {
        return {
            ok: true,
            status: 'tanpa_backup',
            backup: null,
            galat: null,
        };
    }

    const backup = bacaBackup(storage, marker.backup_key);

    return {
        ok: backup.ok,
        status: backup.status,
        backup,
        galat: backup.galat ?? null,
    };
}

function periksaJumlahMarker(marker, store) {
    if (
        !adalahObjek(marker) ||
        !adalahObjek(marker.jumlah) ||
        !adalahObjek(store)
    ) {
        return { ok: true, beda: [] };
    }

    const beda = [];

    for (const [field, nilai] of Object.entries(marker.jumlah)) {
        if (!Array.isArray(store[field])) continue;

        if (store[field].length !== nilai) {
            beda.push({
                field,
                diharapkan: nilai,
                aktual: store[field].length,
            });
        }
    }

    return { ok: beda.length === 0, beda };
}

function infoPerbaikanMarker(markerLama, versi, store) {
    const lama = adalahObjek(markerLama) ? markerLama : {};
    const backupKey =
        typeof lama.backup_key === 'string' &&
        lama.backup_key.startsWith(PREFIX_BACKUP)
            ? lama.backup_key
            : null;
    const versiLama =
        Number.isInteger(lama.versi_lama) && lama.versi_lama >= 0
            ? lama.versi_lama
            : versi;
    const fieldDiinisialisasi = Array.isArray(lama.field_diinisialisasi)
        ? lama.field_diinisialisasi.filter((item) => typeof item === 'string')
        : [];
    const objekDiinisialisasi = Array.isArray(lama.objek_diinisialisasi)
        ? lama.objek_diinisialisasi.filter((item) => typeof item === 'string')
        : [];

    return {
        mode: 'perbaikan_marker',
        versi_lama: versiLama,
        backup_key: backupKey,
        jumlah: jumlahStore(store),
        field_diinisialisasi: fieldDiinisialisasi,
        objek_diinisialisasi: objekDiinisialisasi,
    };
}

function rollbackStoreMentah(storage, mentahAwal, percobaan = 2) {
    if (mentahAwal === null) {
        const hapus = hapusMentahTerverifikasi(storage, KUNCI_DATA, percobaan);

        return {
            ok: hapus.ok,
            aksi: 'hapus',
            gagal: hapus.ok
                ? []
                : [
                      {
                          kunci: KUNCI_DATA,
                          operasi: 'hapus',
                          galat: hapus.galat,
                      },
                  ],
        };
    }

    const tulis = tulisMentahTerverifikasi(
        storage,
        KUNCI_DATA,
        mentahAwal,
        percobaan,
    );

    return {
        ok: tulis.ok,
        aksi: 'tulis_ulang',
        gagal: tulis.ok
            ? []
            : [
                  {
                      kunci: KUNCI_DATA,
                      operasi: 'tulis_ulang',
                      galat: tulis.galat,
                  },
              ],
    };
}

function bacaMarker(storage) {
    const hasil = bacaJsonAman(storage, KUNCI_MIGRASI);

    if (!hasil.ok) {
        return {
            ok: false,
            ada: hasil.ada,
            status: hasil.status,
            nilai: null,
            galat: hasil.galat ?? new Error('Marker migrasi tidak dapat dibaca.'),
            backup: null,
            backup_ok: false,
        };
    }

    const validasi = validasiMarker(hasil.nilai);
    const backup = validasi.ok
        ? periksaBackupMarker(storage, hasil.nilai)
        : { ok: false, status: 'marker_tidak_valid', backup: null, galat: null };

    return {
        ok: validasi.ok,
        ada: hasil.ada,
        status: validasi.ok ? 'ok' : 'tidak_valid',
        nilai: hasil.nilai,
        galat: validasi.ok
            ? null
            : new Error(`Marker migrasi tidak valid: ${validasi.galat.join(' ')}`),
        validasi,
        backup: backup.backup,
        backup_ok: backup.ok,
        backup_galat: backup.galat,
    };
}

function tulisMarker(storage, info, sekarang, percobaan = 2) {
    const isi = {
        ...info,
        versi_marker: VERSI_MARKER,
        versi: VERSI_SKEMA,
        versi_baru: VERSI_SKEMA,
        status: 'selesai',
        selesai_pada: waktuIso(sekarang),
    };
    const validasi = validasiMarker(isi);

    if (!validasi.ok) {
        return {
            ok: false,
            status: 'marker_tidak_valid',
            nilai: isi,
            validasi,
            galat: new Error(`Marker tidak valid: ${validasi.galat.join(' ')}`),
        };
    }

    const tulis = tulisJsonTerverifikasi(storage, KUNCI_MIGRASI, isi, percobaan);

    if (!tulis.ok) {
        return { ...tulis, nilai: isi };
    }

    const baca = bacaMarker(storage);

    return {
        ok: baca.ok,
        status: baca.ok ? 'ok' : baca.status,
        nilai: baca.ok ? baca.nilai : isi,
        galat: baca.galat,
        backup: baca.backup ?? null,
        backup_ok: baca.backup_ok ?? false,
        backup_galat: baca.backup_galat ?? null,
        percobaan: tulis.percobaan,
    };
}

function hasilSukses(status, store, backup, marker, tambahan = {}) {
    return {
        status,
        store,
        backup,
        marker_ok: marker.ok,
        marker: marker.nilai,
        galat_marker: marker.ok ? null : marker.galat ?? null,
        marker_backup_ok: marker.backup_ok ?? false,
        marker_backup_galat: marker.backup_galat ?? null,
        ...tambahan,
    };
}

export function migrasiData({
    storage,
    seedMentah = {},
    sekarang = new Date(),
    paksa = false,
    konfirmasi = null,
    retry = 2,
} = {}) {
    if (
        !storage ||
        typeof storage.getItem !== 'function' ||
        typeof storage.setItem !== 'function'
    ) {
        return {
            status: 'storage_tidak_tersedia',
            alasan: 'Storage tidak tersedia atau tidak valid.',
        };
    }

    if (paksa && konfirmasi !== KONFIRMASI_PAKSA) {
        return {
            status: 'ditolak',
            alasan: 'Parameter paksa memerlukan konfirmasi eksplisit.',
            konfirmasi_dibutuhkan: KONFIRMASI_PAKSA,
        };
    }

    const batasRetry = batasPercobaan(retry);
    const bacaData = bacaJsonAman(storage, KUNCI_DATA);

    if (bacaData.status === 'gagal_baca') {
        return {
            status: 'gagal_baca_store',
            alasan: 'Store tidak dapat dibaca.',
            galat: bacaData.galat,
        };
    }

    const storeLama = bacaData.ok && adalahObjek(bacaData.nilai) ? bacaData.nilai : null;

    if (storeLama) {
        const versi = versiStore(storeLama);

        if (versi === null) {
            return { status: 'versi_tidak_dikenal', store: storeLama };
        }

        if (versi > VERSI_SKEMA) {
            return {
                status: 'lebih_baru',
                versi,
                versi_didukung: VERSI_SKEMA,
                store: storeLama,
            };
        }

        if (versi === VERSI_SKEMA) {
            const naik = tingkatkanStore(storeLama);

            if (!naik.ok) {
                return {
                    status: naik.status === 'lebih_baru' ? 'lebih_baru' : 'tidak_valid',
                    store: storeLama,
                    alasan: naik.status,
                    validasi: naik.validasi ?? null,
                };
            }

            const fieldDiinisialisasi = naik.field_diinisialisasi ?? [];
            const objekDiinisialisasi = naik.objek_diinisialisasi ?? [];
            const adaInisialisasi =
                fieldDiinisialisasi.length > 0 || objekDiinisialisasi.length > 0;
            const perluTulis = naik.berubah || adaInisialisasi;
            const modeMarker = paksa
                ? 'tulis_ulang'
                : adaInisialisasi
                  ? 'inisialisasi_field'
                  : 'normalisasi';
            const statusSukses = paksa
                ? 'ditulis_ulang'
                : adaInisialisasi
                  ? 'diinisialisasi'
                  : 'dinormalisasi';
            const marker = bacaMarker(storage);
            const jumlahMarker = periksaJumlahMarker(marker.nilai, storeLama);

            if (!paksa && !perluTulis) {
                if (marker.ok && jumlahMarker.ok) {
                    return {
                        status: 'sudah',
                        store: storeLama,
                        backup: null,
                        marker_ok: true,
                        marker: marker.nilai,
                        galat_marker: null,
                        marker_backup_ok: marker.backup_ok,
                        marker_backup_galat: marker.backup_galat,
                        marker_jumlah_ok: true,
                    };
                }

                const perbaikan = tulisMarker(
                    storage,
                    infoPerbaikanMarker(marker.nilai, versi, storeLama),
                    sekarang,
                    batasRetry,
                );

                if (!perbaikan.ok) {
                    return {
                        status: 'gagal_perbaikan_marker',
                        store: storeLama,
                        backup: null,
                        marker_ok: false,
                        marker: perbaikan.nilai ?? null,
                        galat_marker: perbaikan.galat ?? null,
                        marker_backup_ok: false,
                        marker_backup_galat: null,
                        galat: perbaikan.galat ?? null,
                        percobaan: perbaikan.percobaan ?? batasRetry,
                    };
                }

                return {
                    status: 'marker_diperbaiki',
                    store: storeLama,
                    backup: null,
                    marker_ok: true,
                    marker: perbaikan.nilai,
                    galat_marker: null,
                    marker_backup_ok: perbaikan.backup_ok ?? false,
                    marker_backup_galat: perbaikan.backup_galat ?? null,
                    marker_jumlah_ok: true,
                    diperbaiki: true,
                    percobaan: perbaikan.percobaan,
                };
            }

            const snapshot = kumpulkanSnapshot(storage);

            if (!snapshot.lengkap) {
                return {
                    status: 'gagal_snapshot',
                    store: storeLama,
                    snapshot,
                    galat: snapshot.galat ?? new Error('Snapshot backup tidak lengkap.'),
                };
            }

            const backup = buatBackup(storage, snapshot, sekarang, batasRetry);

            if (!backup.ok) {
                return { status: 'gagal_backup', store: storeLama, backup, galat: backup.galat };
            }

            const tulis = tulisJsonTerverifikasi(
                storage,
                KUNCI_DATA,
                naik.store,
                batasRetry,
            );

            if (!tulis.ok) {
                const rollback = rollbackStoreMentah(
                    storage,
                    bacaData.mentah,
                    batasRetry,
                );

                return {
                    status: 'gagal_tulis',
                    store: storeLama,
                    backup,
                    galat: tulis.galat,
                    percobaan: tulis.percobaan,
                    rollback_ok: rollback.ok,
                    rollback_gagal: rollback.gagal,
                };
            }

            const markerBaru = tulisMarker(
                storage,
                {
                    mode: modeMarker,
                    versi_lama: versi,
                    backup_key: backup.kunci,
                    jumlah: jumlahStore(naik.store),
                    field_diinisialisasi: fieldDiinisialisasi,
                    objek_diinisialisasi: objekDiinisialisasi,
                },
                sekarang,
                batasRetry,
            );

            if (!markerBaru.ok) {
                return hasilSukses(
                    'berhasil_tanpa_marker',
                    naik.store,
                    backup,
                    markerBaru,
                    {
                        galat: markerBaru.galat,
                        marker_galat: true,
                        field_diinisialisasi: fieldDiinisialisasi,
                        objek_diinisialisasi: objekDiinisialisasi,
                        percobaan: tulis.percobaan,
                    },
                );
            }

            return hasilSukses(
                statusSukses,
                naik.store,
                backup,
                markerBaru,
                {
                    versi_lama: versi,
                    field_diinisialisasi: fieldDiinisialisasi,
                    objek_diinisialisasi: objekDiinisialisasi,
                    percobaan: tulis.percobaan,
                },
            );
        }

        const naik = tingkatkanStore(storeLama);

        if (!naik.ok) {
            return {
                status: 'gagal_upgrade',
                store: storeLama,
                alasan: naik.status,
                validasi: naik.validasi ?? null,
            };
        }

        const snapshot = kumpulkanSnapshot(storage);

        if (!snapshot.lengkap) {
            return {
                status: 'gagal_snapshot',
                store: storeLama,
                snapshot,
                galat: snapshot.galat ?? new Error('Snapshot backup tidak lengkap.'),
            };
        }

        const backup = buatBackup(storage, snapshot, sekarang, batasRetry);

        if (!backup.ok) {
            return { status: 'gagal_backup', store: storeLama, backup, galat: backup.galat };
        }

        const tulis = tulisJsonTerverifikasi(storage, KUNCI_DATA, naik.store, batasRetry);

        if (!tulis.ok) {
            const rollback = rollbackStoreMentah(
                storage,
                bacaData.mentah,
                batasRetry,
            );

            return {
                status: 'gagal_tulis',
                store: storeLama,
                backup,
                galat: tulis.galat,
                percobaan: tulis.percobaan,
                rollback_ok: rollback.ok,
                rollback_gagal: rollback.gagal,
            };
        }

        const fieldDiinisialisasi = naik.field_diinisialisasi ?? [];
        const objekDiinisialisasi = naik.objek_diinisialisasi ?? [];
        const marker = tulisMarker(
            storage,
            {
                mode: 'upgrade',
                versi_lama: versi,
                backup_key: backup.kunci,
                jumlah: jumlahStore(naik.store),
                field_diinisialisasi: fieldDiinisialisasi,
                objek_diinisialisasi: objekDiinisialisasi,
            },
            sekarang,
            batasRetry,
        );

        if (!marker.ok) {
            return hasilSukses(
                'berhasil_tanpa_marker',
                naik.store,
                backup,
                marker,
                {
                    galat: marker.galat,
                    marker_galat: true,
                    versi_lama: versi,
                    field_diinisialisasi: fieldDiinisialisasi,
                    objek_diinisialisasi: objekDiinisialisasi,
                    percobaan: tulis.percobaan,
                },
            );
        }

        return hasilSukses(
            'upgrade',
            naik.store,
            backup,
            marker,
            {
                versi_lama: versi,
                field_diinisialisasi: fieldDiinisialisasi,
                objek_diinisialisasi: objekDiinisialisasi,
                percobaan: tulis.percobaan,
            },
        );
    }

    const snapshot = kumpulkanSnapshot(storage);

    if (!snapshot.lengkap) {
        return {
            status: 'gagal_snapshot',
            snapshot,
            galat: snapshot.galat ?? new Error('Snapshot backup tidak lengkap.'),
            alasan_baca: bacaData.status,
        };
    }

    const backup = buatBackup(storage, snapshot, sekarang, batasRetry);

    if (!backup.ok) {
        return { status: 'gagal_backup', backup, galat: backup.galat };
    }

    const markerAwal = bacaMarker(storage);
    const kunciPrioritas =
        markerAwal.ok &&
        adalahObjek(markerAwal.nilai) &&
        typeof markerAwal.nilai.backup_key === 'string'
            ? markerAwal.nilai.backup_key
            : null;
    const kandidat = cariBackupValidTerbaru(storage, {
        untukStore: true,
        kunciPrioritas,
    });
    const alasanStore = !bacaData.ada
        ? 'store_hilang'
        : bacaData.status === 'json_rusak'
          ? 'store_rusak'
          : 'store_bukan_objek';

    if (kandidat.ok) {
        return {
            status: 'pemulihan_tersedia',
            ok: false,
            alasan: alasanStore,
            alasan_baca: bacaData.status,
            store: null,
            backup,
            pemulihan: kandidat.backup,
            backup_key: kandidat.backup.kunci,
            kandidat: kandidat.kandidat,
            dipilih_oleh: kandidat.dipilih_oleh,
            cadangan_keamanan: backup,
            snapshot,
            marker: markerAwal.nilai ?? null,
            marker_ok: markerAwal.ok,
        };
    }

    const adaDataLama = snapshot.kunci.some((kunci) =>
        kunci.startsWith(PREFIX_LAMA),
    );

    if (!adaDataLama && (bacaData.ada || markerAwal.ada)) {
        return {
            status: 'pemulihan_tidak_tersedia',
            ok: false,
            alasan: 'data_tidak_dapat_dipulihkan',
            alasan_baca: bacaData.status,
            store: null,
            backup,
            kandidat: [],
            cadangan_keamanan: backup,
            snapshot,
            marker: markerAwal.nilai ?? null,
            marker_ok: markerAwal.ok,
            galat: kandidat.galat ?? null,
        };
    }

    let store;

    try {
        store = migrasiAwal(storage, seedMentah);
    } catch (galat) {
        if (
            galat?.kode === 'gagal_baca' ||
            galat?.kode === 'json_rusak' ||
            galat?.kode === 'bentuk_tidak_valid'
        ) {
            return {
                status: 'gagal_data_lama_rusak',
                backup,
                kunci: galat.kunci ?? null,
                field: galat.field ?? null,
                alasan: galat.kode,
                bentuk: galat.bentuk ?? null,
                galat: galat.asal ?? galat,
            };
        }

        return { status: 'gagal_migrasi', backup, galat };
    }

    const validasi = validasiStore(store, { ketat: true });

    if (!validasi.ok) {
        return { status: 'gagal_validasi', store, backup, validasi };
    }

    const tulis = tulisJsonTerverifikasi(storage, KUNCI_DATA, store, batasRetry);

    if (!tulis.ok) {
        const rollback = rollbackStoreMentah(
            storage,
            bacaData.mentah,
            batasRetry,
        );

        return {
            status: 'gagal_tulis',
            store,
            backup,
            galat: tulis.galat,
            percobaan: tulis.percobaan,
            rollback_ok: rollback.ok,
            rollback_gagal: rollback.gagal,
        };
    }

    const fieldDiinisialisasi = [];
    const objekDiinisialisasi = [];
    const marker = tulisMarker(
        storage,
        {
            mode: bacaData.ada ? 'pulihkan_store_rusak' : 'migrasi_awal',
            versi_lama: null,
            backup_key: backup.kunci,
            jumlah: jumlahStore(store),
            field_diinisialisasi: fieldDiinisialisasi,
            objek_diinisialisasi: objekDiinisialisasi,
        },
        sekarang,
        batasRetry,
    );

    if (!marker.ok) {
        return hasilSukses(
            'berhasil_tanpa_marker',
            store,
            backup,
            marker,
            {
                galat: marker.galat,
                marker_galat: true,
                percobaan: tulis.percobaan,
            },
        );
    }

    return hasilSukses(
        bacaData.ada ? 'cadangan_rusak' : 'berhasil',
        store,
        backup,
        marker,
        { percobaan: tulis.percobaan },
    );
}
