<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Courier;
use App\Models\Menu;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderSlot;
use App\Models\RegistrationRequest;
use App\Models\Restaurant;
use App\Models\Review;
use App\Models\Seller;
use App\Models\User;
use App\Models\VerificationDocument;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Data demo untuk keperluan presentasi tahap frontend.
 * Seluruh data dibuat statis & realistis agar tampilan Elephant
 * pada saat demo sama dengan kondisi produksi.
 */
class DemoSeeder extends Seeder
{
    private const FOTO_MENU = [
        'menu-0', 'menu-1', 'menu-2', 'menu-3', 'menu-4', 'menu-5', 'menu-6', 'menu-7', 'menu-8',
        'menu-9', 'menu-10', 'menu-11', 'menu-12', 'menu-13', 'menu-14', 'menu-15', 'menu-16', 'menu-17',
        'menu-18', 'menu-19', 'menu-20', 'menu-21', 'menu-22', 'menu-23', 'menu-24', 'menu-25', 'menu-26',
        'menu-28', 'menu-29', 'menu-31', 'menu-32', 'menu-33', 'menu-34', 'menu-35',
    ];

    private const FOTO_BANNER = ['banner-0', 'banner-1', 'banner-2', 'banner-3'];

    private const FOTO_AVATAR = [
        'avatar-0', 'avatar-1', 'avatar-2', 'avatar-3', 'avatar-4',
        'avatar-5', 'avatar-6', 'avatar-7', 'avatar-8', 'avatar-9',
    ];

    public function run(): void
    {
        $this->command->info('Menyiapkan data demo Preorderly...');

        $kategori = $this->seedKategori();
        $akun = $this->seedPengguna();
        $penjual = $this->seedPenjual($akun);
        $restoran = $this->seedRestoran($akun, $penjual, $kategori);
        $this->seedMenu($restoran, $kategori);
        $this->seedSlot($restoran);
        $this->seedPesanan($akun, $restoran);
        $this->seedUlasan($akun, $restoran);
        $this->seedNotifikasi($akun);
        $this->seedPengajuan($akun);

        $this->command->info('Data demo siap. Login demo: buyer@preorderly.id / password');
    }

    private function seedKategori(): array
    {
        $data = [
            ['Nasi & Lauk', 'nasi-lauk', '🍚', 'butter'],
            ['Sup & Soto', 'sup-soto', '🍲', 'powder'],
            ['Ayam', 'ayam', '🍗', 'navy'],
            ['Seafood', 'seafood', '🦐', 'info'],
            ['Sayur & Vegetarian', 'sayur', '🥬', 'sukses'],
            ['Mie & Pasta', 'mie-pasta', '🍜', 'peringatan'],
            ['Manisan', 'manisan', '🍰', 'bahaya'],
            ['Minuman', 'minuman', '🥤', 'netral'],
        ];

        $hasil = [];

        foreach ($data as $i => [$nama, $slug, $ikon, $warna]) {
            $hasil[$slug] = Category::create([
                'name' => $nama,
                'slug' => $slug,
                'icon' => $ikon,
                'color' => $warna,
                'sort_order' => $i,
            ]);
        }

        return $hasil;
    }

