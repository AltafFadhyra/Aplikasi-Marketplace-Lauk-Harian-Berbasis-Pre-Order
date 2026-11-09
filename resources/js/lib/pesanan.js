/**
 * Normalisasi kontrak pesanan.
 *
 * Pesanan datang dari dua sumber yang bentuk `alamat`-nya berbeda:
 *   1. Database  (app/Support/DemoData.php) -> { alamat, patokan, latitude, longitude }
 *   2. Lokal     (Checkout -> buatPesanan)  -> { nama, telepon, label, detail, catatan }
 *
 * Sisanya sudah seragam di kedua sumber: `ongkir` integer, ada `ongkir_gratis`,
 * `total` (bukan `grand_total`), `status_bayar`/`sisa_tagihan` (bukan `pembayaran.lunas`),
 * dan `pembeli_nama`/`restoran_nama` berupa string datar (bukan objek).
 *
 * Helper di sini menutup celah itu supaya halaman tidak perlu tahu asal pesanan.
 */

function obj(nilai) {
    return nilai && typeof nilai === 'object' ? nilai : {};
}

export function ongkirNilai(p) {
    const pesanan = obj(p);

    return pesanan.ongkir?.total ?? pesanan.ongkir ?? 0;
}

export function ongkirGratis(p) {
    const pesanan = obj(p);

    return pesanan.ongkir_gratis ?? pesanan.ongkir?.gratis ?? ongkirNilai(pesanan) === 0;
}

export function labelOngkir(p) {
    return ongkirGratis(p) ? 'Gratis' : null;
}

export function totalPesanan(p) {
    const pesanan = obj(p);
    const dasar = pesanan.total ?? pesanan.grand_total;

    if (dasar !== undefined && dasar !== null) return Number(dasar) || 0;

    const biaya = Number(pesanan.subtotal) || 0;

    return biaya + ongkirNilai(pesanan) + (Number(pesanan.biaya_layanan) || 0) - (Number(pesanan.diskon) || 0);
}

export function subTotalPesanan(p) {
    const pesanan = obj(p);

    if (pesanan.subtotal !== undefined && pesanan.subtotal !== null) {
        return Number(pesanan.subtotal) || 0;
    }

    return (pesanan.items ?? []).reduce((jumlah, item) => jumlah + (Number(item.harga) || 0) * (Number(item.qty) || 0), 0);
}

export function sudahLunas(p) {
    const pesanan = obj(p);

    if (pesanan.pembayaran?.lunas) return true;
    if (pesanan.status_bayar === 'lunas') return true;

    // `sisa_tagihan` yang tidak ada belum tentu berarti nol, jadi jangan diasumsikan lunas.
    if (pesanan.sisa_tagihan === null || pesanan.sisa_tagihan === undefined) return false;

    return Number(pesanan.sisa_tagihan) === 0;
}

export function namaPembeli(p) {
    return obj(p).pembeli_nama ?? obj(p).pembeli?.nama ?? 'Pembeli';
}

export function namaRestoran(p) {
    return obj(p).restoran_nama ?? obj(p).restoran?.nama ?? '-';
}

export function teleponPembeli(p) {
    const pesanan = obj(p);

    return pesanan.pembeli_telepon ?? pesanan.pembeli?.telepon ?? obj(pesanan.alamat).telepon ?? '';
}

export function alamatTeks(p) {
    const alamat = obj(obj(p).alamat);

    return alamat.detail ?? alamat.alamat ?? '-';
}

export function alamatPatokan(p) {
    const alamat = obj(obj(p).alamat);

    return alamat.patokan ?? alamat.catatan ?? null;
}

export function alamatNama(p) {
    const alamat = obj(obj(p).alamat);

    return alamat.nama ?? namaPembeli(p);
}

export function alamatLabel(p) {
    const alamat = obj(obj(p).alamat);

    return alamat.label ?? null;
}

export function alamatTelepon(p) {
    return obj(obj(p).alamat).telepon ?? teleponPembeli(p);
}

export function jarakTeks(p) {
    const km = Number(obj(p).jarak_km);

    return Number.isFinite(km) && km > 0 ? `${km} km` : null;
}
