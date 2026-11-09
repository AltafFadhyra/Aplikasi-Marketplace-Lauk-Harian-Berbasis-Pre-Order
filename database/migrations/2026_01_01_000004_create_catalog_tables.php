<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('icon', 40)->nullable();
            $table->string('color', 20)->default('powder');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('restaurants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();

            $table->string('address');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);

            $table->unsignedInteger('min_order')->default(10000);
            $table->unsignedInteger('avg_prep_minutes')->default(60);
            $table->boolean('free_shipping')->default(false);

            $table->string('banner')->nullable();
            $table->string('logo')->nullable();

            $table->decimal('rating_avg', 3, 2)->default(0);
            $table->unsignedInteger('rating_count')->default(0);
            $table->unsignedBigInteger('sold_count')->default(0);

            $table->boolean('is_open')->default(true);
            $table->json('opening_hours')->nullable();
            $table->json('highlights')->nullable();
            $table->timestamps();

            $table->index('rating_avg');
            $table->index('is_open');
        });

        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->unsignedInteger('price');
            $table->unsignedInteger('discount_price')->nullable();
            $table->string('image')->nullable();

            // Aturan pre-order
            $table->unsignedInteger('lead_time_minutes')->default(60);
            $table->unsignedInteger('max_daily_qty')->default(20);
            $table->boolean('is_preorder_only')->default(true);
            $table->text('prep_note')->nullable();

            $table->decimal('rating_avg', 3, 2)->default(0);
            $table->unsignedInteger('rating_count')->default(0);
            $table->unsignedBigInteger('sold_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['restaurant_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menus');
        Schema::dropIfExists('restaurants');
        Schema::dropIfExists('categories');
    }
};
