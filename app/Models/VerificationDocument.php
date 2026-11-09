<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Dokumen identitas & sertifikat reintegrasi.
 *
 * Catatan keamanan: seluruh berkas disimpan di disk privat
 * (storage/app/private/documents) dan dienkripsi. Tidak pernah
 * diekspos lewat tautan publik. Akses dicatat pada audit log.
 */
class VerificationDocument extends Model
{
    protected $fillable = [
        'user_id', 'role', 'nik', 'full_name', 'birth_place', 'birth_date',
        'ktp_path', 'selfie_path', 'certificate_type', 'certificate_number',
        'certificate_path', 'business_path', 'vehicle_path', 'sim_path',
        'status', 'reject_reason', 'verified_by', 'verified_at',
        'archived_at', 'retained_until',
    ];

    protected $hidden = ['nik'];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'verified_at' => 'datetime',
            'archived_at' => 'datetime',
            'retained_until' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function accessLogs(): HasMany
    {
        return $this->hasMany(DocumentAccessLog::class);
    }

    public function maskedNik(): string
    {
        $nik = preg_replace('/\D/', '', $this->nik);

        return strlen($nik) >= 8 ? substr($nik, 0, 4).'•••••••'.substr($nik, -4) : $nik;
    }
}
