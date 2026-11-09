<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Restaurant extends Model
{
    protected $fillable = [
        'seller_id', 'category_id', 'name', 'slug', 'description', 'address',
        'latitude', 'longitude', 'min_order', 'avg_prep_minutes', 'free_shipping',
        'banner', 'logo', 'rating_avg', 'rating_count', 'sold_count',
        'is_open', 'opening_hours', 'highlights',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'is_open' => 'boolean',
            'opening_hours' => 'array',
            'highlights' => 'array',
        ];
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(Seller::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function menus(): HasMany
    {
        return $this->hasMany(Menu::class);
    }

    public function slots(): HasMany
    {
        return $this->hasMany(OrderSlot::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}
