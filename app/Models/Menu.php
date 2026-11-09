<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Menu extends Model
{
    protected $fillable = [
        'restaurant_id', 'category_id', 'name', 'slug', 'description',
        'price', 'discount_price', 'image', 'lead_time_minutes',
        'max_daily_qty', 'is_preorder_only', 'prep_note',
        'rating_avg', 'rating_count', 'sold_count', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'is_preorder_only' => 'boolean',
        ];
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function effectivePrice(): int
    {
        return $this->discount_price ?? $this->price;
    }
}