    private function seedPengguna(): array
    {
        $password = Hash::make('password');

        $admin = User::create([
            'name' => 'Rina Kusumawardhani',
            'email' => 'admin@preorderly.id',
            'phone' => '081100000001',
            'password' => $password,
            'role' => 'admin',
            'phone_verified_at' => now(),
            'avatar' => '/images/avatars/avatar-0.jpg',
        ]);

        $pembeli = User::create([
            'name' => 'Dewi Anggraini',
            'email' => 'buyer@preorderly.id',
            'phone' => '081200000001',
            'password' => $password,
            'role' => 'pembeli',
            'phone_verified_at' => now(),
            'address' => 'Jl. Melati Raya No. 24, RT 03 / RW 07, Kel.alanine Jaya, Kec. Bekasi Selatan',
            'patokan' => 'Depan Masjid Al-Hikmah, samping warnet',
            'latitude' => -6.2401,
            'longitude' => 106.9144,
            'avatar' => '/images/avatars/avatar-1.jpg',
        ]);

        $pembeli2 = User::create([
            'name' => 'Bagus Pratama',
            'email' => 'bagus@preorderly.id',
            'phone' => '081200000002',
            'password' => $password,
            'role' => 'pembeli',
            'phone_verified_at' => now(),
            'address' => 'Jl. Kenanga Raya No. 8,towergz, Kec. Bekasi Utara',
            'patokan' => 'Samping Clinictogetherfic',
            'latitude' => -6.2512,
            'longitude' => 106.9189,
            'avatar' => '/images/avatars/avatar-2.jpg',
        ]);

        $kurir = User::create([
            'name' => 'Ahmad Fauzi',
            'email' => 'courier@preorderly.id',
            'phone' => '081300000001',
            'password' => $password,
            'role' => 'kurir',
            'phone_verified_at' => now(),
            'address' => 'Jl. Mawar No. 12, Kec. Bekasi Selatan',
            'latitude' => -6.2455,
            'longitude' => 106.9201,
            'avatar' => '/images/avatars/avatar-3.jpg',
        ]);

        // Kurir tambahan
        $kurirLain = [];
        $namaKurir = ['Rizky Maulana', 'Siti Nurhaliza', 'Dimas Anggara', 'Yoga Pratama', 'Eko Susanto'];

        foreach ($namaKurir as $i => $nama) {
            $u = User::create([
                'name' => $nama,
                'email' => 'kurir'.($i + 2).'@preorderly.id',
                'phone' => '0813000000'.str_pad((string) ($i + 10), 2, '0', STR_PAD_LEFT),
                'password' => $password,
                'role' => 'kurir',
                'phone_verified_at' => now(),
                'address' => 'Kec. Bekasi '.($i % 2 === 0 ? 'Selatan' : 'Utara'),
                'latitude' => -6.24 - ($i * 0.004),
                'longitude' => 106.91 + ($i * 0.005),
                'avatar' => '/images/avatars/avatar-'.(($i + 4) % 10).'.jpg',
            ]);

            Courier::create([
                'user_id' => $u->id,
                'nik' => '3273'.str_pad((string) ($i + 2), 2, '0', STR_PAD_LEFT).'0102'.$i.'03'.str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT),
                'vehicle_type' => $i % 3 === 0 ? 'Motor' : 'Sepeda Motor Listrik',
                'vehicle_plate' => 'B '.str_pad((string) (2000 + $i), 4, '0', STR_PAD_LEFT).' '.chr(65 + $i).chr(65 + $i),
                'sim_number' => 'SIM-'.str_pad((string) ($i + 1), 6, '0', STR_PAD_LEFT),
                'rating_avg' => 4.6 + ($i % 3) * 0.1,
                'rating_count' => 40 + ($i * 7),
                'total_deliveries' => 120 + ($i * 35),
                'is_available' => $i < 3,
                'status' => 'approved',
                'verified_at' => now()->subDays(30 + $i),
            ]);

            $kurirLain[] = $u;
        }

        // Pembeli tambahan
        $namaPembeli = [
            'Siti Nurhaliza', 'Andi Wijaya', 'Maya Lestari', 'Fajar Nugroho', 'Intan Permata',
            'Rudi Hartono', 'Lina Marlina', 'Bayu Saputra', 'Nadia Safira', 'Agus Setiawan',
            'Tika Rahma', 'Hendra Gunawan', 'Putri Ayu', 'Rizki Ramadhan', 'Wulan Sari',
            'Galih Wicaksono', 'Nina Marlina', 'Surya Dharma', 'Vina Oktaviani', 'Farhan Akbar',
            'Citra Kirana', 'Dimas Prayoga', 'Ayu Lestari', 'Ilham Maulana', 'Nadia Puspita',
        ];

        foreach ($namaPembeli as $i => $nama) {
            User::create([
                'name' => $nama,
                'email' => 'pembeli'.($i + 1).'@preorderly.id',
                'phone' => '08120000'.str_pad((string) ($i + 10), 4, '0', STR_PAD_LEFT),
                'password' => $password,
                'role' => 'pembeli',
                'phone_verified_at' => now(),
                'address' => 'Jl. Rw '.($i + 1).' No. '.($i + 2).', Kec. Bekasi '.($i % 2 === 0 ? 'Selatan' : 'Timur'),
                'latitude' => -6.23 - (($i % 8) * 0.006),
                'longitude' => 106.90 + (($i % 6) * 0.008),
                'avatar' => '/images/avatars/avatar-'.($i % 10).'.jpg',
            ]);
        }

