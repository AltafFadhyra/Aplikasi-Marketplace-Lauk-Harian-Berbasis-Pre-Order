<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sellers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('store_name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('business_type')->nullable();

            // Alamat outlet
            $table->string('address');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);

            // Aturan pre-order
            $table->unsignedInteger('min_order')->default(10000);
            $table->unsignedInteger('avg_prep_minutes')->default(60);
            $table->unsignedTinyInteger('max_advance_days')->default(3);

            // rekening pencairan
            $table->string('bank_name')->nullable();
            $table->string('bank_account_number', 40)->nullable();
            $table->string('bank_account_name')->nullable();

            $table->decimal('rating_avg', 3, 2)->default(0);
            $table->unsignedInteger('rating_count')->default(0);
            $table->unsignedBigInteger('sold_count')->default(0);

            $table->enum('status', ['pending', 'approved', 'rejected', 'suspended'])->default('pending')->index();
            $table->timestamp('verified_at')->nullable();
            $table->boolean('is_open')->default(true);
            $table->json('opening_hours')->nullable();
            $table->timestamps();
        });

        Schema::create('couriers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('nik', 16);
            $table->string('vehicle_type');
            $table->string('vehicle_plate', 20);
            $table->string('vehicle_year')->nullable();
            $table->string('sim_number', 40)->nullable();

            $table->decimal('current_latitude', 10, 7)->nullable();
            $table->decimal('current_longitude', 10, 7)->nullable();

            $table->decimal('rating_avg', 3, 2)->default(0);
            $table->unsignedInteger('rating_count')->default(0);
            $table->unsignedInteger('total_deliveries')->default(0);

            $table->boolean('is_available')->default(false);
            $table->enum('status', ['pending', 'approved', 'rejected', 'suspended'])->default('pending')->index();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('couriers');
        Schema::dropIfExists('sellers');
    }
};
