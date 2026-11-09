<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Category extends Model
{
    protected $fillable = ['name', 'slug', 'icon', 'color', 'sort_order'];

    public function menus(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Menu::class);
    }

    public function restaurants(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Restaurant::class);
    }
}
