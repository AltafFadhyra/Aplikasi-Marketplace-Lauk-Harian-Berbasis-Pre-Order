import { STATUS_PESANAN } from './constants.js';

export const KUNCI_PESANAN_BERSAMA = 'preorderly.pesanan.v1';

export const KUNCI_MIGRASI_PESANAN_BERSAMA = 'preorderly.pesanan.v1.migrasi';

export const PREFIKS_PENYIMPANAN_LAMA = 'preorderly.demo.v1.';

export const VERSI_PESANAN_BERSAMA = 1;

const ALIAS_STATUS = Object.freeze({
    dibayar: 'diproses',
    dikonfirmasi: 'diproses',
    sedang_dimasak: 'diproses',
    siap_diambil: 'siap_diantar',
    dibuat_untuk_kurir: 'siap_diantar',
});

const STATUS_RESMI = new Set(Object.keys(STATUS_PESANAN));

export function adalahObjek(nilai) {
    return nilai !== null && typeof nilai === 'object' && !Array.isArray(nilai);
}

function idTerisi(nilai) {
    return nilai !== undefined && nilai !== null && String(nilai).trim() !== '';
}

function ambilStorage(storage) {
    if (storage !== undefined && storage !== null) return storage;

    try {
        return typeof globalThis === 'undefined' ? null : (globalThis.localStorage ?? null);
    } catch {
        return null;
    }
}

function salinStore(store) {
    return {
        versi: VERSI_PESANAN_BERSAMA,
        pesanan: [...store.pesanan],
        pengiriman: [...store.pengiriman],
    };
}

function sebagaiDaftar(nilai) {
    if (nilai === undefined || nilai === null) return [];

    return Array.isArray(nilai) ? nilai : [nilai];
}

export function buatStoreKosong() {
    return { versi: VERSI_PESANAN_BERSAMA, pesanan: [], pengiriman: [] };
}

export function buatStorePesanan(store = {}) {
    return {
        versi: VERSI_PESANAN_BERSAMA,
        pesanan: Array.isArray(store?.pesanan) ? [...store.pesanan] : [],
        pengiriman: Array.isArray(store?.pengiriman) ? [...store.pengiriman] : [],
    };
}

export function validasiStorePesananBersama(nilai) {
    if (!adalahObjek(nilai)) {
        return { ok: false, status: 'struktur_tidak_valid' };
    }

    if (nilai.versi !== VERSI_PESANAN_BERSAMA) {
        return { ok: false, status: 'versi_tidak_didukung' };
    }

    if (!Array.isArray(nilai.pesanan) || !Array.isArray(nilai.pengiriman)) {
        return { ok: false, status: 'struktur_tidak_valid' };
    }

    for (let i = 0; i < nilai.pesanan.length; i += 1) {
        if (!identitasPesanan(nilai.pesanan[i])) {
            return {
                ok: false,
                status: 'entri_pesanan_tidak_valid',
                jenis: 'pesanan',
                indeks: i,
            };
        }
    }

    for (let i = 0; i < nilai.pengiriman.length; i += 1) {
        if (!identitasPengiriman(nilai.pengiriman[i])) {
            return {
                ok: false,
                status: 'entri_pengiriman_tidak_valid',
                jenis: 'pengiriman',
                indeks: i,
            };
        }
    }

    return { ok: true, status: 'ok' };
}

export function validasiSnapshotAkun(nilai) {
    if (!adalahObjek(nilai)) {
        return { ok: false, status: 'struktur_snapshot_tidak_valid' };
    }

    const daftarField = ['keranjang', 'pesanan', 'slot', 'notifikasi', 'pengajuan', 'pengiriman', 'ulasan'];

    for (const field of daftarField) {
        if (nilai[field] !== undefined && !Array.isArray(nilai[field])) {
            return { ok: false, status: 'field_snapshot_tidak_valid', field };
        }
    }

    if (Array.isArray(nilai.pesanan)) {
        for (let i = 0; i < nilai.pesanan.length; i += 1) {
            if (!identitasPesanan(nilai.pesanan[i])) {
                return {
                    ok: false,
                    status: 'entri_snapshot_tidak_valid',
                    jenis: 'pesanan',
                    indeks: i,
                };
            }
        }
    }

    if (Array.isArray(nilai.pengiriman)) {
        for (let i = 0; i < nilai.pengiriman.length; i += 1) {
            if (!identitasPengiriman(nilai.pengiriman[i])) {
                return {
                    ok: false,
                    status: 'entri_snapshot_tidak_valid',
                    jenis: 'pengiriman',
                    indeks: i,
                };
            }
        }
    }

    return { ok: true, status: 'ok' };
}

