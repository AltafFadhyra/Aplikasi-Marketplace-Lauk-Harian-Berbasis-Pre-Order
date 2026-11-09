<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourierController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\SellerController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes — Preorderly (tahap frontend)
|--------------------------------------------------------------------------
*/

Route::get('/', [PageController::class, 'home'])->name('home');

// ---------------------------------------------------------------- halaman statis
Route::get('/tentang', [PageController::class, 'tentang'])->name('tentang');
Route::get('/kebijakan-privasi', [PageController::class, 'kebijakanPrivasi'])->name('privasi');

// ------------------------------------------------------------------------ auth (public)
Route::prefix('auth')->name('auth.')->group(function () {
    Route::get('/login', [AuthController::class, 'login'])->name('login');
    Route::get('/register', [AuthController::class, 'register'])->name('register');
    Route::get('/daftar-penjual', [AuthController::class, 'registerSeller'])->name('register.penjual');
    Route::get('/daftar-kurir', [AuthController::class, 'registerCourier'])->name('register.kurir');
    Route::get('/lupa-password', [AuthController::class, 'forgotPassword'])->name('lupa');
    Route::get('/verifikasi-otp', [AuthController::class, 'verifyOtp'])->name('otp');
    Route::get('/atur-password-baru', [AuthController::class, 'resetPassword'])->name('password-baru');
    Route::get('/ganti-password', [AuthController::class, 'changePassword'])->name('ganti-password');
    Route::get('/akun-demo', [AuthController::class, 'akunDemo'])->name('akun-demo');
});

// --------------------------------------------------------------------- pembeli
Route::prefix('cari')->name('cari.')->group(function () {
    Route::get('/', [PageController::class, 'search'])->name('index');
    Route::get('/restoran/{slug}', [PageController::class, 'restaurant'])->name('restoran');
    Route::get('/menu/{menu}', [PageController::class, 'menuDetail'])->name('menu');
});

Route::prefix('keranjang')->name('keranjang.')->group(function () {
    Route::get('/', [PageController::class, 'cart'])->name('index');
    Route::get('/checkout', [PageController::class, 'checkout'])->name('checkout');
    Route::get('/sukses', [PageController::class, 'orderSuccess'])->name('sukses');
});

Route::prefix('pesanan')->name('pesanan.')->group(function () {
    Route::get('/', [PageController::class, 'orders'])->name('index');
    Route::get('/{kode}', [PageController::class, 'orderDetail'])->name('detail');
});

Route::get('/notifikasi', [PageController::class, 'notifications'])->name('notifikasi');
Route::get('/profil', [PageController::class, 'profile'])->name('profil');

// --------------------------------------------------------------------- penjual
Route::prefix('seller')->name('seller.')->group(function () {
    Route::get('/', [SellerController::class, 'dashboard'])->name('dashboard');
    Route::get('/pesanan', [SellerController::class, 'orders'])->name('orders');
    Route::get('/pesanan/{kode}', [SellerController::class, 'orderDetail'])->name('order-detail');
    Route::get('/menu', [SellerController::class, 'menus'])->name('menus');
    Route::get('/menu/{menu}/ubah', [SellerController::class, 'menuForm'])->name('menu-form');
    Route::get('/jadwal', [SellerController::class, 'slots'])->name('slots');
    Route::get('/toko', [SellerController::class, 'storeProfile'])->name('toko');
});

// ---------------------------------------------------------------------- kurir
Route::prefix('courier')->name('courier.')->group(function () {
    Route::get('/', [CourierController::class, 'dashboard'])->name('dashboard');
    Route::get('/tersedia', [CourierController::class, 'available'])->name('tersedia');
    Route::get('/pengiriman', [CourierController::class, 'deliveries'])->name('pengiriman');
    Route::get('/pengiriman/{kode}', [CourierController::class, 'deliveryDetail'])->name('detail');
    Route::get('/riwayat', [CourierController::class, 'history'])->name('riwayat');
    Route::get('/profil', [CourierController::class, 'profile'])->name('profil');
});

// ---------------------------------------------------------------------- admin
Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/verifikasi', [AdminController::class, 'verifications'])->name('verifikasi');
    Route::get('/verifikasi/{pengajuan}', [AdminController::class, 'verificationDetail'])->name('verifikasi-detail');
    Route::get('/pengguna', [AdminController::class, 'users'])->name('pengguna');
    Route::get('/restoran', [AdminController::class, 'restaurants'])->name('restoran');
    Route::get('/pesanan', [AdminController::class, 'orders'])->name('pesanan');
    Route::get('/kategori', [AdminController::class, 'categories'])->name('kategori');
    Route::get('/dokumen', [AdminController::class, 'documents'])->name('dokumen');
    Route::get('/pengaturan', [AdminController::class, 'settings'])->name('pengaturan');
    Route::get('/profile', [AdminController::class, 'profile'])->name('profile');
});
