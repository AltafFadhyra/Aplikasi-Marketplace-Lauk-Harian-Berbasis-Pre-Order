<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Courier extends Model
{
    protected $fillable = [
        'user_id', 'nik', 'vehicle_type', 'vehicle_plate', 'vehicle_year',
        'sim_number', 'current_latitude', 'current_longitude',
        'rating_avg', 'rating_count', 'total_deliveries',
        'is_available', 'status', 'verified_at',
    ];

    protected $hidden = ['nik'];

    protected function casts(): array
    {
        return [
            'current_latitude' => 'float',
            'current_longitude' => 'float',
            'is_available' => 'boolean',
            'verified_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(Delivery::class);
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /** NIK disensor saat ditampilkan di antarmuka. */
    public function maskedNik(): string
    {
        $nik = preg_replace('/\D/', '', $this->nik);

        return strlen($nik) >= 8 ? substr($nik, 0, 4).'•••••••'.substr($nik, -4) : $nik;
    }
}