export function bacaPesananBersama(storage) {
    const media = ambilStorage(storage);

    if (!media || typeof media.getItem !== 'function') {
        return { ok: false, status: 'storage_tidak_tersedia', data: null, galat: null };
    }

    let mentah;

    try {
        mentah = media.getItem(KUNCI_PESANAN_BERSAMA);
    } catch (galat) {
        return { ok: false, status: 'gagal_baca', data: null, galat };
    }

    if (mentah === null || mentah === undefined) {
        return { ok: true, status: 'kosong', data: buatStoreKosong(), galat: null };
    }

    let nilai;

    try {
        nilai = JSON.parse(mentah);
    } catch (galat) {
        return { ok: false, status: 'json_rusak', data: null, galat };
    }

    const validasi = validasiStorePesananBersama(nilai);

    if (!validasi.ok) {
        return { ok: false, status: validasi.status, data: null, galat: null };
    }

    return { ok: true, status: 'ok', data: buatStorePesanan(nilai), galat: null };
}

export function tulisPesananBersama(store, storage) {
    const validasi = validasiStorePesananBersama(store);

    if (!validasi.ok) {
        return { ok: false, status: validasi.status, galat: null };
    }

    const media = ambilStorage(storage);

    if (!media || typeof media.setItem !== 'function') {
        return { ok: false, status: 'storage_tidak_tersedia', galat: null };
    }

    let teks;

    try {
        teks = JSON.stringify(buatStorePesanan(store));
    } catch (galat) {
        return { ok: false, status: 'gagal_serialisasi', galat };
    }

    try {
        media.setItem(KUNCI_PESANAN_BERSAMA, teks);
    } catch (galat) {
        const nama = galat?.name ?? '';
        const status =
            nama === 'QuotaExceededError' || nama === 'NS_ERROR_DOM_QUOTA_REACHED'
                ? 'kuota_penuh'
                : 'gagal_tulis';

        return { ok: false, status, galat };
    }

    return { ok: true, status: 'tersimpan', galat: null };
}

export function identitasPesanan(pesanan) {
    if (!adalahObjek(pesanan)) return null;

    if (idTerisi(pesanan.id)) return `id:${String(pesanan.id)}`;
    if (idTerisi(pesanan.kode)) return `kode:${String(pesanan.kode)}`;

    return null;
}

export function identitasPengiriman(pengiriman) {
    if (!adalahObjek(pengiriman)) return null;

    if (idTerisi(pengiriman.id)) return `id:${String(pengiriman.id)}`;
    if (idTerisi(pengiriman.pesanan_id)) return `pesanan:${String(pengiriman.pesanan_id)}`;

    return null;
}

export function normalisasiStatus(status) {
    if (typeof status !== 'string' || !status) return status;
    if (STATUS_RESMI.has(status)) return status;

    return ALIAS_STATUS[status] ?? status;
}

export function normalisasiPesanan(pesanan) {
    if (!adalahObjek(pesanan)) return pesanan;

    const status = normalisasiStatus(pesanan.status);

    if (status === pesanan.status) return { ...pesanan };

    const hasil = { ...pesanan, status };

    if (!idTerisi(hasil.status_asal)) {
        hasil.status_asal = pesanan.status;
    }

    return hasil;
}

function waktuNilai(nilai) {
    if (typeof nilai !== 'string' || !nilai.trim()) return null;

    const waktu = Date.parse(nilai);

    return Number.isFinite(waktu) ? waktu : null;
}

