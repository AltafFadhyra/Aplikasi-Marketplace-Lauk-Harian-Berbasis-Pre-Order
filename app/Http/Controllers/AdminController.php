<?php

namespace App\Http\Controllers;

use App\Models\DocumentAccessLog;
use App\Models\Order;
use App\Models\RegistrationRequest;
use App\Models\User;
use App\Models\VerificationDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function dashboard()
    {
        return inertia('Admin/Dashboard');
    }

    public function profile()
    {
        return inertia('Admin/Profile');
    }

    public function verifications()
    {
        return inertia('Admin/Verifications');
    }

    public function verificationDetail(int $pengajuan)
    {
        $p = RegistrationRequest::with(['user', 'reviewer'])->findOrFail($pengajuan);
        $dokumen = VerificationDocument::where('user_id', $p->user_id)->first();

        return inertia('Admin/VerificationDetail', [
            'pengajuanId' => $p->id,
            'dokumen' => $dokumen ? [
                'id' => $dokumen->id,
                'nik' => $dokumen->maskedNik(),
                'nama_lengkap' => $dokumen->full_name,
                'tempat_lahir' => $dokumen->birth_place,
                'tanggal_lahir' => $dokumen->birth_date?->translatedFormat('d F Y'),
                'jenis_sertifikat' => $dokumen->certificate_type,
                'nomor_sertifikat' => $dokumen->certificate_number,
                'status' => $dokumen->status,
                'alasan_tolak' => $dokumen->reject_reason,
                'terarsip' => $dokumen->archived_at !== null,
                'disimpan_sampai' => $dokumen->retained_until?->translatedFormat('d F Y'),
            ] : null,
            'riwayatAkses' => $dokumen
                ? DocumentAccessLog::with('accessor')
                    ->where('verification_document_id', $dokumen->id)
                    ->latest()
                    ->limit(20)
                    ->get()
                    ->map(fn ($l) => [
                        'nama' => $l->accessor?->name,
                        'aksi' => $l->action,
                        'alasan' => $l->purpose,
                        'ip' => $l->ip_address,
                        'waktu' => $l->created_at->toIso8601String(),
                    ])
                : [],
        ]);
    }

    public function users()
    {
        return inertia('Admin/Users', [
            'daftarPengguna' => User::orderByDesc('id')->limit(40)->get()
                ->map(fn ($u) => [
                    'id' => $u->id,
                    'nama' => $u->name,
                    'email' => $u->email,
                    'telepon' => $u->phone,
                    'peran' => $u->role,
                    'avatar' => $u->avatar,
                    'terdaftar' => $u->created_at->toIso8601String(),
                ]),
        ]);
    }

    public function restaurants()
    {
        return inertia('Admin/Restaurants');
    }

    public function orders()
    {
        return inertia('Admin/Orders', [
            'semuaPesanan' => Order::with('items')->latest()->limit(30)->get()
                ->map(fn ($o) => [
                    'id' => $o->id,
                    'kode' => $o->order_code,
                    'pembeli' => $o->buyer?->name,
                    'restoran' => $o->restaurant?->name,
                    'status' => $o->status,
                    'total' => $o->total,
                    'metode' => $o->payment_method,
                    'dibuat_pada' => $o->created_at->toIso8601String(),
                ]),
        ]);
    }

    public function categories()
    {
        return inertia('Admin/Categories');
    }

    public function documents()
    {
        return inertia('Admin/Documents');
    }

    public function settings()
    {
        return inertia('Admin/Settings');
    }
}