        return [
            'admin' => $admin,
            'pembeli' => $pembeli,
            'pembeli2' => $pembeli2,
            'kurir' => $kurir,
            'kurirLain' => $kurirLain,
        ];
    }

    private function seedPenjual(array $akun): array
    {
        $daftar = [
            ['Ibu Sari Stadium', 'Kuliner Rumahan', 'Masakan Sunda rumahan dengan bumbu rumahan yang meresap. Dimasak setiap pagi sebelum matahari terbit.', 'approved'],
            ['Dapur Bu Endah', 'Kuliner Rumahan', 'Menu prasmanan harian khas Banten. Dipesan H-1, diantar pagi hari berikutnya.', 'approved'],
            ['Ayam Geprek Mamah Ria', 'Rumah Makan', 'Ayam geprek sambal matah dan nasi campur. Renyah, pedas, dan mengenyangkan.', 'approved'],
            ['Soto Ayam Kadipiro', 'Kuliner Rumahan', 'Soto ayam bragis khas Kalibaru dengan situational kuah kaldu bening.', 'approved'],
            ['Katering MasakanRumahan', 'Katering', 'Katering harian kantor dengan menu berganti setiap hari. Cocok untuk 10–50 pax.', 'approved'],
            ['Nasi Goreng Pak Karno', 'Kuliner Rumahan', 'Nasi goreng kampung dengan bahan segar dan sambal buatan sendiri.', 'approved'],
            ['Seafood Mama Nel', 'Rumah Makan', 'Ikan bakar, cumi, dan udang segar dari pasar pagi. Dipesan sehari sebelumnya.', 'approved'],
            ['Dapur Kak Nisa', 'Kuliner Rumahan', 'Masakan rumahan khas Jawa dengan resep keluarga yang diwariskan turun-temurun.', 'approved'],
            ['Warung Pecel Mampir', 'Kuliner Rumahan', 'Pecel, lalapan, dan sayur freshly buat setiap hari. Tersedia untuk pre-order wilayah sekitar.', 'approved'],
            ['Catering Rasa Nusantara', 'Katering', 'Menu Nusantara untuk acara, arisan, dan rapat. Kapasitas hingga 300 pax.', 'approved'],
            ['Bubur Ayam Pak Hasan', 'Kuliner Rumahan', 'Bubur ayam khas Betawi denganuries santan menggugurkan selera.', 'approved'],
            ['Mie Ayam Bakmi Kakiang', 'Kedai', 'Mie ayam dan bakmi dengan kuah kaldu yang sudahILES proses 8 jam.', 'approved'],
            ['Rujak Buah Bu Tini', 'Kuliner Rumahan', 'Rujak buah segar dengan bumbu khas yang pedas manis.', 'approved'],
            ['Nasi Padang Sederhana', 'Rumah Makan', 'Nasi padang dengan lauk Commit varies setiap hari. Pesan sebelum 20.00 WIB.', 'approved'],
            ['Dapur Nenek Ita', 'Kuliner Rumahan', 'Masakan Sunda CCC dengan processing slow cook 4 jam.', 'approved'],
            ['Goreng Banh Krispi', 'Kuliner Rumahan', 'Gorengan banh, risoles, dan lumpur denganpotential Limited kuota harian.', 'approved'],
        ];

        $hasil = [];

        foreach ($daftar as $i => [$namaToko, $jenis, $deskripsi, $status]) {
            // 3 toko terakhir masih menunggu verifikasi admin
            $isPending = in_array($i, [13, 14, 15], true);
            $user = User::create([
                'name' => explode(' ', $namaToko)[0].' '.$namaToko,
                'email' => 'penjual'.($i + 1).'@preorderly.id',
                'phone' => '08140000'.str_pad((string) ($i + 10), 4, '0', STR_PAD_LEFT),
                'password' => Hash::make('password'),
                'role' => 'penjual',
                'phone_verified_at' => now(),
                'address' => $deskripsi ? 'Kec. Bekasi '.($i % 3 === 0 ? 'Selatan' : 'Utara') : '-',
                'avatar' => '/images/avatars/avatar-'.(($i + 5) % 10).'.jpg',
            ]);

            $user->update(['name' => trim(explode(' ', $namaToko)[1] ?? $namaToko).' '.$namaToko]);

            $seller = Seller::create([
                'user_id' => $user->id,
                'store_name' => $namaToko,
                'slug' => Str::slug($namaToko),
                'description' => $deskripsi,
                'business_type' => $jenis,
                'address' => 'Jl.cribers No. '.($i + 3).', Kec. Bekasi '.($i % 2 === 0 ? 'Selatan' : 'Utara'),
                'latitude' => -6.235 - ($i * 0.0045),
                'longitude' => 106.905 + ($i * 0.006),
                'min_order' => [10000, 15000, 20000, 25000][$i % 4],
                'avg_prep_minutes' => [60, 90, 120, 180][$i % 4],
                'max_advance_days' => 3,
                'bank_name' => ['BCA', 'BRI', 'Mandiri', 'BNI'][($i + 1) % 4],
                'bank_account_number' => '1'.str_pad((string) (234567890 + $i * 13579), 12, '0', STR_PAD_LEFT),
                'bank_account_name' => $namaToko,
                'rating_avg' => round(4.2 + (($i % 8) * 0.1), 2),
                'rating_count' => 20 + ($i * 13),
                'sold_count' => 150 + ($i * 87),
                'status' => $isPending ? 'pending' : $status,
                'verified_at' => $isPending ? null : now()->subDays(60 - $i),
                'is_open' => $i % 6 !== 5,
                'opening_hours' => [
                    'senin' => ['06:00', '20:00'],
                    'selasa' => ['06:00', '20:00'],
                    'rabu' => ['06:00', '20:00'],
                    'kamis' => ['06:00', '20:00'],
                    'jumat' => ['06:00', '21:00'],
                    'sabtu' => ['05:30', '21:00'],
                    'minggu' => ['05:30', '19:00'],
                ],
            ]);

            $hasil[] = ['seller' => $seller, 'user' => $user, 'pending' => $isPending];
        }

        return $hasil;
    }

    private function seedRestoran(array $akun, array $penjual, array $kategori): array
    {
        $hasil = [];
        $slugKategori = array_keys($kategori);
        $highlight = [
            'Masak setiap subuh', 'Bumbu rumahan', 'Tanpa MSG', 'Kemasan higienis',
            'Kapasitas terbatas', 'Pelanggan langganan',
        ];

        foreach ($penjual as $i => $data) {
            $restoran = Restaurant::create([
                'seller_id' => $data['seller']->id,
                'category_id' => $kategori[$slugKategori[$i % count($slugKategori)]]->id,
                'name' => $data['seller']->store_name,
                'slug' => $data['seller']->slug,
                'description' => $data['seller']->description,
                'address' => $data['seller']->address,
                'latitude' => $data['seller']->latitude,
                'longitude' => $data['seller']->longitude,
                'min_order' => $data['seller']->min_order,
                'avg_prep_minutes' => $data['seller']->avg_prep_minutes,
                'free_shipping' => $i % 4 === 0,
                'banner' => '/images/banners/'.self::FOTO_BANNER[$i % count(self::FOTO_BANNER)].'.jpg',
                'logo' => '/images/menus/'.self::FOTO_MENU[$i % count(self::FOTO_MENU)].'.jpg',
                'rating_avg' => $data['seller']->rating_avg,
                'rating_count' => $data['seller']->rating_count,
                'sold_count' => $data['seller']->sold_count,
                'is_open' => $data['seller']->is_open,
                'opening_hours' => $data['seller']->opening_hours,
                'highlights' => array_slice($highlight, $i % 3, 3),
            ]);

            $hasil[] = $restoran;
        }

        return $hasil;
    }

    private function seedMenu(array $restoran, array $kategori): void
    {
        // Kumpulan menu realistis per kategori, dipakai bergiliran antar restoran.
        $koleksi = [
            'Nasi & Lauk' => [
                ['Nasi Goreng Kampung', 28000, 'Nasi goreng khas kampung dengan sambal terasi, ayam suwir, dan acar timun.'],
                ['Nasi Uduk Bakar', 25000, 'Nasi uduk bakar dengan daun pisang, sambal kacang, dan serundeng.'],
                ['Nasi Ayam Suwir', 32000, 'Nasi putih dengan ayam suwir, mi goreng, dan lalapan segar.'],
                ['Nasi Telor Balado', 27000, 'Nasi telur balado khas Minang dengan sambal balado merah pekat.'],
                ['Nasi Pecel Santan', 18000, 'Nasi pecel dengan sambal kacang dan sayur lodeh.'],
            ],
            'Sup & Soto' => [
                ['Soto Ayam Bragis', 24000, 'Soto ayam khas Kalibaru dengan kuah bening gurih danusting.'],
                ['Soto Betawi', 26000, 'Soto Betawi dengan santan kental,  dan potongan daging sapi.'],
                ['Sop Buntut', 34000, 'Sop buntut kerbau dengan kuah bening, Kecap, dan taburan parsley.'],
                ['Sayur Asem', 20000, 'Sayur asem Jawa dengan nanas, tomat, dan kacang meets.'],
                ['Coto Madura', 30000, 'Coto Madura dengan kental bening,oya, dan kerupuk udang.'],
            ],
            'Ayam' => [
                ['Ayam Geprek Sambal Matah', 27000, 'Ayam goreng krispi dengan sambal matah segar dan lalapan.'],
                ['Ayam Bakar Madu', 32000, 'Ayam bakar dengan olesan madu, kental, dan kecap manis.'],
                ['Ayam Woku', 38000, 'Ayam woku khas Ambon dengan bumbu kuning, pala, dan songwriting.'],
                ['Ayam Crispy', 25000, 'Ayam goreng crispy berlapis dengan mayones dan sambal.'],
                ['Ayam Kecap Mentega', 29000, 'Ayam kecap mentega yang manis legit dan gurih.'],
            ],
            'Seafood' => [
                ['Ikan Bakar Sambal Dabu', 42000, 'Ikan kakap bakar dengan sambal dabu-dabu khas Sulawesi.'],
                ['Cumi Goreng Crispy', 38000, 'Cumi goreng crispy dengan mayones dan saus specially rumah.'],
                ['Udang Balado', 45000, 'Udang galah balado dengan Kentang danexecution sambal.'],
                ['Ikan Sambal Matah', 40000, 'Ikan mujair bakar dengan sambal matah dan lalapan.'],
                ['Kerupuk Udang', 15000, 'Kerupuk udanggz yang renyah, cocok sebagai camilan.'],
            ],
            'Sayur & Vegetarian' => [
                ['Sayur Asem Daun Pisang', 19000, 'Sayur asem dengan daun pisang, nanas, dan kecap manis.'],
                ['Capcay Bakso', 22000, 'Capcay bakso dengan moms Entengment dan dimasak migration.'],
                ['Gado-Gado Jakarta', 20000, 'Gado-gado Jakarta Dressing dan Elaborating.'],
                ['Tumis Buncis', 18000, 'Tumis buncis denganmz garlic dan Timing.'],
                ['Sop Bahari', 16000, 'Sop bahari khas/adminISTRATION denganworthington dan Timing.'],
                ['Cakalang Panggang', 26000, 'Cakalang panggang dengan sambal kecap dan lalapan.'],
            ],
            'Mie & Pasta' => [
                ['Mie Ayam Bakso', 22000, 'Mie ayam dengan bakso, pangsit, dan kuah kaldu.'],
                ['Mie Goreng Jawa', 20000, 'Mie goreng khas Jawa dengan telur, ayam, dan Timing.'],
                ['Bakmi Yamin', 25000, 'Bakmi yamin dengan kuah kaldu kental dan siomay.'],
                ['Spageti Bolognese', 28000, 'Spageti bolognese dengan saus tomat dan minced beef.'],
                ['Kwetiau Goreng', 23000, 'Kwetiau goreng dengan seafood dan saus tiram.'],
            ],
            'Manisan' => [
                ['Kue Lapis Legit', 24000, 'Kue lapis legit pandan dengan santan premium.'],
                ['Es Krim Uji', 15000, 'Es krim uji premium dengan cokelat Belgia.'],
                ['Klepon', 12000, 'Klepon ketan kelapa gula merah yang legit.'],
                ['Pukis Cokelat', 14000, 'Pukis cokelat lembut dengan topping tiris.'],
                ['Lupis Ketan', 16000, 'Lupis ketan gula aren dan kelapa parut.'],
            ],
            'Minuman' => [
                ['Es Teh Manis', 6000, 'Es teh manis segar ukuran normal.'],
                ['Jus Alpukat', 18000, 'Jus alpukat manis kental ukuran reguler.'],
                ['Kopi Susu Gula Aren', 20000, 'Kopi susu dengan gula aren premium.'],
                ['Es Teh atau Fruit Tea', 8000, 'Iced tea atau fruit tea pilihan.'],
                ['Es Kelapa Muda', 17000, 'Es kelapa muda langsung dari buah.'],
            ],
        ];

        $kunci = array_keys($koleksi);
        $counter = 0;

        foreach ($restoran as $i => $r) {
            $kategoriToko = $kunci[$i % count($kunci)];
            $semuaMenu = [];

            foreach ($koleksi as $namaKategori => $list) {
                foreach ($list as $m) {
                    $semuaMenu[] = [$m[0], $m[1], $m[2], $namaKategori];
                }
            }

            // Setiap restoran mengambil 5 menu, flicked dari koleksi berbeda
            $mulai = ($i * 5) % count($semuaMenu);
            $terpilih = array_slice($semuaMenu, $mulai, 5 + ($i % 2));

            foreach ($terpilih as $j => [$nama, $harga, $deskripsi, $kat]) {
                $counter++;

                $adaDiskon = ($counter % 7 === 0) && $harga > 20000;

                Menu::create([
                    'restaurant_id' => $r->id,
                    'category_id' => $kategori[$kat]->id ?? null,
                    'name' => $nama,
                    'slug' => Str::slug($nama),
                    'description' => $deskripsi,
                    'price' => $harga,
                    'discount_price' => $adaDiskon ? $harga - 3000 : null,
                    'image' => '/images/menus/'.self::FOTO_MENU[$counter % count(self::FOTO_MENU)].'.jpg',
                    'lead_time_minutes' => [60, 90, 120, 180][($counter + $j) % 4],
                    'max_daily_qty' => [10, 15, 20, 25, 30][$counter % 5],
                    'is_preorder_only' => $counter % 9 !== 0,
                    'prep_note' => $counter % 3 === 0 ? 'Dimasak pagi hari pukul 03.00 WIB' : null,
                    'rating_avg' => round(4.0 + (($counter % 10) / 10), 2),
                    'rating_count' => 5 + ($counter % 60),
                    'sold_count' => 10 + ($counter * 3),
                    'is_active' => $counter % 11 !== 0,
                ]);
            }
        }
    }

    private function seedSlot(array $restoran): void
    {
        $slotDef = [
            ['06:00', '10:00', 'Ambil Pagi', 8],
            ['11:00', '14:00', 'Ambil Siang', 6],
            ['17:00', '20:00', 'Ambil Sore', 10],
        ];

        foreach ($restoran as $i => $r) {
            // Hanya 3 hari ke depan sesuai aturan pre-order
            for ($h = 0; $h < 3; $h++) {
                $tanggal = Carbon::today()->addDays($h);
                $weekday = strtolower($tanggal->translatedFormat('l'));

                foreach ($slotDef as $j => [$mulai, $selesai, $label, $kapasitas]) {
                    $cutoff = Carbon::parse($tanggal->toDateString().' '.$mulai)->subDay()->setTime(21, 0);

                    // Hari ini hanya slot sore/keinsula yang masih bisa dipesan
                    if ($h === 0 && $j === 0) {
                        continue;
                    }

                    OrderSlot::create([
                        'restaurant_id' => $r->id,
                        'date' => $tanggal->toDateString(),
                        'start_time' => $mulai,
                        'end_time' => $selesai,
                        'label' => $label,
                        'capacity' => $kapasitas + ($i % 3) * 2,
                        'taken' => random_int(0, 3),
                        'cutoff_at' => $cutoff,
                        'status' => 'tersedia',
                    ]);
                }
            }
        }
    }

    private function seedPesanan(array $akun, array $restoran): void
    {
        $statuses = [
            Order::STATUS_SELESAI, Order::STATUS_SELESAI, Order::STATUS_SELESAI,
            Order::STATUS_DALAM_PENGIRIMAN, Order::STATUS_DIAMBIL_KURIR,
            Order::STATUS_SIAP_DIANTAR, Order::STATUS_DIPROSES,
            Order::STATUS_MENUNGGU_PEMBAYARAN, Order::STATUS_DIBATALKAN,
        ];

        $pembelis = User::where('role', 'pembeli')->pluck('id', 'name');
        $kurirs = User::where('role', 'kurir')->pluck('id', 'name');
        $namaPembeli = $pembelis->keys()->all();
        $idPembeli = $pembelis->values()->all();
        $namaKurir = $kurirs->keys()->all();
        $idKurir = $kurirs->values()->all();
        $pembeliUtama = $akun['pembeli'];

        $kode = 1000;

        foreach ($restoran as $i => $r) {
            $jumlahPesanan = 3 + ($i % 3);

            for ($k = 0; $k < $jumlahPesanan; $k++) {
                $kode++;
                $status = $statuses[($i + $k) % count($statuses)];
                $idxP = ($i * 2 + $k) % count($idPembeli);
                $slot = OrderSlot::where('restaurant_id', $r->id)->inRandomOrder()->first();
                $menu = Menu::where('restaurant_id', $r->id)->inRandomOrder()->first();

                if (!$menu) {
                    continue;
                }

                $qty = random_int(1, 3);
                $subtotal = $menu->price * $qty;
                $ongkir = 5000 + (2500 * random_int(1, 6));
                $total = $subtotal + $ongkir + 2000;
                $dibuat = now()->subHours(random_int(2, 70));
                $metode = ['qris', 'transfer', 'dp', 'cod'][($i + $k) % 4];

                $alamat = [
                    'alamat' => 'Jl. Melati Raya No. '.(10 + $k).', Kec. Bekasi Selatan',
                    'patokan' => 'Depan masjid',
                    'latitude' => $pembeliUtama->latitude,
                    'longitude' => $pembeliUtama->longitude,
                ];

                $order = Order::create([
                    'order_code' => 'PRD-'.now()->year.'-'.$kode,
                    'buyer_id' => $idPembeli[$idxP],
                    'restaurant_id' => $r->id,
                    'courier_id' => in_array($status, [Order::STATUS_DIAMBIL_KURIR, Order::STATUS_DALAM_PENGIRIMAN], true)
                        ? $idKurir[$i % count($idKurir)]
                        : null,
                    'order_slot_id' => $slot?->id,
                    'subtotal' => $subtotal,
                    'delivery_fee' => $ongkir,
                    'service_fee' => 2000,
                    'discount' => 0,
                    'total' => $total,
                    'status' => $status,
                    'payment_method' => $metode,
                    'payment_status' => $status === Order::STATUS_MENUNGGU_PEMBAYARAN ? 'menunggu' : ($metode === 'cod' ? 'menunggu_di_tempat' : 'lunas'),
                    'paid_at' => $status === Order::STATUS_MENUNGGU_PEMBAYARAN ? null : $dibuat->copy()->addMinutes(3),
                    'eta_at' => $slot ? $slot->batasTanggal() : $dibuat->copy()->addHours(2),
                    'delivered_at' => $status === Order::STATUS_SELESAI ? $dibuat->copy()->addHours(3) : null,
                    'distance_km' => round(random_int(10, 90) / 10, 2),
                    'address_snapshot' => $alamat,
                    'buyer_note' => $k % 3 === 0 ? 'Tolong sambal dilebihkan sedikit ya' : null,
                    'cancel_reason' => $status === Order::STATUS_DIBATALKAN ? 'Salah pilih menu' : null,
                    'created_at' => $dibuat,
                    'updated_at' => $dibuat,
                ]);

                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_id' => $menu->id,
                    'menu_name' => $menu->name,
                    'menu_image' => $menu->image,
                    'price' => $menu->price,
                    'qty' => $qty,
                    'subtotal' => $subtotal,
                    'note' => $k % 4 === 0 ? 'Tanpa sambal' : null,
                ]);

                if ($k % 2 === 0) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'menu_id' => $menu->id,
                        'menu_name' => $menu->name.' (tambahan)',
                        'menu_image' => $menu->image,
                        'price' => $menu->price,
                        'qty' => 1,
                        'subtotal' => $menu->price,
                    ]);
                }
            }
        }
    }

    private function seedUlasan(array $akun, array $restoran): void
    {
        $pembeli = User::where('role', 'pembeli')->pluck('id');
        $komentar = [
            'Masakannya enak banget, bumbunya sampai ke rumah masih wangi.',
            'Porsinya mengenyangkan, worth it dengan harganya. Pasti order lagi!',
            'Komunikasinya responsif, pesanannya datang tepat waktu. Recommended!',
            'Rasanya seperti masak sendiri di rumah. Suka banget.',
            'Lumayan worth it, tapi kuahnya agak kurang. Overall bagus.',
            'Packing rapi, tidak tumpah. Akan pesan yang lain lagi.',
            'Ibu yang masak selalu sabar dan ramah. Mantap!',
            'Enak, tapi agak lama masaknya. Tetap worth it karena rasanya.',
        ];

        $orders = Order::where('status', Order::STATUS_SELESAI)->with('items')->limit(24)->get();

        foreach ($orders as $idx => $order) {
            Review::create([
                'order_id' => $order->id,
                'buyer_id' => $pembeli[$idx % $pembeli->count()],
                'restaurant_id' => $order->restaurant_id,
                'menu_id' => $order->items->first()?->menu_id,
                'rating' => [5, 5, 4, 5, 4, 5, 3, 5][$idx % 8],
                'comment' => $komentar[$idx % count($komentar)],
                'seller_reply' => $idx % 3 === 0,
                'seller_reply_text' => $idx % 3 === 0 ? 'Terima kasih sudah order! Sampai jumpa lagi :)' : null,
                'created_at' => now()->subDays(random_int(1, 20)),
            ]);
        }
    }

    private function seedNotifikasi(array $akun): void
    {
        $daftar = [
            [$akun['pembeli']->id, 'pesanan', 'Pesanan diproses', 'Ibu Sari sedang memulai proses memasak pesanan Anda.', '/orders'],
            [$akun['pembeli']->id, 'pengiriman', 'Kurir dalam perjalanan', 'Ahmad Fauzi sedang menuju alamat Anda.', '/orders'],
            [$akun['pembeli']->id, 'promo', 'Promo Ramadan 25%', 'Gunakan kode MAKANHEMAT untuk diskon 25% hari ini.', '/'],
            [$akun['kurir']->id, 'pesanan', 'Pesanan siap diambil', '3 pesanan siap diantar dari jarak dekat.', '/courier/available'],
            [$akun['admin']->id, 'verifikasi', '3 pengajuan baru', 'Ada 3 pendaftar penjual & kurir yang menunggu verifikasi.', '/admin/verifications'],
            [$akun['admin']->id, 'pesanan', 'Pesanan masuk', 'Pesanan baru worth Rp 285.000 masuk hari ini.', '/admin/orders'],
        ];

        foreach ($daftar as $i => [$userId, $tipe, $judul, $isi, $link]) {
            Notification::create([
                'user_id' => $userId,
                'type' => $tipe,
                'title' => $judul,
                'body' => $isi,
                'link' => $link,
                'read_at' => $i % 3 === 0 ? now()->subHours(5) : null,
                'created_at' => now()->subHours($i * 3 + 1),
            ]);
        }
    }

    private function seedPengajuan(array $akun): void
    {
        $calon = [
            ['penjual', 'Warung Masakan Sunda Anjani', 'Mbak Anjani', '082112223344', 'culinary', 'approved', 12],
            ['kurir', 'Fajar Setiawan', 'Fajar Setiawan', '081298765432', 'courier', 'approved', 8],
            ['penjual', 'Kedai Kopi Kenangan 77', 'Pak Rudi', '081377889900', 'coffee', 'pending', 2],
            ['kurir', 'Dimas Prakoso', 'Dimas Prakoso', '081566667777', 'courier', 'pending', 1],
            ['penjual', 'Dapur Nenek Yuni', 'Nenek Yuni', '081911110000', 'traditional', 'rejected', 5],
        ];

        foreach ($calon as $i => [$role, $namaBadan, $nama, $telepon, $jenis, $status, $hariLalu]) {
            $user = User::create([
                'name' => $nama,
                'email' => 'calon'.($i + 1).'@preorderly.id',
                'phone' => $telepon,
                'password' => Hash::make('password'),
                'role' => $role,
                'phone_verified_at' => now(),
                'address' => 'Kec. Bekasi Selatan, Kota Bekasi',
                'avatar' => '/images/avatars/avatar-'.(($i + 1) % 10).'.jpg',
            ]);

            $formData = $role === 'penjual'
                ? [
                    'store_name' => $namaBadan,
                    'business_type' => $jenis,
                    'nik' => '327301'.str_pad((string) ($i + 1), 10, '0', STR_PAD_LEFT),
                    'address' => 'Jl. Patriot No. '.($i + 5).', Kec. Bekasi Selatan',
                    'bank_name' => 'BRI',
                    'bank_account_number' => '301'.str_pad((string) ($i + 987654), 12, '0', STR_PAD_LEFT),
                    'opening_hours' => '05.00 - 21.00',
                ]
                : [
                    'vehicle_type' => $i % 2 === 0 ? 'Motor' : 'Sepeda Motor Listrik',
                    'vehicle_plate' => 'B 9'.str_pad((string) ($i + 1), 3, '0', STR_PAD_LEFT).' XYZ',
                    'nik' => '327302'.str_pad((string) ($i + 1), 10, '0', STR_PAD_LEFT),
                    'sim_number' => 'SIM-'.str_pad((string) ($i + 1), 6, '0', STR_PAD_LEFT),
                ];

            RegistrationRequest::create([
                'user_id' => $user->id,
                'role' => $role,
                'status' => $status,
                'form_data' => $formData,
                'admin_note' => $status === 'rejected' ? 'Sertifikat higiene kedaluwarsa, mohon unggah ulang yang berlaku.' : null,
                'reviewed_by' => $status !== 'pending' ? $akun['admin']->id : null,
                'reviewed_at' => $status !== 'pending' ? now()->subDays($hariLalu) : null,
                'created_at' => now()->subDays($hariLalu + 1),
            ]);

            VerificationDocument::create([
                'user_id' => $user->id,
                'role' => $role,
                'nik' => $formData['nik'],
                'full_name' => $nama,
                'birth_place' => 'Bekasi',
                'birth_date' => now()->subYears(25 + $i)->format('Y-m-d'),
                'ktp_path' => 'documents/'.$role.'/'.$user->id.'/ktp.jpg',
                'selfie_path' => 'documents/'.$role.'/'.$user->id.'/selfie.jpg',
                'certificate_type' => $role === 'penjual' ? 'Sertifikat Higiene Cuisine' : null,
                'certificate_number' => $role === 'penjual' ? 'SHC-'.str_pad((string) ($i + 1), 5, '0', STR_PAD_LEFT) : null,
                'certificate_path' => $role === 'penjual' ? 'documents/'.$role.'/'.$user->id.'/sertifikat.pdf' : null,
                'vehicle_path' => $role === 'kurir' ? 'documents/'.$role.'/'.$user->id.'/kendaraan.jpg' : null,
                'sim_path' => $role === 'kurir' ? 'documents/'.$role.'/'.$user->id.'/sim.jpg' : null,
                'status' => $status === 'approved' ? 'verified' : $status,
                'reject_reason' => $status === 'rejected' ? 'Sertifikat higiene kedaluwarsa, mohon unggah ulang yang masih berlaku.' : null,
                'verified_by' => $status !== 'pending' ? $akun['admin']->id : null,
                'verified_at' => $status !== 'pending' ? now()->subDays($hariLalu) : null,
                'archived_at' => $status === 'approved' ? now()->subDays($hariLalu) : null,
                'retained_until' => $status === 'approved' ? now()->addYears(5)->format('Y-m-d') : null,
                'created_at' => now()->subDays($hariLalu + 1),
            ]);
        }
    }
}