function waktuTerakhirTimeline(pesanan) {
    if (!Array.isArray(pesanan?.timeline)) return null;

    let terakhir = null;

    for (const item of pesanan.timeline) {
        if (!adalahObjek(item)) continue;

        const waktu = waktuNilai(item.pada);

        if (waktu !== null && (terakhir === null || waktu > terakhir)) {
            terakhir = waktu;
        }
    }

    return terakhir;
}

export function bandingkanPesanan(a, b) {
    const kandidatA = [
        waktuNilai(a?.diperbarui_pada) ?? Number.NEGATIVE_INFINITY,
        waktuNilai(a?.dibuat_pada) ?? Number.NEGATIVE_INFINITY,
        waktuTerakhirTimeline(a) ?? Number.NEGATIVE_INFINITY,
    ];
    const kandidatB = [
        waktuNilai(b?.diperbarui_pada) ?? Number.NEGATIVE_INFINITY,
        waktuNilai(b?.dibuat_pada) ?? Number.NEGATIVE_INFINITY,
        waktuTerakhirTimeline(b) ?? Number.NEGATIVE_INFINITY,
    ];

    for (let i = 0; i < kandidatA.length; i += 1) {
        if (kandidatA[i] === kandidatB[i]) continue;

        return kandidatA[i] > kandidatB[i] ? 1 : -1;
    }

    return 0;
}

export function adalahPesananSeed(pesanan) {
    return pesanan?.simulated === true || pesanan?.asal === 'seed';
}

export function pilihPesananTerbaru(lama, baru) {
    const perbandingan = bandingkanPesanan(lama, baru);

    if (perbandingan > 0) return lama;
    if (perbandingan < 0) return baru;

    const seedLama = adalahPesananSeed(lama);
    const seedBaru = adalahPesananSeed(baru);

    if (seedLama === seedBaru) return lama;

    return seedBaru ? lama : baru;
}

export function gabungPesanan(seed = [], bersama = []) {
    const peta = new Map();

    for (const sumber of [seed, bersama]) {
        if (!Array.isArray(sumber)) continue;

        for (const mentah of sumber) {
            if (!adalahObjek(mentah)) continue;

            const kunci = identitasPesanan(mentah);

            if (!kunci) continue;

            const pesanan = normalisasiPesanan(mentah);
            const lama = peta.get(kunci);

            peta.set(kunci, lama ? pilihPesananTerbaru(lama, pesanan) : pesanan);
        }
    }

    return [...peta.values()];
}

function waktuPengiriman(pengiriman) {
    const kandidat = [
        waktuNilai(pengiriman?.diperbarui_pada),
        waktuNilai(pengiriman?.selesai_pada),
        waktuNilai(pengiriman?.diambil_pada),
        waktuNilai(pengiriman?.dibuat_pada),
    ].filter((nilai) => nilai !== null);

    return kandidat.length ? Math.max(...kandidat) : Number.NEGATIVE_INFINITY;
}

function pilihPengirimanTerbaru(lama, baru) {
    return waktuPengiriman(baru) > waktuPengiriman(lama) ? baru : lama;
}

export function gabungPengiriman(...daftar) {
    const peta = new Map();

    for (const sumber of daftar) {
        if (!Array.isArray(sumber)) continue;

        for (const pengiriman of sumber) {
            if (!adalahObjek(pengiriman)) continue;

            const kunci = identitasPengiriman(pengiriman);

            if (!kunci) continue;

            const lama = peta.get(kunci);

            peta.set(kunci, lama ? pilihPengirimanTerbaru(lama, pengiriman) : pengiriman);
        }
    }

    return [...peta.values()];
}

