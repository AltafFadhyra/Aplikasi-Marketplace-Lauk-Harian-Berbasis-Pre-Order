<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Seller extends Model
{
    protected $fillable = [
        'user_id', 'store_name', 'slug', 'description', 'business_type',
        'address', 'latitude', 'longitude', 'min_order', 'avg_prep_minutes',
        'max_advance_days', 'bank_name', 'bank_account_number', 'bank_account_name',
        'rating_avg', 'rating_count', 'sold_count', 'status', 'verified_at',
        'is_open', 'opening_hours',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'opening_hours' => 'array',
            'is_open' => 'boolean',
            'verified_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function restaurants(): HasMany
    {
        return $this->hasMany(Restaurant::class);
    }

    public function restaurant(): HasOne
    {
        return $this->hasOne(Restaurant::class);
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }
}
