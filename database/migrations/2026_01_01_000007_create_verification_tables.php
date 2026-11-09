<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Pengajuan pendaftaran penjual / kurir sebelum diverifikasi admin.
        Schema::create('registration_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('role', ['penjual', 'kurir']);
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending')->index();
            $table->text('form_data');
            $table->text('admin_note')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });

        // Dokumen identitas & sertifikat. Disimpan terenkripsi di disk privat,
        // tidak pernah dipublikasikan lewat /storage.
        Schema::create('verification_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('role', ['penjual', 'kurir']);
            $table->string('nik', 16);
            $table->string('full_name');
            $table->string('birth_place')->nullable();
            $table->date('birth_date')->nullable();

            // Lokasi berkas (tersimpan di storage/app/private/documents)
            $table->string('ktp_path')->nullable();
            $table->string('selfie_path')->nullable();
            $table->string('certificate_type')->nullable();
            $table->string('certificate_number', 60)->nullable();
            $table->string('certificate_path')->nullable();
            $table->string('business_path')->nullable();
            $table->string('vehicle_path')->nullable();
            $table->string('sim_path')->nullable();

            $table->enum('status', ['pending', 'verified', 'rejected'])->default('pending')->index();
            $table->text('reject_reason')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();

            // Arsip: dokumen tidak dihapus fisik karena dapat dibutuhkan
            // sebagai bukti resolve jika terjadi pelanggaran fatal.
            $table->timestamp('archived_at')->nullable();
            $table->date('retained_until')->nullable();
            $table->timestamps();
        });

        // Audit trail akses dokumen sensitif.
        Schema::create('document_access_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('verification_document_id')->constrained()->cascadeOnDelete();
            $table->foreignId('accessed_by')->constrained('users')->cascadeOnDelete();
            $table->enum('action', ['view', 'download', 'print']);
            $table->string('purpose', 191)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 191)->nullable();
            $table->timestamps();

            $table->index(['verification_document_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_access_logs');
        Schema::dropIfExists('verification_documents');
        Schema::dropIfExists('registration_requests');
    }
};