export function upsertPesanan(store, pesanan) {
    const dasar =
        store === undefined || store === null
            ? buatStoreKosong()
            : validasiStorePesananBersama(store).ok
              ? salinStore(store)
              : null;

    if (!dasar) {
        return { ok: false, status: 'struktur_tidak_valid', store: null };
    }

    if (!adalahObjek(pesanan)) {
        return { ok: false, status: 'pesanan_tidak_valid', store: dasar };
    }

    if (!identitasPesanan(pesanan)) {
        return { ok: false, status: 'identitas_tidak_valid', store: dasar };
    }

    const punyaId = idTerisi(pesanan.id);
    const indeks = dasar.pesanan.findIndex((item) => {
        if (!adalahObjek(item)) return false;

        if (punyaId) {
            return idTerisi(item.id) && String(item.id) === String(pesanan.id);
        }

        return (
            !idTerisi(item.id) &&
            idTerisi(item.kode) &&
            String(item.kode) === String(pesanan.kode)
        );
    });

    if (indeks >= 0) {
        dasar.pesanan[indeks] = pesanan;
    } else {
        dasar.pesanan.push(pesanan);
    }

    return {
        ok: true,
        status: indeks >= 0 ? 'diperbarui' : 'ditambahkan',
        store: dasar,
    };
}

export function upsertPengiriman(store, pengiriman) {
    const dasar =
        store === undefined || store === null
            ? buatStoreKosong()
            : validasiStorePesananBersama(store).ok
              ? salinStore(store)
              : null;

    if (!dasar) {
        return { ok: false, status: 'struktur_tidak_valid', store: null };
    }

    if (!adalahObjek(pengiriman)) {
        return { ok: false, status: 'pengiriman_tidak_valid', store: dasar };
    }

    if (!identitasPengiriman(pengiriman)) {
        return { ok: false, status: 'identitas_tidak_valid', store: dasar };
    }

    const punyaId = idTerisi(pengiriman.id);
    const indeks = dasar.pengiriman.findIndex((item) => {
        if (!adalahObjek(item)) return false;

        if (punyaId) {
            return idTerisi(item.id) && String(item.id) === String(pengiriman.id);
        }

        return (
            idTerisi(pengiriman.pesanan_id) &&
            idTerisi(item.pesanan_id) &&
            String(item.pesanan_id) === String(pengiriman.pesanan_id)
        );
    });

    if (indeks >= 0) {
        dasar.pengiriman[indeks] = pengiriman;
    } else {
        dasar.pengiriman.push(pengiriman);
    }

    return {
        ok: true,
        status: indeks >= 0 ? 'diperbarui' : 'ditambahkan',
        store: dasar,
    };
}

export function simpanPerubahanPesananBersama({ pesanan, pengiriman } = {}, storage) {
    const baca = bacaPesananBersama(storage);

    if (!baca.ok) {
        return { ok: false, status: baca.status, data: null, galat: baca.galat };
    }

    let store = baca.data;

    for (const item of sebagaiDaftar(pesanan)) {
        const hasil = upsertPesanan(store, item);

        if (!hasil.ok) {
            return { ok: false, status: hasil.status, data: null, galat: null };
        }

        store = hasil.store;
    }

    for (const item of sebagaiDaftar(pengiriman)) {
        const hasil = upsertPengiriman(store, item);

        if (!hasil.ok) {
            return { ok: false, status: hasil.status, data: null, galat: null };
        }

        store = hasil.store;
    }

    const tulis = tulisPesananBersama(store, storage);

    if (!tulis.ok) {
        return { ok: false, status: tulis.status, data: null, galat: tulis.galat };
    }

    return { ok: true, status: 'tersimpan', data: store, galat: null };
}

export function simpanPesananBersama(pesanan, storage) {
    return simpanPerubahanPesananBersama({ pesanan: [pesanan] }, storage);
}

export function simpanPengirimanBersama(pengiriman, storage) {
    return simpanPerubahanPesananBersama({ pengiriman: [pengiriman] }, storage);
}

export function filterPesananUntukPeran(pesanan = [], sesi = null) {
    const daftar = Array.isArray(pesanan) ? pesanan : [];

    if (!sesi) return [];
    if (sesi.peran === 'admin') return daftar;

    if (sesi.peran === 'pembeli') {
        return daftar.filter((p) => String(p?.pembeli_id) === String(sesi.id));
    }

    if (sesi.peran === 'penjual') {
        return sesi.restoran_id == null
            ? []
            : daftar.filter((p) => String(p?.restoran_id) === String(sesi.restoran_id));
    }

    if (sesi.peran === 'kurir') {
        return daftar.filter(
            (p) =>
                String(p?.kurir_id) === String(sesi.id) ||
                ['diproses', 'siap_diantar'].includes(p?.status),
        );
    }

    return [];
}

export function filterPengirimanUntukPeran(pengiriman = [], sesi = null, pesananTerlihat = []) {
    const daftar = Array.isArray(pengiriman) ? pengiriman : [];

    if (!sesi) return [];
    if (sesi.peran === 'admin') return daftar;

    if (sesi.peran === 'kurir') {
        return daftar.filter((p) => String(p?.kurir_id) === String(sesi.id));
    }

    if (sesi.peran !== 'pembeli' && sesi.peran !== 'penjual') return [];

    const idPesanan = new Set(
        (Array.isArray(pesananTerlihat) ? pesananTerlihat : []).map((p) => String(p?.id)),
    );

    return daftar.filter((p) => idPesanan.has(String(p?.pesanan_id)));
}

export function hidrasiPesananBersama({
    seedPesanan = [],
    seedPengiriman = [],
    pesananBersama = [],
    pengirimanBersama = [],
    pesananSnapshot = [],
    pengirimanSnapshot = [],
    sesi = null,
} = {}) {
    const pesananGabungan = gabungPesanan(
        gabungPesanan(seedPesanan, pesananBersama),
        pesananSnapshot,
    );
    const pengirimanGabungan = gabungPengiriman(
        gabungPengiriman(seedPengiriman, pengirimanBersama),
        pengirimanSnapshot,
    );
    const pesanan = filterPesananUntukPeran(pesananGabungan, sesi);
    const pengiriman = filterPengirimanUntukPeran(pengirimanGabungan, sesi, pesanan);

    return { pesanan, pengiriman };
}

function daftarKunciLama(media) {
    if (typeof media.length !== 'number' || typeof media.key !== 'function') {
        return { ok: false, status: 'storage_tidak_tersedia', kunci: [] };
    }

    const daftar = [];

    try {
        for (let i = 0; i < media.length; i += 1) {
            const kunci = media.key(i);

            if (typeof kunci === 'string' && kunci.startsWith(PREFIKS_PENYIMPANAN_LAMA)) {
                daftar.push(kunci);
            }
        }
    } catch (galat) {
        return { ok: false, status: 'gagal_baca_daftar_lama', kunci: [], galat };
    }

    return { ok: true, status: 'ok', kunci: daftar };
}

function bacaMarkerMigrasi(media) {
    let mentah;

    try {
        mentah = media.getItem(KUNCI_MIGRASI_PESANAN_BERSAMA);
    } catch (galat) {
        return { ok: false, status: 'gagal_baca_marker', selesai: false, data: null, galat };
    }

    if (mentah === null || mentah === undefined) {
        return { ok: true, status: 'belum', selesai: false, data: null };
    }

    let nilai;

    try {
        nilai = JSON.parse(mentah);
    } catch {
        return { ok: true, status: 'marker_rusak', selesai: false, data: null };
    }

    if (adalahObjek(nilai) && nilai.versi === VERSI_PESANAN_BERSAMA && nilai.selesai === true) {
        return { ok: true, status: 'selesai', selesai: true, data: nilai };
    }

    return { ok: true, status: 'marker_rusak', selesai: false, data: null };
}

function bacaDataLama(media, kunci) {
    let mentah;

    try {
        mentah = media.getItem(kunci);
    } catch (galat) {
        return { ok: false, status: 'gagal_baca_lama', kunci, galat };
    }

    if (mentah === null || mentah === undefined) {
        return { ok: true, status: 'kosong', kunci, data: { pesanan: [], pengiriman: [] } };
    }

    let nilai;

    try {
        nilai = JSON.parse(mentah);
    } catch (galat) {
        return { ok: false, status: 'json_lama_rusak', kunci, galat };
    }

    if (!adalahObjek(nilai)) {
        return { ok: false, status: 'struktur_lama_tidak_valid', kunci };
    }

    const pesanan = nilai.pesanan ?? [];
    const pengiriman = nilai.pengiriman ?? [];

    if (!Array.isArray(pesanan) || !Array.isArray(pengiriman)) {
        return { ok: false, status: 'struktur_lama_tidak_valid', kunci };
    }

    for (const item of pesanan) {
        if (!identitasPesanan(item)) {
            return { ok: false, status: 'entri_lama_tidak_valid', kunci, jenis: 'pesanan' };
        }
    }

    for (const item of pengiriman) {
        if (!identitasPengiriman(item)) {
            return { ok: false, status: 'entri_lama_tidak_valid', kunci, jenis: 'pengiriman' };
        }
    }

    return { ok: true, status: 'ok', kunci, data: { pesanan, pengiriman } };
}

function samaStore(a, b) {
    return JSON.stringify(buatStorePesanan(a)) === JSON.stringify(buatStorePesanan(b));
}

export function migrasiPesananLama(storage) {
    const media = ambilStorage(storage);

    if (
        !media ||
        typeof media.getItem !== 'function' ||
        typeof media.setItem !== 'function' ||
        typeof media.key !== 'function' ||
        typeof media.length !== 'number'
    ) {
        return { ok: false, status: 'storage_tidak_tersedia', data: null, galat: null };
    }

    const marker = bacaMarkerMigrasi(media);

    if (!marker.ok) {
        return { ok: false, status: marker.status, data: null, galat: marker.galat };
    }

    const awal = bacaPesananBersama(media);

    if (marker.selesai) {
        if (!awal.ok) {
            return { ok: false, status: awal.status, data: null, galat: awal.galat };
        }

        if (awal.status === 'ok') {
            return {
                ok: true,
                status: 'sudah_selesai',
                data: awal.data,
                ringkasan: marker.data,
                galat: null,
            };
        }
    }

    if (!awal.ok) {
        return { ok: false, status: awal.status, data: null, galat: awal.galat };
    }

    const daftar = daftarKunciLama(media);

    if (!daftar.ok) {
        return { ok: false, status: daftar.status, data: null, galat: daftar.galat };
    }

    const pesananLama = [];
    const pengirimanLama = [];

    for (const kunci of daftar.kunci) {
        const hasil = bacaDataLama(media, kunci);

        if (!hasil.ok) {
            return {
                ok: false,
                status: hasil.status,
                data: null,
                kunci: hasil.kunci,
                jenis: hasil.jenis ?? null,
                galat: hasil.galat ?? null,
            };
        }

        pesananLama.push(...hasil.data.pesanan.filter((pesanan) => !adalahPesananSeed(pesanan)));
        pengirimanLama.push(...hasil.data.pengiriman);
    }

    const store = buatStorePesanan({
        pesanan: gabungPesanan(awal.data.pesanan, pesananLama),
        pengiriman: gabungPengiriman(awal.data.pengiriman, pengirimanLama),
    });
    const tulis = tulisPesananBersama(store, media);

    if (!tulis.ok) {
        return { ok: false, status: tulis.status, data: null, galat: tulis.galat };
    }

    const verifikasi = bacaPesananBersama(media);

    if (!verifikasi.ok || !samaStore(verifikasi.data, store)) {
        return {
            ok: false,
            status: 'verifikasi_gagal',
            data: null,
            galat: verifikasi.galat ?? null,
        };
    }

    const ringkasan = {
        versi: VERSI_PESANAN_BERSAMA,
        selesai: true,
        selesai_pada: new Date().toISOString(),
        jumlah_key_lama: daftar.kunci.length,
        jumlah_pesanan: store.pesanan.length,
        jumlah_pengiriman: store.pengiriman.length,
    };

    if (marker.selesai) {
        return {
            ok: true,
            status: 'dipulihkan',
            data: store,
            ringkasan: marker.data,
            galat: null,
        };
    }

    try {
        media.setItem(KUNCI_MIGRASI_PESANAN_BERSAMA, JSON.stringify(ringkasan));
    } catch (galat) {
        return {
            ok: false,
            status: 'gagal_tulis_marker',
            data: store,
            ringkasan,
            galat,
        };
    }

    return { ok: true, status: 'selesai', data: store, ringkasan, galat: null };
}
